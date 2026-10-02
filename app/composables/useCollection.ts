import type {
  CategoryInventorySummary,
  CollectionDetails,
  CollectionEvent,
  CollectionEventSource,
  CollectionInventoryBucket,
  CollectionInventoryItem,
  CollectionState,
  CollectionStats,
  DecorCategoryType,
  PikminType,
  RareDecorProgress,
  RarePointAction,
} from '~/types/decor';
import { useDecorData } from './useDecorData';

const STORAGE_KEY = 'pikmin-bloom-collection';
const CURRENT_VERSION = 2;
const CLOUD_SYNC_DEBOUNCE_MS = 15000;
const CLOUD_SYNC_DEBOUNCE_SECONDS = CLOUD_SYNC_DEBOUNCE_MS / 1000;

// Global timeout registry for debouncing cloud syncs across all component callers
let globalSyncTimeout: ReturnType<typeof setTimeout> | null = null;
let globalCountdownInterval: ReturnType<typeof setInterval> | null = null;

// Cooldown for loadFromCloud to avoid redundant egress
const CLOUD_LOAD_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
let lastCloudLoadTime: number = 0;
let lastCloudLoadUserId: string | null = null;

// Sync status type
type SyncStatus = 'idle' | 'pending' | 'syncing' | 'success' | 'error';
type InventoryCountKey =
  | 'seedlingCount'
  | 'preDecorCount'
  | 'decorCount'
  | 'rareCount'
  | 'releaseNoDecorCount'
  | 'releaseWithDecorCount';

const INVENTORY_COUNT_KEYS: Record<CollectionInventoryBucket, InventoryCountKey> = {
  seedling: 'seedlingCount',
  preDecor: 'preDecorCount',
  decor: 'decorCount',
  rare: 'rareCount',
  releaseNoDecor: 'releaseNoDecorCount',
  releaseWithDecor: 'releaseWithDecorCount',
};

export const RARE_POINT_VALUES: Record<RarePointAction, number> = {
  pluck_seedling: 30,
  pluck_huge_seedling: 200,
  gift_expedition: 200,
  release_no_decor: 5,
  release_with_decor: 20,
  manual_adjustment: 0,
};

const RARE_POINT_ACTION_BY_BUCKET: Partial<Record<CollectionInventoryBucket, RarePointAction>> = {
  preDecor: 'pluck_seedling',
  decor: 'gift_expedition',
  releaseNoDecor: 'release_no_decor',
  releaseWithDecor: 'release_with_decor',
};

export const createEmptyInventoryItem = (): CollectionInventoryItem => ({
  seedlingCount: 0,
  preDecorCount: 0,
  decorCount: 0,
  rareCount: 0,
  releaseNoDecorCount: 0,
  releaseWithDecorCount: 0,
});

export const createEmptyDetails = (): CollectionDetails => ({
  inventory: {},
  rareProgress: {},
  events: [],
});

export const createEventId = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const normalizeCount = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : 0;
};

export const normalizeInventoryItem = (item?: Partial<CollectionInventoryItem> | null): CollectionInventoryItem => ({
  seedlingCount: normalizeCount(item?.seedlingCount),
  preDecorCount: normalizeCount(item?.preDecorCount),
  decorCount: normalizeCount(item?.decorCount),
  rareCount: normalizeCount(item?.rareCount),
  releaseNoDecorCount: normalizeCount(item?.releaseNoDecorCount),
  releaseWithDecorCount: normalizeCount(item?.releaseWithDecorCount),
  updatedAt: typeof item?.updatedAt === 'string' ? item.updatedAt : undefined,
});

export const normalizeRareProgress = (categoryId: string, progress?: Partial<RareDecorProgress> | null): RareDecorProgress => ({
  categoryId,
  points: normalizeCount(progress?.points),
  giftsAvailable: normalizeCount(progress?.giftsAvailable),
  giftsSpent: normalizeCount(progress?.giftsSpent),
  updatedAt: typeof progress?.updatedAt === 'string' ? progress.updatedAt : undefined,
});

export const normalizeDetails = (details?: Partial<CollectionDetails> | null): CollectionDetails => {
  const normalized = createEmptyDetails();

  if (details?.inventory && typeof details.inventory === 'object') {
    Object.entries(details.inventory).forEach(([itemId, item]) => {
      normalized.inventory[itemId] = normalizeInventoryItem(item);
    });
  }

  if (details?.rareProgress && typeof details.rareProgress === 'object') {
    Object.entries(details.rareProgress).forEach(([categoryId, progress]) => {
      normalized.rareProgress[categoryId] = normalizeRareProgress(categoryId, progress);
    });
  }

  if (Array.isArray(details?.events)) {
    normalized.events = details.events.filter(
      (event): event is CollectionEvent =>
        Boolean(event) &&
        typeof event.id === 'string' &&
        typeof event.type === 'string' &&
        typeof event.createdAt === 'string',
    );
  }

  return normalized;
};

export const hasCollectedDecor = (item: CollectionInventoryItem): boolean =>
  item.decorCount + item.rareCount > 0;

