// Pikmin types available in Pikmin Bloom
export type PikminType = 'red' | 'yellow' | 'blue' | 'purple' | 'white' | 'rock' | 'winged';

export const PIKMIN_TYPES: PikminType[] = ['red', 'yellow', 'blue', 'purple', 'white', 'rock', 'winged'];

export const PIKMIN_TYPE_NAMES: Record<PikminType, string> = {
  red: '紅皮克敏',
  yellow: '黃皮克敏',
  blue: '藍皮克敏',
  purple: '紫皮克敏',
  white: '白皮克敏',
  rock: '岩皮克敏',
  winged: '翼皮克敏',
};

export const PIKMIN_TYPE_COLORS: Record<PikminType, string> = {
  red: 'bg-pikmin-red',
  yellow: 'bg-pikmin-yellow',
  blue: 'bg-pikmin-blue',
  purple: 'bg-pikmin-purple',
  white: 'bg-pikmin-white',
  rock: 'bg-pikmin-rock',
  winged: 'bg-pikmin-winged',
};

// Decor category types
export type DecorCategoryType = 
  | 'regular'    // Location-based decor
  | 'special'    // Event-based special decor
  | 'roadside'   // Stickers and coins
  | 'weather'    // Weather-based decor
  | 'regional'   // Region-exclusive decor
  | 'rare';      // Rare variants

export const DECOR_CATEGORY_TYPES: { id: DecorCategoryType; name: string; icon: string }[] = [
  { id: 'regular', name: '一般飾品', icon: '🏠' },
  { id: 'special', name: '活動限定', icon: '⭐' },
  { id: 'roadside', name: '路邊', icon: '🛤️' },
  { id: 'weather', name: '天氣', icon: '🌧️' },
  { id: 'regional', name: '地區限定', icon: '🗾' },
  { id: 'rare', name: '稀有', icon: '✨' },
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
export interface CollectionState {
  collected: Record<string, boolean>;  // Key: DecorItem.id, Value: collected or not
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
