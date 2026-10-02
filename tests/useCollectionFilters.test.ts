/**
 * useCollectionFilters 單元測試
 * 相依皆為參數注入，只需 vue 的 ref/computed，不需 Nuxt 環境。
 * 用迷你假資料集，斷言可手算且不受 decor.json 變動影響。
 */
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import {
  useCollectionFilters,
  type CollectionCategoryFilter,
  type CollectionStatusFilter,
} from '~/composables/useCollectionFilters';
import type { DecorCategoryType, DecorItem, PikminType } from '~/types/decor';

const makeItem = (
  categoryId: string,
  variantId: string,
  pikminType: PikminType,
): DecorItem => ({
  id: `${categoryId}_${variantId}_${pikminType}`,
  categoryId,
  variantId,
  pikminType,
  available: true,
});

// 固定的迷你資料集：3 個 regular、2 個 special、1 個 regional、1 個 rare，外加一個週年慶分類。
const ITEMS_BY_TYPE: Record<string, DecorItem[]> = {
  regular: [
    makeItem('restaurant', 'chef_hat', 'red'),
    makeItem('restaurant', 'chef_hat', 'blue'),
    makeItem('cafe', 'cup', 'yellow'),
  ],
  special: [
    makeItem('halloween', 'pumpkin', 'red'),
    makeItem('halloween', 'pumpkin', 'white'),
  ],
  roadside: [],
  weather: [],
  regional: [makeItem('sakura', 'petal', 'winged')],
  rare: [makeItem('restaurant', 'chef_hat_rare', 'red')],
};

const ANNIVERSARY_ITEM = makeItem('4th-anniversary-snack', 'cake', 'purple');

const ALL_ITEMS: DecorItem[] = [
  ...ITEMS_BY_TYPE.regular!,
  ...ITEMS_BY_TYPE.special!,
  ...ITEMS_BY_TYPE.regional!,
  ...ITEMS_BY_TYPE.rare!,
  ANNIVERSARY_ITEM,
];

interface HarnessOptions {
  collectedIds?: string[];
  searchResults?: DecorItem[];
}

const createHarness = ({ collectedIds = [], searchResults }: HarnessOptions = {}) => {
  const searchQuery = ref('');
  const selectedCategoryType = ref<CollectionCategoryFilter | null>(null);
  const selectedPikminType = ref<PikminType | null>(null);
  const collectionFilter = ref<CollectionStatusFilter>('all');
  const isLimitedMode = ref(false);
  const selectedCategoryId = ref<string | null>(null);

  const collected = new Set(collectedIds);

  const filters = useCollectionFilters({
    searchQuery,
    selectedCategoryType,
    selectedPikminType,
    collectionFilter,
    isLimitedMode,
    selectedCategoryId,
    isCollected: (itemId: string) => collected.has(itemId),
    getAllDecorItems: () => ALL_ITEMS,
    getItemsByCategoryType: (type: DecorCategoryType) => ITEMS_BY_TYPE[type] ?? [],
    searchItems: () => searchResults ?? ALL_ITEMS,
  });

  return {
    ...filters,
    searchQuery,
    selectedCategoryType,
    selectedPikminType,
    collectionFilter,
    isLimitedMode,
    selectedCategoryId,
  };
};

const idsOf = (items: DecorItem[]) => items.map(item => item.id);

describe('activeFilterCount / hasActiveFilters', () => {
  it('沒有任何篩選時應該是 0', () => {
    const h = createHarness();
    expect(h.activeFilterCount.value).toBe(0);
    expect(h.hasActiveFilters.value).toBe(false);
  });

  it('每加一個篩選就應該 +1', () => {
    const h = createHarness();

    h.searchQuery.value = 'chef';
    expect(h.activeFilterCount.value).toBe(1);

    h.selectedCategoryType.value = 'regular';
    expect(h.activeFilterCount.value).toBe(2);

    h.selectedPikminType.value = 'red';
    expect(h.activeFilterCount.value).toBe(3);

    h.collectionFilter.value = 'collected';
    expect(h.activeFilterCount.value).toBe(4);

    h.isLimitedMode.value = true;
    expect(h.activeFilterCount.value).toBe(5);

    h.selectedCategoryId.value = 'restaurant';
    expect(h.activeFilterCount.value).toBe(6);

    expect(h.hasActiveFilters.value).toBe(true);
  });

  it('collectionFilter 設回 all 不應該算成一個篩選', () => {
    const h = createHarness();
    h.collectionFilter.value = 'all';
    expect(h.activeFilterCount.value).toBe(0);
  });

  it('空字串搜尋不應該算成一個篩選', () => {
    const h = createHarness();
    h.searchQuery.value = '';
    expect(h.activeFilterCount.value).toBe(0);
  });
});

