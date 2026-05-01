import { computed, type Ref } from "vue";
import type { DecorCategoryType, DecorItem, PikminType } from "~/types/decor";

export type CollectionStatusFilter = "all" | "collected" | "uncollected";
export type CollectionCategoryFilter =
  | DecorCategoryType
  | "uncollected-regular"
  | "anniversary";

interface UseCollectionFiltersOptions {
  searchQuery: Ref<string>;
  selectedCategoryType: Ref<CollectionCategoryFilter | null>;
  selectedPikminType: Ref<PikminType | null>;
  collectionFilter: Ref<CollectionStatusFilter>;
  isLimitedMode: Ref<boolean>;
  selectedCategoryId: Ref<string | null>;
  isCollected: (itemId: string) => boolean;
  getAllDecorItems: () => DecorItem[];
  getItemsByCategoryType: (type: DecorCategoryType) => DecorItem[];
  searchItems: (query: string) => DecorItem[];
}

const LIMITED_CATEGORY_TYPES: DecorCategoryType[] = ["regional", "special"];
const ANNIVERSARY_CATEGORY_IDS = [
  "first-anniversary-snack",
  "3rd-anniversary-cupcake",
  "4th-anniversary-flower-box",
  "4th-anniversary-snack",
];

export const useCollectionFilters = ({
  searchQuery,
  selectedCategoryType,
  selectedPikminType,
  collectionFilter,
  isLimitedMode,
  selectedCategoryId,
  isCollected,
  getAllDecorItems,
  getItemsByCategoryType,
  searchItems,
}: UseCollectionFiltersOptions) => {
  const activeFilterCount = computed(() => {
    let count = 0;
    if (searchQuery.value) count++;
    if (selectedCategoryType.value) count++;
    if (selectedPikminType.value) count++;
    if (collectionFilter.value !== "all") count++;
    if (isLimitedMode.value) count++;
    if (selectedCategoryId.value) count++;
    return count;
  });

  const hasActiveFilters = computed(() => activeFilterCount.value > 0);

  const filteredItems = computed(() => {
    let items = searchQuery.value ? searchItems(searchQuery.value) : getAllDecorItems();

    if (isLimitedMode.value) {
      const limitedItemIds = new Set(
        LIMITED_CATEGORY_TYPES.flatMap((type) => getItemsByCategoryType(type)).map(
          (item) => item.id,
        ),
      );
      items = items.filter((item) => limitedItemIds.has(item.id));
    }

    if (selectedCategoryType.value) {
      const categoryType = selectedCategoryType.value;

      if (categoryType === "uncollected-regular") {
        const regularItemIds = new Set(
          getItemsByCategoryType("regular").map((item) => item.id),
        );
        items = items.filter(
          (item) => regularItemIds.has(item.id) && !isCollected(item.id),
        );
      } else if (categoryType === "anniversary") {
        items = items.filter((item) =>
          ANNIVERSARY_CATEGORY_IDS.includes(item.categoryId),
        );
      } else {
        const categoryTypeItemIds = new Set(
          getItemsByCategoryType(categoryType).map((item) => item.id),
        );
        items = items.filter((item) => categoryTypeItemIds.has(item.id));
      }
    }

    if (selectedCategoryId.value) {
      items = items.filter((item) => item.categoryId === selectedCategoryId.value);
    }

    if (selectedPikminType.value) {
      items = items.filter((item) => item.pikminType === selectedPikminType.value);
    }

    if (collectionFilter.value === "collected") {
      items = items.filter((item) => isCollected(item.id));
    } else if (collectionFilter.value === "uncollected") {
      items = items.filter((item) => !isCollected(item.id));
    }

    return items;
  });

  const collectedCount = computed(
    () => filteredItems.value.filter((item) => isCollected(item.id)).length,
  );

  const clearAllFilters = () => {
    searchQuery.value = "";
    selectedCategoryType.value = null;
    selectedPikminType.value = null;
    collectionFilter.value = "all";
    isLimitedMode.value = false;
    selectedCategoryId.value = null;
  };

  return {
    activeFilterCount,
    hasActiveFilters,
    filteredItems,
    collectedCount,
    clearAllFilters,
  };
};