export function useCollection() {
  const { getAllDecorItems, getDecorDefinitions, getItemsByCategory } = useDecorData();
  const supabase = useSupabaseClient();
  const authStore = useAuthStore();

  // Reactive collection state
  const collectionState = useState<CollectionState>('collection', () => ({
    collected: {},
    details: createEmptyDetails(),
    lastUpdated: new Date().toISOString(),
    version: CURRENT_VERSION,
  }));

  // Sync status
  const isSyncing = useState<boolean>('collection-syncing', () => false);
  const lastSyncTime = useState<string | null>('collection-last-sync', () => null);

  // Debounced upload UI state
  const syncStatus = useState<SyncStatus>('collection-sync-status', () => 'idle');
  const syncCountdown = useState<number>('collection-sync-countdown', () => 0);
  const hasPendingChanges = useState<boolean>('collection-has-pending', () => false);
  const syncRetryAttempt = useState<number>('collection-sync-retry', () => 0);
  const lastSyncedSignature = useState<string | null>('collection-last-synced-signature', () => null);

  // Get valid DecorItem IDs from current decor.json
  const getValidItemIds = (): Set<string> => {
    return new Set(getAllDecorItems().map(item => item.id));
  };

  const getCategoryIdForItem = (itemId: string): string | undefined => {
    return getAllDecorItems().find(item => item.id === itemId)?.categoryId;
  };

  const getItemBucketForCollectedToggle = (itemId: string): CollectionInventoryBucket => {
    return itemId.toLowerCase().includes('_rare_') ? 'rare' : 'decor';
  };

  const getInventoryTotal = (item: CollectionInventoryItem): number =>
    item.seedlingCount +
    item.preDecorCount +
    item.decorCount +
    item.rareCount +
    item.releaseNoDecorCount +
    item.releaseWithDecorCount;

  const syncCollectedFromDetails = (state: CollectionState): CollectionState => {
    const validIds = getValidItemIds();
    const details = normalizeDetails(state.details);
    const collected: Record<string, boolean> = {};

    Object.entries(state.collected ?? {}).forEach(([itemId, isCollected]) => {
      if (isCollected && validIds.has(itemId)) {
        collected[itemId] = true;
      }
    });

    Object.entries(details.inventory).forEach(([itemId, inventory]) => {
      if (!validIds.has(itemId)) return;
      if (hasCollectedDecor(inventory)) {
        collected[itemId] = true;
      } else {
        delete collected[itemId];
      }
    });

    return {
      ...state,
      collected,
      details,
      version: CURRENT_VERSION,
    };
  };

  const migrateCollectionState = (state?: Partial<CollectionState> | null): CollectionState => {
    const now = new Date().toISOString();
    const validIds = getValidItemIds();
    const details = normalizeDetails(state?.details);
    const legacyCollected = state?.collected && typeof state.collected === 'object'
      ? state.collected
      : {};
    const existingEventIds = new Set(details.events.map(event => event.id));

    Object.entries(legacyCollected).forEach(([itemId, isCollected]) => {
      if (!isCollected || !validIds.has(itemId)) return;

      const current = normalizeInventoryItem(details.inventory[itemId]);
      if (!hasCollectedDecor(current)) {
        const next = {
          ...current,
          decorCount: Math.max(1, current.decorCount),
          updatedAt: now,
        };
        details.inventory[itemId] = next;

        const eventId = `migration-v1-${itemId}`;
        if (!existingEventIds.has(eventId)) {
          details.events.push({
            id: eventId,
            type: 'inventory_adjustment',
            createdAt: now,
            source: 'migration',
            categoryId: getCategoryIdForItem(itemId),
            itemId,
            bucket: 'decor',
            delta: 1,
            previousCount: 0,
            newCount: next.decorCount,
            note: 'Imported from legacy collected_items.',
          });
        }
      }
    });

    const normalized: CollectionState = {
      collected: { ...legacyCollected },
      details,
      lastUpdated: state?.lastUpdated ?? now,
      version: CURRENT_VERSION,
    };

    return syncCollectedFromDetails(normalized);
  };

  const ensureCollectionDetails = (): CollectionDetails => {
    const existingDetails = collectionState.value.details;
    if (existingDetails) return existingDetails;

    const details = createEmptyDetails();
    collectionState.value = {
      ...collectionState.value,
      details,
      version: CURRENT_VERSION,
    };
    return details;
  };

  const updateCollectedCacheForItem = (itemId: string, inventory: CollectionInventoryItem) => {
    if (hasCollectedDecor(inventory)) {
      collectionState.value.collected[itemId] = true;
    } else {
      delete collectionState.value.collected[itemId];
    }
  };

  // Load from localStorage on client side
  const loadCollection = () => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as CollectionState;
          collectionState.value = migrateCollectionState(parsed);
          saveToLocal();
        }
      } catch (e) {
        console.error('Failed to load collection:', e);
      }
    }
  };

  // Save to localStorage
  const saveToLocal = () => {
    if (import.meta.client) {
      try {
        collectionState.value.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collectionState.value));
      } catch (e) {
        console.error('Failed to save collection:', e);
      }
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    syncCountdown.value = CLOUD_SYNC_DEBOUNCE_SECONDS;
    syncStatus.value = 'pending';
    hasPendingChanges.value = true;

    // Clear existing interval
    if (globalCountdownInterval) {
      clearInterval(globalCountdownInterval);
      globalCountdownInterval = null;
    }

    globalCountdownInterval = setInterval(() => {
      syncCountdown.value = Math.max(0, syncCountdown.value - 1);
      if (syncCountdown.value <= 0) {
        if (globalCountdownInterval) {
          clearInterval(globalCountdownInterval);
          globalCountdownInterval = null;
        }
      }
    }, 1000);
  };

  // Stop countdown timer
  const stopCountdown = () => {
    if (globalCountdownInterval) {
      clearInterval(globalCountdownInterval);
      globalCountdownInterval = null;
    }
    syncCountdown.value = 0;
  };

  // Set sync result status and auto-reset after delay
  const setSyncResult = (status: 'success' | 'error') => {
    syncStatus.value = status;
    hasPendingChanges.value = false;
    syncRetryAttempt.value = 0;
    setTimeout(() => {
      // Only reset if status hasn't changed (e.g. user keeps 'error' so they can retry)
      if (syncStatus.value === 'success') {
        syncStatus.value = 'idle';
      }
    }, 3000);
  };

  // Helper: race a promise against a timeout
  const withTimeout = <T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`[Collection] ${label} timed out after ${ms / 1000}s`));
      }, ms);
      promise.then(
        (val) => { clearTimeout(timer); resolve(val); },
        (err) => { clearTimeout(timer); reject(err); },
      );
    });
  };

  const SAVE_TIMEOUT_MS = 10000; // 10 seconds — anything longer is abnormal
  const MAX_SAVE_RETRIES = 3;

  const isMissingCollectionDetailsColumn = (error: any): boolean => {
    const text = `${error?.code ?? ''} ${error?.message ?? ''} ${error?.details ?? ''}`;
    return text.includes('collection_details') || error?.code === 'PGRST204';
  };

  const getCloudPayloadDetails = (): CollectionDetails => {
    return normalizeDetails(collectionState.value.details);
  };

  // Core upsert logic (single attempt)
  const attemptSaveToCloud = async (
    userId: string,
    collectedItems: string[],
    collectionDetails: CollectionDetails,
  ): Promise<void> => {
    const updatedAt = new Date().toISOString();
    const payload = {
      user_id: userId,
      collected_items: collectedItems,
      collection_details: collectionDetails as any,
      updated_at: updatedAt,
    };

    const legacyPayload = {
      user_id: userId,
      collected_items: collectedItems,
      updated_at: updatedAt,
    };

    // Try upsert first
    let upsertResult = await withTimeout(
      (supabase
        .from('user_collections') as any)
        .upsert(payload, {
          onConflict: 'user_id',
        }),
      SAVE_TIMEOUT_MS,
      'Upsert'
    ) as { error: any };

    if (upsertResult?.error && isMissingCollectionDetailsColumn(upsertResult.error)) {
      console.warn('[Collection] collection_details column missing; falling back to legacy cloud payload');
      upsertResult = await withTimeout(
        (supabase
          .from('user_collections') as any)
          .upsert(legacyPayload, {
            onConflict: 'user_id',
          }),
        SAVE_TIMEOUT_MS,
        'Legacy upsert'
      ) as { error: any };
    }

    if (upsertResult?.error) {
      console.warn('[Collection] Upsert failed:', upsertResult.error);

      // Try insert if upsert failed (might be first time)
      let insertResult = await withTimeout(
        (supabase
          .from('user_collections') as any)
          .insert(payload),
        SAVE_TIMEOUT_MS,
        'Insert fallback'
      ) as { error: any };

      if (insertResult?.error && isMissingCollectionDetailsColumn(insertResult.error)) {
        insertResult = await withTimeout(
          (supabase
            .from('user_collections') as any)
            .insert(legacyPayload),
          SAVE_TIMEOUT_MS,
          'Legacy insert fallback'
        ) as { error: any };
      }

      if (insertResult?.error && insertResult.error.code !== '23505') { // 23505 = unique violation
        throw insertResult.error;
      }
    }
  };

  // Save to Supabase (if logged in) — with timeout + auto-retry
  const saveToCloud = async (force = false): Promise<boolean> => {
    const userId = authStore.user.value?.id;
    if (!userId) {
      console.log('[Collection] No active session, skip cloud sync');
      syncStatus.value = 'idle';
      hasPendingChanges.value = false;
      return false;
    }

    try {
      collectionState.value = migrateCollectionState(collectionState.value);

      // 過濾掉無效的幽靈 ID，只保存 decor.json 中存在的 ID
      const validIds = getValidItemIds();
      const collectedItems = Object.keys(collectionState.value.collected)
        .filter(id => collectionState.value.collected[id] && validIds.has(id));
      const collectionDetails = getCloudPayloadDetails();
      const signature = JSON.stringify({
        collectedItems: collectedItems.slice().sort(),
        collectionDetails,
      });

      if (!force && lastSyncedSignature.value === signature) {
        return true;
      }

      const rawCount = Object.keys(collectionState.value.collected).filter(id => collectionState.value.collected[id]).length;
      if (rawCount !== collectedItems.length) {
        console.log(`[Collection] Filtered out ${rawCount - collectedItems.length} invalid/phantom IDs before saving`);
      }

      // Retry loop with timeout
      let lastError: unknown = null;
      for (let attempt = 1; attempt <= MAX_SAVE_RETRIES; attempt++) {
        try {
          console.log(`[Collection] Saving to cloud (attempt ${attempt}/${MAX_SAVE_RETRIES}) for user: ${userId} - ${collectedItems.length} items`);
          syncRetryAttempt.value = attempt;
          await attemptSaveToCloud(userId, collectedItems, collectionDetails);

          // Success
          syncRetryAttempt.value = 0;
          lastSyncedSignature.value = signature;
          lastSyncTime.value = new Date().toISOString();
          console.log('[Collection] ✓ Saved to cloud successfully');
          setSyncResult('success');
          return true;
        } catch (err) {
          lastError = err;
          console.warn(`[Collection] Attempt ${attempt}/${MAX_SAVE_RETRIES} failed:`, err instanceof Error ? err.message : err);
          if (attempt < MAX_SAVE_RETRIES) {
            // Short delay before retry (1s, 2s)
            const delay = attempt * 1000;
            console.log(`[Collection] Retrying in ${delay / 1000}s...`);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }

      // All retries exhausted
      console.error('[Collection] All save attempts failed:', lastError);
      setSyncResult('error');
      return false;
    } catch (e) {
      console.error('[Collection] Failed to save to cloud:', e);
      setSyncResult('error');
      return false;
    }
  };

  // Load from Supabase (if logged in)
  // ☁️ 雲端優先策略：已登入時直接使用雲端資料，不做 UNION merge
  // 這樣可以確保多裝置之間的資料一致性，也支援取消標記
  const loadFromCloud = async (force = false) => {
    const userId = authStore.user.value?.id;
    if (!userId) {
      console.log('[Collection] No active session, skip loading from cloud');
      return;
    }

    // Skip if we already loaded for this user within cooldown period
    if (!force && lastCloudLoadUserId === userId && (Date.now() - lastCloudLoadTime) < CLOUD_LOAD_COOLDOWN_MS) {
      console.log(`[Collection] Skipping cloud load — last loaded ${Math.round((Date.now() - lastCloudLoadTime) / 1000)}s ago for same user`);
      return;
    }

    console.log('[Collection] Loading from cloud for user:', userId);

    isSyncing.value = true;
    try {
      let result = await withTimeout(
        (supabase
          .from('user_collections') as any)
          .select('collected_items, collection_details')
          .eq('user_id', userId)
          .single(),
        SAVE_TIMEOUT_MS,
        'Load collection'
      ) as { data: any; error: any };

      if (result.error && isMissingCollectionDetailsColumn(result.error)) {
        result = await withTimeout(
          (supabase
            .from('user_collections') as any)
            .select('collected_items')
            .eq('user_id', userId)
            .single(),
          SAVE_TIMEOUT_MS,
          'Load legacy collection'
        ) as { data: any; error: any };
      }

      const { data, error } = result;

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

      if (data?.collected_items || data?.collection_details) {
        // ☁️ 雲端優先：直接使用雲端資料取代本地
        const cloudCollected: Record<string, boolean> = {};
        const validIds = getValidItemIds();
        const collectedItems = Array.isArray(data.collected_items) ? data.collected_items : [];
        collectedItems.forEach((id: string) => {
          // 只導入 decor.json 中存在的有效 ID
          if (validIds.has(id)) {
            cloudCollected[id] = true;
          }
        });

        const localCount = Object.keys(collectionState.value.collected)
          .filter(id => collectionState.value.collected[id]).length;
        const cloudCount = collectedItems.length;
        const validCloudCount = Object.keys(cloudCollected).length;

        if (cloudCount !== validCloudCount) {
          console.log(`[Collection] Filtered out ${cloudCount - validCloudCount} invalid IDs from cloud data`);
        }

        // 直接用雲端資料取代本地（雲端 = 唯一真實來源）
        collectionState.value = migrateCollectionState({
          collected: cloudCollected,
          details: data.collection_details ?? undefined,
          lastUpdated: new Date().toISOString(),
          version: data.collection_details ? CURRENT_VERSION : 1,
        });

        console.log('[Collection] ✓ Cloud-first sync:', {
          previousLocal: localCount,
          cloudRaw: cloudCount,
          cloudValid: validCloudCount,
          hasTraceDetails: Boolean(data.collection_details),
        });

        saveToLocal(); // 同步到 localStorage 作為離線備份

        // 如果有無效 ID 被過濾掉、或雲端還沒有 v2 trace data，把清理後的資料存回雲端
        if (cloudCount !== validCloudCount || !data.collection_details) {
          console.log('[Collection] Updating cloud with normalized collection details...');
          await saveToCloud(true);
        }
      } else {
        // 雲端沒資料：如果本地有資料，推送到雲端作為初始資料
        const localCount = Object.keys(collectionState.value.collected)
          .filter(id => collectionState.value.collected[id]).length;
        const localEventCount = collectionState.value.details?.events.length ?? 0;
        if (localCount > 0 || localEventCount > 0) {
          console.log('[Collection] No cloud data found, pushing local data to cloud:', localCount, 'items');
          await saveToCloud(true);
        } else {
          console.log('[Collection] No cloud data and no local data for this user');
        }
      }
    } catch (e) {
      console.error('[Collection] Failed to load from cloud:', e);
    } finally {
      isSyncing.value = false;
      // Record successful load time regardless of result (even empty = valid)
      lastCloudLoadTime = Date.now();
      lastCloudLoadUserId = userId;
    }
  };

  // Save collection (local + cloud)
  const saveCollection = () => {
    collectionState.value = syncCollectedFromDetails(collectionState.value);
    saveToLocal();
    if (authStore.isAuthenticated.value) {
      // Reset debounce timer
      if (globalSyncTimeout) clearTimeout(globalSyncTimeout);
      // Start/reset countdown display
      startCountdown();
      globalSyncTimeout = setTimeout(() => {
        stopCountdown();
        syncStatus.value = 'syncing';
        saveToCloud();
      }, CLOUD_SYNC_DEBOUNCE_MS);
    }
  };

  const applyInventoryAdjustment = (
    itemId: string,
    bucket: CollectionInventoryBucket,
    delta: number,
    options: {
      source?: CollectionEventSource;
      note?: string;
      persist?: boolean;
      revertedEventId?: string;
    } = {},
  ): CollectionInventoryItem => {
    const validIds = getValidItemIds();
    if (!validIds.has(itemId)) {
      return createEmptyInventoryItem();
    }

    const details = ensureCollectionDetails();
    const now = new Date().toISOString();
    const current = normalizeInventoryItem(details.inventory[itemId]);
    const countKey = INVENTORY_COUNT_KEYS[bucket];
    const previousCount = current[countKey];
    const newCount = Math.max(0, previousCount + Math.trunc(delta));
    const appliedDelta = newCount - previousCount;

    if (appliedDelta === 0) {
      return current;
    }

    const next = {
      ...current,
      [countKey]: newCount,
      updatedAt: now,
    };
    const nextInventory = {
      ...details.inventory,
      [itemId]: next,
    };
    const source = options.source ?? 'manual';
    const categoryId = getCategoryIdForItem(itemId);
    const event: CollectionEvent = {
      id: createEventId(),
      type: 'inventory_adjustment',
      createdAt: now,
      source,
      categoryId,
      itemId,
      bucket,
      delta: appliedDelta,
      previousCount,
      newCount,
      revertedEventId: options.revertedEventId,
      note: options.note,
    };
    const nextRareProgress = { ...details.rareProgress };
    const events = [...details.events, event];
    const rarePointAction = RARE_POINT_ACTION_BY_BUCKET[bucket];

    if (source === 'manual' && categoryId && rarePointAction) {
      const pointValue = RARE_POINT_VALUES[rarePointAction];
      const pointsDelta = appliedDelta * pointValue;
      const currentProgress = normalizeRareProgress(categoryId, details.rareProgress[categoryId]);
      const previousPoints = currentProgress.points;
      const newPoints = Math.max(0, previousPoints + pointsDelta);
      const appliedPointsDelta = newPoints - previousPoints;

      if (appliedPointsDelta !== 0) {
        nextRareProgress[categoryId] = {
          ...currentProgress,
          points: newPoints,
          updatedAt: now,
        };
        events.push({
          id: createEventId(),
          type: 'rare_points_adjustment',
          createdAt: now,
          source: 'rare-points',
          categoryId,
          itemId,
          rarePointAction,
          pointsDelta: appliedPointsDelta,
          previousPoints,
          newPoints,
          note: `Auto score from ${bucket}.`,
        });
      }
    }

    collectionState.value = {
      ...collectionState.value,
      details: {
        ...details,
        inventory: nextInventory,
        rareProgress: nextRareProgress,
        events,
      },
      version: CURRENT_VERSION,
      lastUpdated: now,
    };
    updateCollectedCacheForItem(itemId, next);

    if (options.persist !== false) {
      saveCollection();
    }

    return next;
  };

  const applyRarePointsAdjustment = (
    categoryId: string,
    pointsDelta: number,
    rarePointAction: RarePointAction,
    options: {
      source?: CollectionEventSource;
      note?: string;
      persist?: boolean;
      revertedEventId?: string;
      itemId?: string;
    } = {},
  ): RareDecorProgress => {
    const details = ensureCollectionDetails();
    const now = new Date().toISOString();
    const current = normalizeRareProgress(categoryId, details.rareProgress[categoryId]);
    const previousPoints = current.points;
    const newPoints = Math.max(0, previousPoints + Math.trunc(pointsDelta));
    const appliedDelta = newPoints - previousPoints;

    if (appliedDelta === 0) {
      return current;
    }

    const next = {
      ...current,
      points: newPoints,
      updatedAt: now,
    };
    const event: CollectionEvent = {
      id: createEventId(),
      type: 'rare_points_adjustment',
      createdAt: now,
      source: options.source ?? 'rare-points',
      categoryId,
      itemId: options.itemId,
      rarePointAction,
      pointsDelta: appliedDelta,
      previousPoints,
      newPoints,
      revertedEventId: options.revertedEventId,
      note: options.note,
    };

    collectionState.value = {
      ...collectionState.value,
      details: {
        ...details,
        rareProgress: {
          ...details.rareProgress,
          [categoryId]: next,
        },
        events: [...details.events, event],
      },
      version: CURRENT_VERSION,
      lastUpdated: now,
    };

    if (options.persist !== false) {
      saveCollection();
    }

    return next;
  };

  const adjustInventory = (
    itemId: string,
    bucket: CollectionInventoryBucket,
    delta: number,
    note?: string,
  ): CollectionInventoryItem => {
    return applyInventoryAdjustment(itemId, bucket, delta, {
      source: 'manual',
      note,
    });
  };

  const addRarePoints = (
    categoryId: string,
    action: RarePointAction,
    options: { points?: number; itemId?: string; note?: string } = {},
  ): RareDecorProgress => {
    const points = action === 'manual_adjustment'
      ? Math.trunc(options.points ?? 0)
      : RARE_POINT_VALUES[action];
    return applyRarePointsAdjustment(categoryId, points, action, {
      source: 'rare-points',
      itemId: options.itemId,
      note: options.note,
    });
  };

  const getInventoryItem = (itemId: string): CollectionInventoryItem => {
    return normalizeInventoryItem(collectionState.value.details?.inventory[itemId]);
  };

  // Toggle collected status for an item
  const toggleCollected = (itemId: string): boolean => {
    const current = isCollected(itemId);
    const bucket = getItemBucketForCollectedToggle(itemId);
    const inventory = getInventoryItem(itemId);

    if (current) {
      const decorDelta = inventory.decorCount > 0 ? -inventory.decorCount : 0;
      const rareDelta = inventory.rareCount > 0 ? -inventory.rareCount : 0;

      if (decorDelta !== 0) {
        applyInventoryAdjustment(itemId, 'decor', decorDelta, {
          source: 'legacy-toggle',
          note: 'Unmarked collected from decor card.',
          persist: false,
        });
      }
      if (rareDelta !== 0) {
        applyInventoryAdjustment(itemId, 'rare', rareDelta, {
          source: 'legacy-toggle',
          note: 'Unmarked collected from decor card.',
          persist: false,
        });
      }
      saveCollection();
      return false;
    }

    applyInventoryAdjustment(itemId, bucket, 1, {
      source: 'legacy-toggle',
      note: 'Marked collected from decor card.',
    });
    return true; // Return true if now collected, false if uncollected
  };

  // Check if an item is collected
  const isCollected = (itemId: string): boolean => {
    if (collectionState.value.collected[itemId]) {
      return true;
    }
    return hasCollectedDecor(getInventoryItem(itemId));
  };

  // Set collected status for an item
  const setCollected = (itemId: string, collected: boolean) => {
    if (isCollected(itemId) === collected) return;
    toggleCollected(itemId);
  };

  // Force sync — manually trigger cloud save, clearing any pending debounce
  const forceSync = async (): Promise<boolean> => {
    if (globalSyncTimeout) {
      clearTimeout(globalSyncTimeout);
      globalSyncTimeout = null;
    }
    stopCountdown();
    syncStatus.value = 'syncing';
    return await saveToCloud(true);
  };

  // Mark all items in a category as collected
  // ⚡ 批次操作：立即存雲端，不走 debounce，確保大量變更不會因離開頁面而遺失
  const collectAllInCategory = async (categoryId: string) => {
    const items = getAllDecorItems().filter(item => item.categoryId === categoryId);
    items.forEach(item => {
      if (!isCollected(item.id)) {
        applyInventoryAdjustment(item.id, getItemBucketForCollectedToggle(item.id), 1, {
          source: 'bulk',
          note: `Marked all collected in ${categoryId}.`,
          persist: false,
        });
      }
    });
    saveToLocal();
    // 取消任何待執行的 debounce，避免重複存
    if (globalSyncTimeout) {
      clearTimeout(globalSyncTimeout);
      globalSyncTimeout = null;
    }
    stopCountdown();
    syncStatus.value = 'syncing';
    await saveToCloud(true);
  };

  // Clear all collected items in a category
  // ⚡ 批次操作：立即存雲端
  const clearCategory = async (categoryId: string) => {
    const items = getAllDecorItems().filter(item => item.categoryId === categoryId);
    items.forEach(item => {
      const inventory = getInventoryItem(item.id);
      if (inventory.decorCount > 0) {
        applyInventoryAdjustment(item.id, 'decor', -inventory.decorCount, {
          source: 'bulk',
          note: `Cleared collected decor in ${categoryId}.`,
          persist: false,
        });
      }
      if (inventory.rareCount > 0) {
        applyInventoryAdjustment(item.id, 'rare', -inventory.rareCount, {
          source: 'bulk',
          note: `Cleared rare decor in ${categoryId}.`,
          persist: false,
        });
      }
    });
    saveToLocal();
    if (globalSyncTimeout) {
      clearTimeout(globalSyncTimeout);
      globalSyncTimeout = null;
    }
    stopCountdown();
    syncStatus.value = 'syncing';
    await saveToCloud(true);
  };

  const isCategoryComplete = (categoryId: string): boolean => {
    const items = getItemsByCategory(categoryId);
    return items.length > 0 && items.every(item => isCollected(item.id));
  };

  const getRareLevelFromPoints = (categoryId: string, points: number): number => {
    if (!isCategoryComplete(categoryId)) return 0;
    if (points < 800) return 1;
    if (points < 1200) return 2;
    if (points < 3000) return 3;
    return 4 + Math.floor((points - 3000) / 5000);
  };

  const getNextRareLevelPoints = (categoryId: string, points: number): number | null => {
    if (!isCategoryComplete(categoryId)) return 0;
    if (points < 800) return 800;
    if (points < 1200) return 1200;
    if (points < 3000) return 3000;
    return 3000 + (Math.floor((points - 3000) / 5000) + 1) * 5000;
  };

  const getRareProgress = (categoryId: string) => {
    const progress = normalizeRareProgress(categoryId, collectionState.value.details?.rareProgress[categoryId]);
    const level = getRareLevelFromPoints(categoryId, progress.points);
    const nextRareLevelPoints = getNextRareLevelPoints(categoryId, progress.points);

    return {
      ...progress,
      level,
      isCategoryComplete: isCategoryComplete(categoryId),
      nextRareLevelPoints,
      pointsToNextRareLevel: nextRareLevelPoints === null
        ? null
        : Math.max(0, nextRareLevelPoints - progress.points),
    };
  };

  const categoryHasRareDecor = (categoryId: string): boolean => {
    const definition = getDecorDefinitions().find(def => def.category.id === categoryId);
    return Boolean(definition?.variants.some(variant =>
      variant.isRare || variant.id.toLowerCase().includes('rare')
    ));
  };

  const getCategoryInventorySummary = (categoryId: string): CategoryInventorySummary => {
    const items = getItemsByCategory(categoryId);
    const summary: CategoryInventorySummary = {
      categoryId,
      seedlingCount: 0,
      preDecorCount: 0,
      decorCount: 0,
      rareCount: 0,
      releaseNoDecorCount: 0,
      releaseWithDecorCount: 0,
      collectedCount: 0,
      totalItems: items.length,
      eventCount: 0,
      hasRareDecor: categoryHasRareDecor(categoryId),
      rarePoints: 0,
      rareLevel: 0,
      nextRareLevelPoints: null,
      pointsToNextRareLevel: null,
    };

    items.forEach(item => {
      const inventory = getInventoryItem(item.id);
      summary.seedlingCount += inventory.seedlingCount;
      summary.preDecorCount += inventory.preDecorCount;
      summary.decorCount += inventory.decorCount;
      summary.rareCount += inventory.rareCount;
      summary.releaseNoDecorCount += inventory.releaseNoDecorCount;
      summary.releaseWithDecorCount += inventory.releaseWithDecorCount;
      if (isCollected(item.id)) {
        summary.collectedCount++;
      }
    });

    summary.eventCount = (collectionState.value.details?.events ?? [])
      .filter(event => event.categoryId === categoryId)
      .length;

    const rareProgress = getRareProgress(categoryId);
    summary.rarePoints = rareProgress.points;
    summary.rareLevel = rareProgress.level;
    summary.nextRareLevelPoints = rareProgress.nextRareLevelPoints;
    summary.pointsToNextRareLevel = rareProgress.pointsToNextRareLevel;

    return summary;
  };

  const getRecentCollectionEvents = (limit = 20, categoryId?: string): CollectionEvent[] => {
    const events = collectionState.value.details?.events ?? [];
    return events
      .filter(event => !categoryId || event.categoryId === categoryId)
      .slice()
      .reverse()
      .slice(0, limit);
  };

  const undoLastCollectionEvent = (categoryId?: string): boolean => {
    const events = collectionState.value.details?.events ?? [];
    const revertedEventIds = new Set(
      events
        .map(event => event.revertedEventId)
        .filter((eventId): eventId is string => Boolean(eventId)),
    );

    const eventToUndo = events
      .slice()
      .reverse()
      .find(event =>
        event.source !== 'undo' &&
        !revertedEventIds.has(event.id) &&
        (!categoryId || event.categoryId === categoryId)
      );

    if (!eventToUndo) return false;

    if (
      eventToUndo.type === 'inventory_adjustment' &&
      eventToUndo.itemId &&
      eventToUndo.bucket &&
      typeof eventToUndo.delta === 'number'
    ) {
      applyInventoryAdjustment(eventToUndo.itemId, eventToUndo.bucket, -eventToUndo.delta, {
        source: 'undo',
        note: `Undo ${eventToUndo.id}.`,
        revertedEventId: eventToUndo.id,
        persist: false,
      });
      saveCollection();
      return true;
    }

    if (
      eventToUndo.type === 'rare_points_adjustment' &&
      eventToUndo.categoryId &&
      typeof eventToUndo.pointsDelta === 'number'
    ) {
      applyRarePointsAdjustment(
        eventToUndo.categoryId,
        -eventToUndo.pointsDelta,
        'manual_adjustment',
        {
          source: 'undo',
          note: `Undo ${eventToUndo.id}.`,
          revertedEventId: eventToUndo.id,
          persist: false,
        },
      );
      saveCollection();
      return true;
    }

    return false;
  };

  const rebuildCollectionFromEvents = () => {
    const details = ensureCollectionDetails();
    const rebuilt = createEmptyDetails();

    details.events.forEach(event => {
      if (
        event.type === 'inventory_adjustment' &&
        event.itemId &&
        event.bucket &&
        typeof event.delta === 'number'
      ) {
        const current = normalizeInventoryItem(rebuilt.inventory[event.itemId]);
        const key = INVENTORY_COUNT_KEYS[event.bucket];
        rebuilt.inventory[event.itemId] = {
          ...current,
          [key]: Math.max(0, current[key] + event.delta),
          updatedAt: event.createdAt,
        };
      }

      if (
        event.type === 'rare_points_adjustment' &&
        event.categoryId &&
        typeof event.pointsDelta === 'number'
      ) {
        const current = normalizeRareProgress(event.categoryId, rebuilt.rareProgress[event.categoryId]);
        rebuilt.rareProgress[event.categoryId] = {
          ...current,
          points: Math.max(0, current.points + event.pointsDelta),
          updatedAt: event.createdAt,
        };
      }
    });

    collectionState.value = syncCollectedFromDetails({
      ...collectionState.value,
      details: {
        ...rebuilt,
        events: details.events,
      },
      version: CURRENT_VERSION,
      lastUpdated: new Date().toISOString(),
    });
    saveCollection();
  };

  // Calculate collection statistics
  const getStats = (): CollectionStats => {
    const items = getAllDecorItems();
    const definitions = getDecorDefinitions();

    const stats: CollectionStats = {
      total: items.length,
      collected: 0,
      percentage: 0,
      byCategory: {},
      byPikminType: {} as Record<PikminType, { total: number; collected: number }>,
      byCategoryType: {} as Record<DecorCategoryType, { total: number; collected: number }>,
    };

    // Initialize Pikmin type stats
    const pikminTypes: PikminType[] = ['red', 'yellow', 'blue', 'purple', 'white', 'rock', 'winged', 'ice'];
    pikminTypes.forEach(type => {
      stats.byPikminType[type] = { total: 0, collected: 0 };
    });

    // Initialize category type stats
    const categoryTypes: DecorCategoryType[] = ['regular', 'special', 'roadside', 'weather', 'regional', 'rare'];
    categoryTypes.forEach(type => {
      stats.byCategoryType[type] = { total: 0, collected: 0 };
    });

    items.forEach(item => {
      const isItemCollected = isCollected(item.id);
      if (isItemCollected) {
        stats.collected++;
      }

      // By category
      if (!stats.byCategory[item.categoryId]) {
        stats.byCategory[item.categoryId] = { total: 0, collected: 0 };
      }
      const catStats = stats.byCategory[item.categoryId]!;
      catStats.total++;
      if (isItemCollected) {
        catStats.collected++;
      }

      // By Pikmin type
      stats.byPikminType[item.pikminType].total++;
      if (isItemCollected) {
        stats.byPikminType[item.pikminType].collected++;
      }

      // By category type
      const definition = definitions.find(d => d.category.id === item.categoryId);
      if (definition) {
        stats.byCategoryType[definition.category.type].total++;
        if (isItemCollected) {
          stats.byCategoryType[definition.category.type].collected++;
        }
      }
    });

    stats.percentage = stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0;

    return stats;
  };

  // Export collection as JSON
  const exportCollection = (): string => {
    return JSON.stringify(collectionState.value, null, 2);
  };

  // Import collection from JSON
  const importCollection = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as CollectionState;
      if (parsed.collected && typeof parsed.collected === 'object') {
        collectionState.value = migrateCollectionState(parsed);
        saveCollection();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import collection:', e);
      return false;
    }
  };

  // Reset entire collection
  const resetCollection = () => {
    collectionState.value = {
      collected: {},
      details: createEmptyDetails(),
      lastUpdated: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    saveCollection();
  };

  // 清除本地資料（僅在使用者明確要求重置時使用）
  // ⚠️ 不應在登出時自動呼叫，以避免資料遺失
  const clearLocalData = () => {
    console.warn('[Collection] ⚠️ Clearing local data - this should only be called on explicit user reset!');
    // 清除 state
    collectionState.value = {
      collected: {},
      details: createEmptyDetails(),
      lastUpdated: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    // 清除 localStorage
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[Collection] ✓ Local storage cleared');
      } catch (e) {
        console.error('[Collection] Failed to clear local storage:', e);
      }
    }
  };

  // Cleanup function for component unmounting
  const cleanupSyncTimers = () => {
    // Don't clear the actual sync timers (they're global),
    // but components can call this for local cleanup if needed
  };

  return {
    collectionState: readonly(collectionState),
    isSyncing: readonly(isSyncing),
    lastSyncTime: readonly(lastSyncTime),
    // Debounced upload UI state
    syncStatus: readonly(syncStatus),
    syncCountdown: readonly(syncCountdown),
    hasPendingChanges: readonly(hasPendingChanges),
    syncRetryAttempt: readonly(syncRetryAttempt),
    rarePointValues: RARE_POINT_VALUES,
    loadCollection,
    loadFromCloud,
    toggleCollected,
    isCollected,
    setCollected,
    collectAllInCategory,
    clearCategory,
    adjustInventory,
    addRarePoints,
    getInventoryItem,
    getCategoryInventorySummary,
    getRareProgress,
    getRecentCollectionEvents,
    undoLastCollectionEvent,
    rebuildCollectionFromEvents,
    forceSync,
    getStats,
    exportCollection,
    importCollection,
    resetCollection,
    clearLocalData,
    cleanupSyncTimers,
  };
}
