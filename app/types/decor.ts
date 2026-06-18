// Pikmin types available in Pikmin Bloom
export type PikminType = 'red' | 'yellow' | 'blue' | 'purple' | 'white' | 'rock' | 'winged' | 'ice';

export const PIKMIN_TYPES: PikminType[] = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'];

export const PIKMIN_TYPE_NAMES: Record<PikminType, string> = {
  red: '紅皮克敏',
  yellow: '黃皮克敏',
  blue: '藍皮克敏',
  purple: '紫皮克敏',
  white: '白皮克敏',
  rock: '岩皮克敏',
  winged: '翼皮克敏',
  ice: '冰皮克敏',
};

export const PIKMIN_TYPE_COLORS: Record<PikminType, string> = {
  red: 'bg-pikmin-red',
  yellow: 'bg-pikmin-yellow',
  blue: 'bg-pikmin-blue',
  purple: 'bg-pikmin-purple',
  white: 'bg-pikmin-white',
  rock: 'bg-pikmin-rock',
  winged: 'bg-pikmin-winged',
  ice: 'bg-pikmin-ice',
};

// Decor category types
export type DecorCategoryType = 
  | 'regular'    // Location-based decor
  | 'special'    // Event-based special decor
  | 'roadside'   // Stickers and coins
  | 'weather'    // Weather-based decor
  | 'regional'   // Region-exclusive decor
  | 'rare';      // Rare variants

export const DECOR_CATEGORY_TYPES: { id: DecorCategoryType; name: string; description: string }[] = [
  { id: 'regular', name: '地點飾品', description: '在特定地點種植苗獲得' },
  { id: 'special', name: '活動限定', description: '限時活動才能取得' },
  { id: 'roadside', name: '路邊', description: '在路邊種植苗獲得' },
  { id: 'weather', name: '天氣相關', description: '特定天氣條件下獲得' },
  { id: 'regional', name: '地區限定', description: '特定國家/地區限定' },
  { id: 'rare', name: '稀有版本', description: '一般飾品的稀有變體' },
];

// Individual decor category (e.g., Restaurant, Café)
export interface DecorCategory {
  id: string;
  name: string;
  nameEn: string;
  type: DecorCategoryType;
  icon?: string;
  description?: string;
}

// Individual decor variant (e.g., Chef Hat variant for Restaurant)
export interface DecorVariant {
  id: string;
  name: string;
  nameEn: string;
  imageUrl?: string;
  localImage?: string;
  isRare?: boolean;
  baseVariantId?: string;
}

// Decor item that can be collected (combines category + variant + pikmin type)
export interface DecorItem {
  id: string;                    // Unique identifier: categoryId_variantId_pikminType
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
  available: boolean;            // Whether this combination exists in game
}

// Full decor definition including all variants
export interface DecorDefinition {
  category: DecorCategory;
  variants: DecorVariant[];
  availablePikminTypes: PikminType[]; // Which Pikmin types can have this decor
}

// Collection state stored in localStorage
export type CollectionInventoryBucket =
  | 'seedling'
  | 'preDecor'
  | 'decor'
  | 'rare'
  | 'releaseNoDecor'
  | 'releaseWithDecor';

export interface CollectionInventoryItem {
  seedlingCount: number;         // Small seedlings still in inventory/planter
  preDecorCount: number;         // Small seedling plucked, below 4 hearts
  decorCount: number;            // Huge seedling plucked or 4-heart gift decor obtained
  rareCount: number;             // Rare decor Pikmin
  releaseNoDecorCount: number;   // Released before obtaining decor
  releaseWithDecorCount: number; // Released after obtaining decor
  updatedAt?: string;
}

export type RarePointAction =
  | 'pluck_seedling'
  | 'pluck_huge_seedling'
  | 'gift_expedition'
  | 'release_no_decor'
  | 'release_with_decor'
  | 'manual_adjustment';

export type CollectionEventSource = 'manual' | 'legacy-toggle' | 'bulk' | 'migration' | 'rare-points' | 'undo';

export type CollectionEventType = 'inventory_adjustment' | 'rare_points_adjustment';

export interface CollectionEvent {
  id: string;
  type: CollectionEventType;
  createdAt: string;
  source: CollectionEventSource;
  categoryId?: string;
  itemId?: string;
  bucket?: CollectionInventoryBucket;
  delta?: number;
  previousCount?: number;
  newCount?: number;
  rarePointAction?: RarePointAction;
  pointsDelta?: number;
  previousPoints?: number;
  newPoints?: number;
  revertedEventId?: string;
  note?: string;
}

export interface RareDecorProgress {
  categoryId: string;
  points: number;
  giftsAvailable: number;
  giftsSpent: number;
  updatedAt?: string;
}

export interface CollectionDetails {
  inventory: Record<string, CollectionInventoryItem>;
  rareProgress: Record<string, RareDecorProgress>;
  events: CollectionEvent[];
}

export interface CategoryInventorySummary {
  categoryId: string;
  seedlingCount: number;
  preDecorCount: number;
  decorCount: number;
  rareCount: number;
  releaseNoDecorCount: number;
  releaseWithDecorCount: number;
  collectedCount: number;
  totalItems: number;
  eventCount: number;
  hasRareDecor: boolean;
  rarePoints: number;
  rareLevel: number;
  nextRareLevelPoints: number | null;
  pointsToNextRareLevel: number | null;
}

export interface CollectionState {
  collected: Record<string, boolean>;  // Key: DecorItem.id, Value: collected or not
  details?: CollectionDetails;         // Traceable v2 inventory/event data
  lastUpdated: string;                 // ISO date string
  version: number;                     // For migration purposes
}

// Stats for progress tracking
export interface CollectionStats {
  total: number;
  collected: number;
  percentage: number;
  byCategory: Record<string, { total: number; collected: number }>;
  byPikminType: Record<PikminType, { total: number; collected: number }>;
  byCategoryType: Record<DecorCategoryType, { total: number; collected: number }>;
}

// Released Pikmin record
export interface ReleasedPikmin {
  id: string;              // UUID (crypto.randomUUID)
  decorItemId: string;     // DecorItem.id, e.g. "restaurant_chef_hat_red"
  nickname?: string;       // Pikmin's in-game nickname
  location?: string;       // Where the Pikmin was obtained
  releasedAt: string;      // ISO date string (date only, e.g. "2026-06-09")
  note?: string;           // Free-form note
  createdAt: string;       // ISO datetime when this record was created
}

// Released state stored in localStorage
export interface ReleasedState {
  records: ReleasedPikmin[];
  lastUpdated: string;     // ISO date string
  version: number;         // For migration purposes
}
