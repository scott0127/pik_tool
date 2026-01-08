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
    if (!user.value) return;
    
    try {
      const collectedItems = Object.keys(collectionState.value.collected)
        .filter(id => collectionState.value.collected[id]);
      
      const { error } = await supabase
        .from('user_collections')
        .upsert({
          user_id: user.value.id,
          collected_items: collectedItems,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
      
      if (error) throw error;
    } catch (e) {
      console.error('Failed to save to cloud:', e);
    }
  };

  // Load from Supabase (if logged in)
  const loadFromCloud = async () => {
    if (!user.value) return;
    
    isSyncing.value = true;
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .select('collected_items')
        .eq('user_id', user.value.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (data?.collected_items) {
        const collected: Record<string, boolean> = {};
        (data.collected_items as string[]).forEach(id => {
          collected[id] = true;
        });
        collectionState.value.collected = collected;
        saveToLocal(); // Sync to local storage too
      }
    } catch (e) {
      console.error('Failed to load from cloud:', e);
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
    const pikminTypes: PikminType[] = ['red', 'yellow', 'blue', 'purple', 'white', 'rock', 'winged'];
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
      stats.byCategory[item.categoryId].total++;
      if (isItemCollected) {
        stats.byCategory[item.categoryId].collected++;
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
  };
}

