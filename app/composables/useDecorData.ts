import type { DecorDefinition, DecorItem, PikminType, DecorCategoryType } from '~/types/decor';
import { PIKMIN_TYPES } from '~/types/decor';
import decorData from '~/data/decor.json';

const decorDefinitions = decorData.definitions as DecorDefinition[];
const allDecorItems: DecorItem[] = [];
const itemsByCategory = new Map<string, DecorItem[]>();
const itemsByCategoryType = new Map<DecorCategoryType, DecorItem[]>();
const variantsByKey = new Map<string, DecorDefinition['variants'][number]>();
const categoriesById = new Map<string, DecorDefinition['category']>();

decorDefinitions.forEach((def) => {
  categoriesById.set(def.category.id, def.category);
  const availableTypes = def.availablePikminTypes || PIKMIN_TYPES;

  if (!itemsByCategoryType.has(def.category.type)) {
    itemsByCategoryType.set(def.category.type, []);
  }

  def.variants.forEach((variant) => {
    variantsByKey.set(`${def.category.id}_${variant.id}`, variant);

    const variantImageUrls = (variant as any).imageUrls;
    let typesToGenerate: PikminType[];

    if (variantImageUrls && typeof variantImageUrls === 'object') {
      const availableTypesInVariant = new Set(Object.keys(variantImageUrls) as PikminType[]);
      typesToGenerate = PIKMIN_TYPES.filter(type => availableTypesInVariant.has(type));
    } else {
      typesToGenerate = availableTypes as PikminType[];
    }

    typesToGenerate.forEach((pikminType) => {
      const item: DecorItem = {
        id: `${def.category.id}_${variant.id}_${pikminType}`,
        categoryId: def.category.id,
        variantId: variant.id,
        pikminType,
        available: true,
      };

      allDecorItems.push(item);

      if (!itemsByCategory.has(def.category.id)) {
        itemsByCategory.set(def.category.id, []);
      }
      itemsByCategory.get(def.category.id)!.push(item);
      itemsByCategoryType.get(def.category.type)!.push(item);
    });
  });
});

