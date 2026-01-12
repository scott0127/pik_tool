import type { CollectionState, CollectionStats, PikminType, DecorCategoryType } from '~/types/decor';
import { useDecorData } from './useDecorData';

const STORAGE_KEY = 'pikmin-bloom-collection';
const CURRENT_VERSION = 1;

export function useCollection() {
  const { getAllDecorItems, getDecorDefinitions } = useDecorData();
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  // Reactive collection state
  const collectionState = useState<CollectionState>('collection', () => ({
    collected: {},
    lastUpdated: new Date().toISOString(),
    version: CURRENT_VERSION,
  }));

  // Sync status
  const isSyncing = useState('collection-syncing', () => false);

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

  // Save to Supabase (if logged in)
  const saveToCloud = async () => {
    // Get current session directly from Supabase client
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.log('[Collection] No active session, skip cloud sync');
      return;
    }
    
    const userId = session.user.id;
    
    try {
      const collectedItems = Object.keys(collectionState.value.collected)
        .filter(id => collectionState.value.collected[id]);
      
      console.log('[Collection] Saving to cloud for user:', userId, '-', collectedItems.length, 'items');
      
      // Try upsert first
      const { error: upsertError } = await supabase
        .from('user_collections')
        .upsert({
          user_id: userId,
          collected_items: collectedItems,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
      
      if (upsertError) {
        console.error('[Collection] Upsert failed:', upsertError);
        
        // Try insert if upsert failed (might be first time)
        const { error: insertError } = await supabase
          .from('user_collections')
          .insert({
            user_id: userId,
            collected_items: collectedItems,
            updated_at: new Date().toISOString(),
          });
        
        if (insertError && insertError.code !== '23505') { // 23505 = unique violation (already exists)
          throw insertError;
        }
      }
      
      console.log('[Collection] ✓ Saved to cloud successfully');
    } catch (e) {
      console.error('[Collection] Failed to save to cloud:', e);
    }
  };

  // Merge two collections (union strategy: keep all collected items)
  const mergeCollections = (local: Record<string, boolean>, cloud: Record<string, boolean>): Record<string, boolean> => {
    const merged: Record<string, boolean> = { ...local };
    
    // Add all cloud items
    Object.keys(cloud).forEach(id => {
      if (cloud[id]) {
        merged[id] = true;
      }
    });
    
    return merged;
  };

  // Load from Supabase (if logged in)
  const loadFromCloud = async () => {
    // Get current session directly from Supabase client
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.log('[Collection] No active session, skip loading from cloud');
      return;
    }
    
    const userId = session.user.id;
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
        const cloudCollected: Record<string, boolean> = {};
        (data.collected_items as string[]).forEach(id => {
          cloudCollected[id] = true;
        });
        
        // 🔄 MERGE instead of OVERWRITE
        const localCount = Object.keys(collectionState.value.collected).filter(id => collectionState.value.collected[id]).length;
        const cloudCount = (data.collected_items as string[]).length;
        
        collectionState.value.collected = mergeCollections(collectionState.value.collected, cloudCollected);
        
        const mergedCount = Object.keys(collectionState.value.collected).filter(id => collectionState.value.collected[id]).length;
        
        console.log('[Collection] ✓ Merged collections:', {
          local: localCount,
          cloud: cloudCount,
          merged: mergedCount,
          gained: mergedCount - localCount
        });
        
        saveToLocal(); // Sync merged data to local storage
        
        // If we gained items from merge, sync back to cloud
        if (mergedCount > cloudCount) {
          console.log('[Collection] Local had more items, syncing back to cloud...');
          await saveToCloud();
        }
      } else {
        console.log('[Collection] No cloud data found for this user');
      }
    } catch (e) {
      console.error('[Collection] Failed to load from cloud:', e);
    } finally {
      isSyncing.value = false;
    }
  };

  // Save collection (local + cloud)
  const saveCollection = () => {
    saveToLocal();
    if (user.value) {
      saveToCloud();
    }
  };

  // Toggle collected status for an item
  const toggleCollected = (itemId: string) => {
    const current = collectionState.value.collected[itemId] ?? false;
    collectionState.value.collected[itemId] = !current;
    saveCollection();
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

  // Mark all items in a category as collected
  const collectAllInCategory = (categoryId: string) => {
    const items = getAllDecorItems().filter(item => item.categoryId === categoryId);
    items.forEach(item => {
      collectionState.value.collected[item.id] = true;
    });
    saveCollection();
  };

  // Clear all collected items in a category
  const clearCategory = (categoryId: string) => {
    const items = getAllDecorItems().filter(item => item.categoryId === categoryId);
    items.forEach(item => {
      delete collectionState.value.collected[item.id];
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

  return {
    collectionState: readonly(collectionState),
    isSyncing: readonly(isSyncing),
    loadCollection,
    loadFromCloud,
    toggleCollected,
    isCollected,
    setCollected,
    collectAllInCategory,
    clearCategory,
    getStats,
    exportCollection,
    importCollection,
    resetCollection,
    clearLocalData,
  };
}

