import type { DecorDefinition, DecorItem, PikminType, DecorCategoryType } from '~/types/decor';
import { PIKMIN_TYPES } from '~/types/decor';
import decorData from '~/data/decor.json';

export function useDecorData() {
  // Get all decor definitions from JSON
  const getDecorDefinitions = (): DecorDefinition[] => {
    return decorData.definitions as DecorDefinition[];
  };

  // Get all possible decor items (category + variant + pikmin type combinations)
  const getAllDecorItems = (): DecorItem[] => {
    const definitions = getDecorDefinitions();
    const items: DecorItem[] = [];

    definitions.forEach(def => {
      const availableTypes = def.availablePikminTypes || PIKMIN_TYPES;
      
      def.variants.forEach(variant => {
        availableTypes.forEach(pikminType => {
          items.push({
            id: `${def.category.id}_${variant.id}_${pikminType}`,
            categoryId: def.category.id,
            variantId: variant.id,
            pikminType: pikminType as PikminType,
            available: true,
          });
        });
      });
    });

    return items;
  };

  // Get items filtered by category
  const getItemsByCategory = (categoryId: string): DecorItem[] => {
    return getAllDecorItems().filter(item => item.categoryId === categoryId);
  };

  // Get items filtered by category type (regular, special, etc.)
  const getItemsByCategoryType = (type: DecorCategoryType): DecorItem[] => {
    const definitions = getDecorDefinitions();
    const categoryIds = definitions
      .filter(def => def.category.type === type)
      .map(def => def.category.id);
    
    return getAllDecorItems().filter(item => categoryIds.includes(item.categoryId));
  };

  // Get items filtered by Pikmin type
  const getItemsByPikminType = (pikminType: PikminType): DecorItem[] => {
    return getAllDecorItems().filter(item => item.pikminType === pikminType);
  };

  // Get a specific variant by ID
  const getVariant = (categoryId: string, variantId: string) => {
    const definitions = getDecorDefinitions();
    const def = definitions.find(d => d.category.id === categoryId);
    if (!def) return null;
    return def.variants.find(v => v.id === variantId) || null;
  };

  // Get category by ID
  const getCategory = (categoryId: string) => {
    const definitions = getDecorDefinitions();
    const def = definitions.find(d => d.category.id === categoryId);
    return def?.category || null;
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

  // Search items by name
  const searchItems = (query: string): DecorItem[] => {
    if (!query.trim()) return getAllDecorItems();
    
    const lowerQuery = query.toLowerCase();
    const definitions = getDecorDefinitions();
    const matchingCategoryIds = new Set<string>();
    const matchingVariantIds = new Set<string>();

    definitions.forEach(def => {
      if (
        def.category.name.toLowerCase().includes(lowerQuery) ||
        def.category.nameEn.toLowerCase().includes(lowerQuery)
      ) {
        matchingCategoryIds.add(def.category.id);
      }

      def.variants.forEach(variant => {
        if (
          variant.name.toLowerCase().includes(lowerQuery) ||
          variant.nameEn.toLowerCase().includes(lowerQuery)
        ) {
          matchingVariantIds.add(`${def.category.id}_${variant.id}`);
        }
      });
    });

    return getAllDecorItems().filter(item => {
      return matchingCategoryIds.has(item.categoryId) ||
             matchingVariantIds.has(`${item.categoryId}_${item.variantId}`);
    });
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
  };
}
