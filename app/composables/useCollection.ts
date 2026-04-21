import type { CollectionState, CollectionStats, PikminType, DecorCategoryType } from '~/types/decor';
import { useDecorData } from './useDecorData';

const STORAGE_KEY = 'pikmin-bloom-collection';
const CURRENT_VERSION = 1;
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

export function useCollection() {
  const { getAllDecorItems, getDecorDefinitions } = useDecorData();
  const supabase = useSupabaseClient();
  const authStore = useAuthStore();
  
  // Reactive collection state
  const collectionState = useState<CollectionState>('collection', () => ({
    collected: {},
    lastUpdated: new Date().toISOString(),
    version: CURRENT_VERSION,
  }));

  // Sync status
  const isSyncing = useState('collection-syncing', () => false);
  const lastSyncTime = useState<string | null>('collection-last-sync', () => null);

  // Debounced upload UI state
  const syncStatus = useState<SyncStatus>('collection-sync-status', () => 'idle');
  const syncCountdown = useState<number>('collection-sync-countdown', () => 0);
  const hasPendingChanges = useState<boolean>('collection-has-pending', () => false);
  const syncRetryAttempt = useState<number>('collection-sync-retry', () => 0);
  const lastSyncedSignature = useState<string | null>('collection-last-synced-signature', () => null);

  // Load from localStorage on client side
  const loadCollection = () => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as CollectionState;
          collectionState.value = parsed;
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

  // Get valid DecorItem IDs from current decor.json
  const getValidItemIds = (): Set<string> => {
    return new Set(getAllDecorItems().map(item => item.id));
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

  // Core upsert logic (single attempt)
  const attemptSaveToCloud = async (userId: string, collectedItems: string[]): Promise<void> => {
    // Try upsert first
    const upsertResult = await withTimeout(
      supabase
        .from('user_collections')
        .upsert({
          user_id: userId,
          collected_items: collectedItems,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        }),
      SAVE_TIMEOUT_MS,
      'Upsert'
    ) as { error: any };

    if (upsertResult?.error) {
      console.warn('[Collection] Upsert failed:', upsertResult.error);

      // Try insert if upsert failed (might be first time)
      const insertResult = await withTimeout(
        supabase
          .from('user_collections')
          .insert({
            user_id: userId,
            collected_items: collectedItems,
            updated_at: new Date().toISOString(),
          }),
        SAVE_TIMEOUT_MS,
        'Insert fallback'
      ) as { error: any };

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
      // 過濾掉無效的幽靈 ID，只保存 decor.json 中存在的 ID
      const validIds = getValidItemIds();
      const collectedItems = Object.keys(collectionState.value.collected)
        .filter(id => collectionState.value.collected[id] && validIds.has(id));
      const signature = collectedItems.slice().sort().join('|');

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
          await attemptSaveToCloud(userId, collectedItems);

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
      const { data, error } = await supabase
        .from('user_collections')
        .select('collected_items')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (data?.collected_items) {
        // ☁️ 雲端優先：直接使用雲端資料取代本地
        const cloudCollected: Record<string, boolean> = {};
        const validIds = getValidItemIds();
        (data.collected_items as string[]).forEach(id => {
          // 只導入 decor.json 中存在的有效 ID
          if (validIds.has(id)) {
            cloudCollected[id] = true;
          }
        });
        
        const localCount = Object.keys(collectionState.value.collected)
          .filter(id => collectionState.value.collected[id]).length;
        const cloudCount = (data.collected_items as string[]).length;
        const validCloudCount = Object.keys(cloudCollected).length;
        
        if (cloudCount !== validCloudCount) {
          console.log(`[Collection] Filtered out ${cloudCount - validCloudCount} invalid IDs from cloud data`);
        }
        
        // 直接用雲端資料取代本地（雲端 = 唯一真實來源）
        collectionState.value.collected = cloudCollected;
        
        console.log('[Collection] ✓ Cloud-first sync:', {
          previousLocal: localCount,
          cloudRaw: cloudCount,
          cloudValid: validCloudCount,
        });
        
        saveToLocal(); // 同步到 localStorage 作為離線備份
        
        // 如果有無效 ID 被過濾掉了，把清理後的資料存回雲端
        if (cloudCount !== validCloudCount) {
          console.log('[Collection] Cleaning up invalid IDs in cloud...');
          await saveToCloud(true);
        }
      } else {
        // 雲端沒資料：如果本地有資料，推送到雲端作為初始資料
        const localCount = Object.keys(collectionState.value.collected)
          .filter(id => collectionState.value.collected[id]).length;
        if (localCount > 0) {
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

  // Toggle collected status for an item
  const toggleCollected = (itemId: string): boolean => {
    const current = collectionState.value.collected[itemId] ?? false;
    const newValue = !current;
    collectionState.value.collected[itemId] = newValue;
    saveCollection();
    return newValue; // Return true if now collected, false if uncollected
  };

  // Check if an item is collected
  const isCollected = (itemId: string): boolean => {
    return collectionState.value.collected[itemId] ?? false;
  };

  // Set collected status for an item
  const setCollected = (itemId: string, collected: boolean) => {
    collectionState.value.collected[itemId] = collected;
    saveCollection();
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
      collectionState.value.collected[item.id] = true;
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
      delete collectionState.value.collected[item.id];
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
        collectionState.value = {
          ...parsed,
          version: CURRENT_VERSION,
          lastUpdated: new Date().toISOString(),
        };
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
    loadCollection,
    loadFromCloud,
    toggleCollected,
    isCollected,
    setCollected,
    collectAllInCategory,
    clearCategory,
    forceSync,
    getStats,
    exportCollection,
    importCollection,
    resetCollection,
    clearLocalData,
    cleanupSyncTimers,
  };
}