describe('filteredItems', () => {
  it('沒有篩選時應該回傳全部項目', () => {
    const h = createHarness();
    expect(h.filteredItems.value).toHaveLength(ALL_ITEMS.length);
  });

  it('有搜尋字串時應該改用 searchItems 的結果當作起點', () => {
    const searchResults = [ITEMS_BY_TYPE.regular![0]!];
    const h = createHarness({ searchResults });
    h.searchQuery.value = 'chef';
    expect(idsOf(h.filteredItems.value)).toEqual(idsOf(searchResults));
  });

  it('依 pikminType 篩選', () => {
    const h = createHarness();
    h.selectedPikminType.value = 'red';
    expect(h.filteredItems.value.every(item => item.pikminType === 'red')).toBe(true);
    expect(h.filteredItems.value).toHaveLength(3);
  });

  it('依 categoryId 篩選', () => {
    const h = createHarness();
    h.selectedCategoryId.value = 'restaurant';
    expect(h.filteredItems.value.every(item => item.categoryId === 'restaurant')).toBe(true);
    expect(h.filteredItems.value).toHaveLength(3);
  });

  it('依 categoryType 篩選', () => {
    const h = createHarness();
    h.selectedCategoryType.value = 'special';
    expect(idsOf(h.filteredItems.value)).toEqual(idsOf(ITEMS_BY_TYPE.special!));
  });

  it('limited 模式應該只留下 regional + special', () => {
    const h = createHarness();
    h.isLimitedMode.value = true;

    const expected = new Set([
      ...idsOf(ITEMS_BY_TYPE.special!),
      ...idsOf(ITEMS_BY_TYPE.regional!),
    ]);
    expect(new Set(idsOf(h.filteredItems.value))).toEqual(expected);
  });

  it('collected 篩選只留已收集的', () => {
    const collectedId = ITEMS_BY_TYPE.regular![0]!.id;
    const h = createHarness({ collectedIds: [collectedId] });
    h.collectionFilter.value = 'collected';
    expect(idsOf(h.filteredItems.value)).toEqual([collectedId]);
  });

  it('uncollected 篩選只留未收集的', () => {
    const collectedId = ITEMS_BY_TYPE.regular![0]!.id;
    const h = createHarness({ collectedIds: [collectedId] });
    h.collectionFilter.value = 'uncollected';
    expect(idsOf(h.filteredItems.value)).not.toContain(collectedId);
    expect(h.filteredItems.value).toHaveLength(ALL_ITEMS.length - 1);
  });

  it('多個篩選應該是 AND 關係', () => {
    const h = createHarness();
    h.selectedCategoryType.value = 'regular';
    h.selectedPikminType.value = 'red';
    expect(idsOf(h.filteredItems.value)).toEqual(['restaurant_chef_hat_red']);
  });

  it('互斥的篩選組合應該回傳空陣列', () => {
    const h = createHarness();
    h.selectedCategoryType.value = 'special';
    h.selectedCategoryId.value = 'cafe';
    expect(h.filteredItems.value).toEqual([]);
  });
});

describe('filteredItems 特殊分類', () => {
  it('uncollected-regular 應該只留下「未收集的 regular」', () => {
    const collectedRegular = ITEMS_BY_TYPE.regular![0]!.id;
    const h = createHarness({ collectedIds: [collectedRegular] });
    h.selectedCategoryType.value = 'uncollected-regular';

    const ids = idsOf(h.filteredItems.value);
    expect(ids).not.toContain(collectedRegular);
    expect(ids).toHaveLength(ITEMS_BY_TYPE.regular!.length - 1);
    // 不應該混進 special / regional / rare
    expect(ids.every(id => idsOf(ITEMS_BY_TYPE.regular!).includes(id))).toBe(true);
  });

  it('uncollected-regular 在全部收集後應該回傳空陣列', () => {
    const h = createHarness({ collectedIds: idsOf(ITEMS_BY_TYPE.regular!) });
    h.selectedCategoryType.value = 'uncollected-regular';
    expect(h.filteredItems.value).toEqual([]);
  });

  it('anniversary 應該用 categoryId 白名單比對，而不是 categoryType', () => {
    const h = createHarness();
    h.selectedCategoryType.value = 'anniversary';
    expect(idsOf(h.filteredItems.value)).toEqual([ANNIVERSARY_ITEM.id]);
  });

  it('anniversary 白名單以外的分類不應被納入', () => {
    const h = createHarness();
    h.selectedCategoryType.value = 'anniversary';
    expect(idsOf(h.filteredItems.value)).not.toContain('restaurant_chef_hat_red');
  });
});

describe('collectedCount', () => {
  it('應該只計算「目前篩選結果內」的已收集項目', () => {
    const h = createHarness({
      collectedIds: [
        ITEMS_BY_TYPE.regular![0]!.id,
        ITEMS_BY_TYPE.special![0]!.id,
      ],
    });

    expect(h.collectedCount.value).toBe(2);

    h.selectedCategoryType.value = 'regular';
    expect(h.collectedCount.value).toBe(1);
  });

  it('沒有收集任何東西時應該是 0', () => {
    const h = createHarness();
    expect(h.collectedCount.value).toBe(0);
  });

  it('collectedCount 永遠不應該超過 filteredItems 的長度', () => {
    const h = createHarness({ collectedIds: idsOf(ALL_ITEMS) });
    h.selectedCategoryType.value = 'special';
    expect(h.collectedCount.value).toBeLessThanOrEqual(h.filteredItems.value.length);
    expect(h.collectedCount.value).toBe(ITEMS_BY_TYPE.special!.length);
  });
});

describe('clearAllFilters', () => {
  it('應該把每一個篩選都重設', () => {
    const h = createHarness();

    h.searchQuery.value = 'chef';
    h.selectedCategoryType.value = 'regular';
    h.selectedPikminType.value = 'red';
    h.collectionFilter.value = 'collected';
    h.isLimitedMode.value = true;
    h.selectedCategoryId.value = 'restaurant';
    expect(h.activeFilterCount.value).toBe(6);

    h.clearAllFilters();

    expect(h.searchQuery.value).toBe('');
    expect(h.selectedCategoryType.value).toBeNull();
    expect(h.selectedPikminType.value).toBeNull();
    expect(h.collectionFilter.value).toBe('all');
    expect(h.isLimitedMode.value).toBe(false);
    expect(h.selectedCategoryId.value).toBeNull();

    expect(h.activeFilterCount.value).toBe(0);
    expect(h.filteredItems.value).toHaveLength(ALL_ITEMS.length);
  });
});