export function useDecorData() {
  // Get all decor definitions from JSON
  const getDecorDefinitions = (): DecorDefinition[] => {
    return decorDefinitions;
  };

  // Get all possible decor items (category + variant + pikmin type combinations)
  const getAllDecorItems = (): DecorItem[] => {
    return allDecorItems;
  };

  // Get items filtered by category
  const getItemsByCategory = (categoryId: string): DecorItem[] => {
    return itemsByCategory.get(categoryId) ?? [];
  };

  // Get items filtered by category type (regular, special, etc.)
  const getItemsByCategoryType = (type: DecorCategoryType): DecorItem[] => {
    return itemsByCategoryType.get(type) ?? [];
  };

  // Get items filtered by Pikmin type
  const getItemsByPikminType = (pikminType: PikminType): DecorItem[] => {
    return getAllDecorItems().filter(item => item.pikminType === pikminType);
  };

  // Get a specific variant by ID
  const getVariant = (categoryId: string, variantId: string) => {
    return variantsByKey.get(`${categoryId}_${variantId}`) || null;
  };

  // Get category by ID
  const getCategory = (categoryId: string) => {
    return categoriesById.get(categoryId) || null;
  };

  // Get image URL for a specific Pikmin type
  const getImageUrl = (categoryId: string, variantId: string, pikminType: PikminType): string | null => {
    const variant = getVariant(categoryId, variantId);
    if (!variant) return null;
    
    // Check for new imageUrls dict first
    const imageUrls = (variant as any).imageUrls;
    if (imageUrls && imageUrls[pikminType]) {
      return imageUrls[pikminType];
    }
    
    // Fallback to old single imageUrl
    return (variant as any).imageUrl || null;
  };

  // Get all unique categories
  const getAllCategories = () => {
    return getDecorDefinitions().map(def => def.category);
  };

  // Get categories by type
  const getCategoriesByType = (type: DecorCategoryType) => {
    return getDecorDefinitions()
      .filter(def => def.category.type === type)
      .map(def => def.category);
  };

  // Pikmin type Chinese name mapping
  const PIKMIN_TYPE_ZH: Record<string, PikminType[]> = {
    '紅': ['red'],
    '紅色': ['red'],
    '黃': ['yellow'],
    '黃色': ['yellow'],
    '藍': ['blue'],
    '藍色': ['blue'],
    '白': ['white'],
    '白色': ['white'],
    '紫': ['purple'],
    '紫色': ['purple'],
    '岩石': ['rock'],
    '岩': ['rock'],
    '翼': ['winged'],
    '飛': ['winged'],
    '飛行': ['winged'],
    '冰': ['ice'],
    '冰凍': ['ice'],
  };

  // Search items by name (supports Chinese search for categories, variants, and pikmin types)
  const searchItems = (query: string): DecorItem[] => {
    if (!query.trim()) return getAllDecorItems();
    
    const lowerQuery = query.toLowerCase();
    const definitions = getDecorDefinitions();
    const matchingCategoryIds = new Set<string>();
    const matchingVariantIds = new Set<string>();
    const matchingPikminTypes = new Set<PikminType>();

    // Check if query matches Pikmin type (Chinese or English)
    for (const [zhName, types] of Object.entries(PIKMIN_TYPE_ZH)) {
      if (query.includes(zhName)) {
        types.forEach(t => matchingPikminTypes.add(t));
      }
    }
    
    // Also check English pikmin type names
    PIKMIN_TYPES.forEach(type => {
      if (lowerQuery.includes(type)) {
        matchingPikminTypes.add(type);
      }
    });

    definitions.forEach(def => {
      if (
        def.category.name.toLowerCase().includes(lowerQuery) ||
        def.category.nameEn.toLowerCase().includes(lowerQuery) ||
        def.category.name.includes(query) // Direct Chinese match
      ) {
        matchingCategoryIds.add(def.category.id);
      }

      def.variants.forEach(variant => {
        if (
          variant.name.toLowerCase().includes(lowerQuery) ||
          variant.nameEn.toLowerCase().includes(lowerQuery) ||
          variant.name.includes(query) // Direct Chinese match
        ) {
          matchingVariantIds.add(`${def.category.id}_${variant.id}`);
        }
      });
    });

    return getAllDecorItems().filter(item => {
      const matchesCategory = matchingCategoryIds.has(item.categoryId);
      const matchesVariant = matchingVariantIds.has(`${item.categoryId}_${item.variantId}`);
      const matchesPikminType = matchingPikminTypes.size > 0 ? matchingPikminTypes.has(item.pikminType) : false;
      
      // If searching for pikmin type + category/variant, require both
      if (matchingPikminTypes.size > 0 && (matchingCategoryIds.size > 0 || matchingVariantIds.size > 0)) {
        return matchesPikminType && (matchesCategory || matchesVariant);
      }
      
      // Otherwise return any match
      return matchesCategory || matchesVariant || matchesPikminType;
    });
  };

  // Get items filtered by category AND variant
  const getItemsByCategoryAndVariant = (categoryId: string, variantId: string): DecorItem[] => {
    return (itemsByCategory.get(categoryId) ?? []).filter(item => item.variantId === variantId);
  };

  // Get a flat list of all variant options (each variant is independent)
  // Used by the hero settings searchable combobox
  interface VariantOption {
    value: string;           // "categoryId:variantId"
    categoryId: string;
    categoryName: string;
    categoryNameEn: string;
    categoryType: DecorCategoryType;
    categoryIcon?: string;
    variantId: string;
    variantName: string;
    variantNameEn: string;
    imageUrl: string;
    pikminCount: number;
  }

  const getAllVariantOptions = (): VariantOption[] => {
    const options: VariantOption[] = [];
    decorDefinitions.forEach((def) => {
      def.variants.forEach((variant) => {
        const items = getItemsByCategoryAndVariant(def.category.id, variant.id);
        options.push({
          value: `${def.category.id}:${variant.id}`,
          categoryId: def.category.id,
          categoryName: def.category.name,
          categoryNameEn: def.category.nameEn,
          categoryType: def.category.type,
          categoryIcon: def.category.icon,
          variantId: variant.id,
          variantName: variant.name,
          variantNameEn: variant.nameEn,
          imageUrl: (variant as any).imageUrl || '',
          pikminCount: items.length,
        });
      });
    });
    return options;
  };

  return {
    getDecorDefinitions,
    getAllDecorItems,
    getItemsByCategory,
    getItemsByCategoryType,
    getItemsByPikminType,
    getVariant,
    getCategory,
    getImageUrl,
    getAllCategories,
    getCategoriesByType,
    searchItems,
    getItemsByCategoryAndVariant,
    getAllVariantOptions,
  };
}
