import type { ReleasedPikmin, ReleasedState } from '~/types/decor';

const STORAGE_KEY = 'pikmin-bloom-released';
const CURRENT_VERSION = 1;
const CLOUD_SYNC_DEBOUNCE_MS = 15000;
const CLOUD_SYNC_DEBOUNCE_SECONDS = CLOUD_SYNC_DEBOUNCE_MS / 1000;
const CLOUD_LOAD_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const SAVE_TIMEOUT_MS = 10000;
const MAX_SAVE_RETRIES = 3;

let globalSyncTimeout: ReturnType<typeof setTimeout> | null = null;
let globalCountdownInterval: ReturnType<typeof setInterval> | null = null;
let lastCloudLoadTime = 0;
let lastCloudLoadUserId: string | null = null;

type SyncStatus = 'idle' | 'pending' | 'syncing' | 'success' | 'error';

interface ReleasedSyncConflict {
  localRecords: ReleasedPikmin[];
  cloudRecords: ReleasedPikmin[];
  localCount: number;
  cloudCount: number;
}

export function useReleased() {
  const supabase = useSupabaseClient();
  const authStore = useAuthStore();

  // Reactive state
  const releasedState = useState<ReleasedState>('released', () => ({
    records: [],
    lastUpdated: new Date().toISOString(),
    version: CURRENT_VERSION,
  }));

  // Sync UI state
  const syncStatus = useState<SyncStatus>('released-sync-status', () => 'idle');
  const syncCountdown = useState<number>('released-sync-countdown', () => 0);
  const hasPendingChanges = useState<boolean>('released-has-pending', () => false);
  const syncRetryAttempt = useState<number>('released-sync-retry', () => 0);
  const lastSyncedSignature = useState<string | null>('released-last-synced-signature', () => null);
  const syncConflict = useState<ReleasedSyncConflict | null>('released-sync-conflict', () => null);

  // ---- localStorage ----

  const loadFromLocal = () => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ReleasedState;
          releasedState.value = parsed;
        }
      } catch (e) {
        console.error('[Released] Failed to load from localStorage:', e);
      }
    }
  };

  const saveToLocal = () => {
    if (import.meta.client) {
      try {
        releasedState.value.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(releasedState.value));
      } catch (e) {
        console.error('[Released] Failed to save to localStorage:', e);
      }
    }
  };

  // ---- CRUD operations ----

  const addRecord = (record: Omit<ReleasedPikmin, 'id' | 'createdAt'>) => {
    const newRecord: ReleasedPikmin = {
      ...record,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString(),
    };
    releasedState.value.records.unshift(newRecord); // newest first
    saveToLocal();
    scheduleDebouncedSync();
    return newRecord;
  };

  const updateRecord = (id: string, updates: Partial<Omit<ReleasedPikmin, 'id' | 'createdAt'>>) => {
    const idx = releasedState.value.records.findIndex(r => r.id === id);
    if (idx === -1) return false;
    releasedState.value.records[idx] = { ...releasedState.value.records[idx], ...updates } as ReleasedPikmin;
    saveToLocal();
    scheduleDebouncedSync();
    return true;
  };

  const deleteRecord = (id: string) => {
    const idx = releasedState.value.records.findIndex(r => r.id === id);
    if (idx === -1) return false;
    releasedState.value.records.splice(idx, 1);
    saveToLocal();
    scheduleDebouncedSync();
    return true;
  };

  const getRecords = () => releasedState.value.records;
  const getRecordCount = () => releasedState.value.records.length;

  // ---- Debounced cloud sync ----

  const startCountdown = () => {
    syncCountdown.value = CLOUD_SYNC_DEBOUNCE_SECONDS;
    syncStatus.value = 'pending';
    hasPendingChanges.value = true;

    if (globalCountdownInterval) {
      clearInterval(globalCountdownInterval);
      globalCountdownInterval = null;
    }

    globalCountdownInterval = setInterval(() => {
      syncCountdown.value = Math.max(0, syncCountdown.value - 1);
      if (syncCountdown.value <= 0 && globalCountdownInterval) {
        clearInterval(globalCountdownInterval);
        globalCountdownInterval = null;
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (globalCountdownInterval) {
      clearInterval(globalCountdownInterval);
      globalCountdownInterval = null;
    }
    syncCountdown.value = 0;
  };

  const setSyncResult = (status: 'success' | 'error') => {
    syncStatus.value = status;
    hasPendingChanges.value = false;
    syncRetryAttempt.value = 0;
    setTimeout(() => {
      if (syncStatus.value === 'success') {
        syncStatus.value = 'idle';
      }
    }, 3000);
  };

  const withTimeout = <T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`[Released] ${label} timed out after ${ms / 1000}s`));
      }, ms);
      promise.then(
        (val) => { clearTimeout(timer); resolve(val); },
        (err) => { clearTimeout(timer); reject(err); },
      );
    });
  };

  const computeSignature = (records: ReleasedPikmin[]): string => {
    return records
      .map(r => JSON.stringify({
        id: r.id,
        decorItemId: r.decorItemId,
        nickname: r.nickname || '',
        location: r.location || '',
        releasedAt: r.releasedAt || '',
        note: r.note || '',
        createdAt: r.createdAt || '',
      }))
      .sort()
      .join('|');
  };

  const cloneRecords = (records: ReleasedPikmin[]): ReleasedPikmin[] => {
    return records.map(record => ({ ...record }));
  };

  const applyCloudRecords = (records: ReleasedPikmin[]) => {
    releasedState.value.records = cloneRecords(records);
    saveToLocal();
    lastSyncedSignature.value = computeSignature(records);
  };

  const mergeRecordsCloudFirst = (localRecords: ReleasedPikmin[], cloudRecords: ReleasedPikmin[]): ReleasedPikmin[] => {
    const mergedById = new Map<string, ReleasedPikmin>();
    cloudRecords.forEach(record => mergedById.set(record.id, { ...record }));
    localRecords.forEach(record => {
      if (!mergedById.has(record.id)) {
        mergedById.set(record.id, { ...record });
      }
    });

    return Array.from(mergedById.values()).sort((a, b) => {
      return new Date(b.createdAt || b.releasedAt).getTime() - new Date(a.createdAt || a.releasedAt).getTime();
    });
  };

  const attemptSaveToCloud = async (userId: string, records: ReleasedPikmin[]): Promise<void> => {
    const upsertResult = await withTimeout(
      (supabase as any)
        .from('released_pikmin')
        .upsert({
          user_id: userId,
          released_data: records,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        }),
      SAVE_TIMEOUT_MS,
      'Upsert'
    ) as { error: any };

    if (upsertResult?.error) {
      console.warn('[Released] Upsert failed:', upsertResult.error);

      const insertResult = await withTimeout(
        (supabase as any)
          .from('released_pikmin')
          .insert({
            user_id: userId,
            released_data: records,
            updated_at: new Date().toISOString(),
          }),
        SAVE_TIMEOUT_MS,
        'Insert fallback'
      ) as { error: any };

      if (insertResult?.error && insertResult.error.code !== '23505') {
        throw insertResult.error;
      }
    }
  };

  const saveToCloud = async (force = false): Promise<boolean> => {
    const userId = authStore.user.value?.id;
    if (!userId) {
      syncStatus.value = 'idle';
      hasPendingChanges.value = false;
      return false;
    }

    try {
      const records = releasedState.value.records;
      const signature = computeSignature(records);

      if (!force && lastSyncedSignature.value === signature) {
        return true;
      }

      let lastError: unknown = null;
      for (let attempt = 1; attempt <= MAX_SAVE_RETRIES; attempt++) {
        try {
          console.log(`[Released] Saving to cloud (attempt ${attempt}/${MAX_SAVE_RETRIES}) — ${records.length} records`);
          syncRetryAttempt.value = attempt;
          await attemptSaveToCloud(userId, records);

          syncRetryAttempt.value = 0;
          lastSyncedSignature.value = signature;
          console.log('[Released] ✓ Saved to cloud successfully');
          setSyncResult('success');
          return true;
        } catch (err) {
          lastError = err;
          console.warn(`[Released] Attempt ${attempt}/${MAX_SAVE_RETRIES} failed:`, err instanceof Error ? err.message : err);
          if (attempt < MAX_SAVE_RETRIES) {
            await new Promise(r => setTimeout(r, attempt * 1000));
          }
        }
      }

      console.error('[Released] All save attempts failed:', lastError);
      setSyncResult('error');
      return false;
    } catch (e) {
      console.error('[Released] Failed to save to cloud:', e);
      setSyncResult('error');
      return false;
    }
  };

  const scheduleDebouncedSync = () => {
    if (!authStore.isAuthenticated.value) return;

    if (globalSyncTimeout) {
      clearTimeout(globalSyncTimeout);
    }

    startCountdown();

    globalSyncTimeout = setTimeout(async () => {
      globalSyncTimeout = null;
      stopCountdown();
      syncStatus.value = 'syncing';
      await saveToCloud();
    }, CLOUD_SYNC_DEBOUNCE_MS);
  };

  const forceSyncNow = async () => {
    if (globalSyncTimeout) {
      clearTimeout(globalSyncTimeout);
      globalSyncTimeout = null;
    }
    stopCountdown();
    syncStatus.value = 'syncing';
    await saveToCloud(true);
  };

  // ---- Load from cloud ----

  const loadFromCloud = async (force = false) => {
    const userId = authStore.user.value?.id;
    if (!userId) return;

    if (!force && lastCloudLoadUserId === userId && (Date.now() - lastCloudLoadTime) < CLOUD_LOAD_COOLDOWN_MS) {
      console.log(`[Released] Skipping cloud load — last loaded ${Math.round((Date.now() - lastCloudLoadTime) / 1000)}s ago`);
      return;
    }

    console.log('[Released] Loading from cloud for user:', userId);

    try {
      const { data, error } = await (supabase as any)
        .from('released_pikmin')
        .select('released_data')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const cloudRecords = data?.released_data && Array.isArray(data.released_data)
        ? data.released_data as ReleasedPikmin[]
        : [];
      const localRecords = releasedState.value.records;
      const localCount = localRecords.length;
      const localSignature = computeSignature(localRecords);
      const cloudSignature = computeSignature(cloudRecords);

      if (localCount === 0 || localSignature === cloudSignature) {
        applyCloudRecords(cloudRecords);
        syncConflict.value = null;
        console.log(`[Released] ☁️ Loaded ${cloudRecords.length} records from cloud (local had ${localCount})`);
      } else {
        syncConflict.value = {
          localRecords: cloneRecords(localRecords),
          cloudRecords: cloneRecords(cloudRecords),
          localCount,
          cloudCount: cloudRecords.length,
        };
        syncStatus.value = 'idle';
        console.log(`[Released] Sync conflict detected (local: ${localCount}, cloud: ${cloudRecords.length})`);
      }

      lastCloudLoadTime = Date.now();
      lastCloudLoadUserId = userId;
    } catch (e) {
      console.error('[Released] Failed to load from cloud:', e);
    }
  };

  const mergeCloudConflict = async (): Promise<boolean> => {
    if (!syncConflict.value) return false;

    const mergedRecords = mergeRecordsCloudFirst(
      syncConflict.value.localRecords,
      syncConflict.value.cloudRecords,
    );
    releasedState.value.records = mergedRecords;
    saveToLocal();
    syncConflict.value = null;
    syncStatus.value = 'syncing';
    return await saveToCloud(true);
  };

  const discardLocalConflict = async (): Promise<boolean> => {
    if (!syncConflict.value) return false;

    const cloudRecords = cloneRecords(syncConflict.value.cloudRecords);
    applyCloudRecords(cloudRecords);
    syncConflict.value = null;
    syncStatus.value = 'syncing';
    return await saveToCloud(true);
  };

  return {
    // State
    releasedState: readonly(releasedState),
    syncStatus: readonly(syncStatus),
    syncCountdown: readonly(syncCountdown),
    hasPendingChanges: readonly(hasPendingChanges),
    syncRetryAttempt: readonly(syncRetryAttempt),
    syncConflict: readonly(syncConflict),

    // CRUD
    addRecord,
    updateRecord,
    deleteRecord,
    getRecords,
    getRecordCount,

    // Persistence
    loadFromLocal,
    loadFromCloud,
    saveToCloud,
    forceSyncNow,
    scheduleDebouncedSync,
    mergeCloudConflict,
    discardLocalConflict,
  };
}
