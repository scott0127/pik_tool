/**
 * useDecorData 單元測試
 * 斷言不變式而非寫死數字，避免 decor.json 更新就要改測試。
 */
import { describe, it, expect } from 'vitest';
import { useDecorData } from '~/composables/useDecorData';
import { DECOR_CATEGORY_TYPES, PIKMIN_TYPES, type PikminType } from '~/types/decor';
import decorData from '~/data/decor.json';

const {
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
} = useDecorData();

const allItems = getAllDecorItems();
const definitions = getDecorDefinitions();

describe('getAllDecorItems — 結構不變式', () => {
  it('應該產生項目', () => {
    expect(allItems.length).toBeGreaterThan(0);
  });

  it('每個 id 都應該是 categoryId_variantId_pikminType', () => {
    allItems.forEach(item => {
      expect(item.id).toBe(`${item.categoryId}_${item.variantId}_${item.pikminType}`);
    });
  });

  it('所有 id 都應該唯一', () => {
    const ids = allItems.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('所有 pikminType 都應該是合法的 8 種之一', () => {
    const valid = new Set<PikminType>(PIKMIN_TYPES);
    allItems.forEach(item => {
      expect(valid.has(item.pikminType)).toBe(true);
    });
  });

  it('每個項目都應該標記為 available', () => {
    expect(allItems.every(item => item.available === true)).toBe(true);
  });

  it('每個 definition 都應該至少產生一個項目', () => {
    const categoryIdsWithItems = new Set(allItems.map(item => item.categoryId));
    const missing = definitions
      .map(def => def.category.id)
      .filter(id => !categoryIdsWithItems.has(id));
    expect(missing).toEqual([]);
  });

  it('每個項目的 categoryId / variantId 都應該真的存在於 decor.json', () => {
    const validPairs = new Set(
      definitions.flatMap(def => def.variants.map(v => `${def.category.id}_${v.id}`)),
    );
    allItems.forEach(item => {
      expect(validPairs.has(`${item.categoryId}_${item.variantId}`)).toBe(true);
    });
  });

  it('回傳的應該是同一個快取陣列（呼叫端不該預期拿到新副本）', () => {
    // 回傳共用陣列，呼叫端就地修改會污染全域
    expect(getAllDecorItems()).toBe(allItems);
  });
});

describe('getAllDecorItems — 顏色來源分支', () => {
  it('有 imageUrls 的 variant 應該以 imageUrls 的 key 決定顏色（忽略 availablePikminTypes）', () => {
    const withImageUrls = definitions.flatMap(def =>
      def.variants
        .filter(v => (v as any).imageUrls)
        .map(v => ({ def, variant: v })),
    );
    expect(withImageUrls.length).toBeGreaterThan(0);

    withImageUrls.forEach(({ def, variant }) => {
      const imageKeys = new Set(Object.keys((variant as any).imageUrls));
      const expected = PIKMIN_TYPES.filter(type => imageKeys.has(type));
      const actual = getItemsByCategoryAndVariant(def.category.id, variant.id)
        .map(item => item.pikminType);
      expect(actual).toEqual(expected);
    });
  });

  it('目前每個 variant 都有 imageUrls —— availablePikminTypes 分支是死路', () => {
    // availablePikminTypes 分支目前沒有資料會觸發，
    // 直接測會是空迴圈；改成斷言現況，分支變活時會變紅提醒補測試。
    const withoutImageUrls = definitions.flatMap(def =>
      def.variants
        .filter(v => !(v as any).imageUrls)
        .map(v => `${def.category.id}/${v.id}`),
    );

    expect(withoutImageUrls).toEqual([]);
  });

  it('顏色順序應該遵循 PIKMIN_TYPES 的標準排序（有 imageUrls 時）', () => {
    const sample = definitions
      .flatMap(def => def.variants.map(v => ({ def, variant: v })))
      .find(({ variant }) => Object.keys((variant as any).imageUrls || {}).length > 2);

    expect(sample).toBeTruthy();
    const types = getItemsByCategoryAndVariant(sample!.def.category.id, sample!.variant.id)
      .map(item => item.pikminType);
    const sorted = [...types].sort(
      (a, b) => PIKMIN_TYPES.indexOf(a) - PIKMIN_TYPES.indexOf(b),
    );
    expect(types).toEqual(sorted);
  });
});

describe('索引查詢的一致性', () => {
  it('所有 getItemsByCategory 的總和應該等於 getAllDecorItems', () => {
    const total = definitions.reduce(
      (sum, def) => sum + getItemsByCategory(def.category.id).length,
      0,
    );
    expect(total).toBe(allItems.length);
  });

  it('所有 getItemsByCategoryType 的總和應該等於 getAllDecorItems', () => {
    const total = DECOR_CATEGORY_TYPES.reduce(
      (sum, { id }) => sum + getItemsByCategoryType(id).length,
      0,
    );
    expect(total).toBe(allItems.length);
  });

  it('所有 getItemsByPikminType 的總和應該等於 getAllDecorItems', () => {
    const total = PIKMIN_TYPES.reduce(
      (sum, type) => sum + getItemsByPikminType(type).length,
      0,
    );
    expect(total).toBe(allItems.length);
  });

  it('getItemsByCategory 回傳的項目都應該屬於該分類', () => {
    definitions.slice(0, 10).forEach(def => {
      getItemsByCategory(def.category.id).forEach(item => {
        expect(item.categoryId).toBe(def.category.id);
      });
    });
  });

  it('未知分類應該回傳空陣列而不是 undefined', () => {
    expect(getItemsByCategory('does-not-exist')).toEqual([]);
    expect(getItemsByCategoryAndVariant('does-not-exist', 'nope')).toEqual([]);
  });
});

describe('getVariant / getCategory', () => {
  it('應該能查到真實存在的 variant 與 category', () => {
    const def = definitions[0]!;
    const variant = def.variants[0]!;

    expect(getCategory(def.category.id)).toEqual(def.category);
    expect(getVariant(def.category.id, variant.id)).toEqual(variant);
  });

  it('查不到時應該回傳 null（不是 undefined）', () => {
    expect(getCategory('does-not-exist')).toBeNull();
    expect(getVariant('does-not-exist', 'nope')).toBeNull();
  });

  it('getAllCategories 應該與 definitions 一一對應', () => {
    expect(getAllCategories().map(c => c.id)).toEqual(definitions.map(d => d.category.id));
  });

  it('getCategoriesByType 應該只回傳該類型的分類', () => {
    DECOR_CATEGORY_TYPES.forEach(({ id }) => {
      getCategoriesByType(id).forEach(category => {
        expect(category.type).toBe(id);
      });
    });
  });

  it('所有 getCategoriesByType 的總和應該等於分類總數', () => {
    const total = DECOR_CATEGORY_TYPES.reduce(
      (sum, { id }) => sum + getCategoriesByType(id).length,
      0,
    );
    expect(total).toBe(definitions.length);
  });
});

describe('getImageUrl', () => {
  it('有 imageUrls 時應該回傳該顏色的網址', () => {
    const found = definitions
      .flatMap(def => def.variants.map(v => ({ def, variant: v as any })))
      .find(({ variant }) => variant.imageUrls && Object.keys(variant.imageUrls).length > 0);

    expect(found).toBeTruthy();
    const type = Object.keys(found!.variant.imageUrls)[0] as PikminType;
    expect(getImageUrl(found!.def.category.id, found!.variant.id, type))
      .toBe(found!.variant.imageUrls[type]);
  });

  it('該顏色沒有專屬圖時應該退回 variant 的 imageUrl', () => {
    const found = definitions
      .flatMap(def => def.variants.map(v => ({ def, variant: v as any })))
      .find(({ variant }) =>
        variant.imageUrl &&
        variant.imageUrls &&
        PIKMIN_TYPES.some(type => !variant.imageUrls[type]),
      );

    // 不要用 `if (!found) return`，資料變動後會靜默變成空測試
    expect(found).toBeTruthy();

    const missingType = PIKMIN_TYPES.find(type => !found!.variant.imageUrls[type])!;
    expect(getImageUrl(found!.def.category.id, found!.variant.id, missingType))
      .toBe(found.variant.imageUrl);
  });

  it('variant 不存在時應該回傳 null', () => {
    expect(getImageUrl('does-not-exist', 'nope', 'red')).toBeNull();
  });

  it('每個產生出來的項目都應該有圖可以顯示', () => {
    const withoutImage = allItems.filter(
      item => !getImageUrl(item.categoryId, item.variantId, item.pikminType),
    );
    expect(withoutImage).toEqual([]);
  });
});

describe('searchItems', () => {
  it('空字串應該回傳全部項目', () => {
    expect(searchItems('')).toHaveLength(allItems.length);
    expect(searchItems('   ')).toHaveLength(allItems.length);
  });

  it('用中文分類名稱搜尋應該找到該分類的項目', () => {
    const results = searchItems('餐廳');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(item => item.categoryId === 'restaurant')).toBe(true);
  });

  it('用英文分類名稱搜尋應該找到該分類的項目（不分大小寫）', () => {
    const lower = searchItems('restaurant');
    const upper = searchItems('RESTAURANT');
    expect(lower.length).toBeGreaterThan(0);
    expect(upper.map(i => i.id)).toEqual(lower.map(i => i.id));
  });

  it('用皮克敏顏色搜尋應該只回傳該顏色的項目', () => {
    const results = searchItems('yellow');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(item => item.pikminType === 'yellow')).toBe(true);
  });

  it('中文顏色搜尋應該等同於英文顏色搜尋', () => {
    expect(searchItems('紫').map(i => i.id)).toEqual(searchItems('purple').map(i => i.id));
  });

  it('完全沒有比對到的字串應該回傳空陣列', () => {
    expect(searchItems('zzzzz-not-a-real-thing')).toEqual([]);
  });

  it('顏色 + 分類同時命中時應該是 AND 關係', () => {
    // '冰' 同時命中冰皮克敏與冰淇淋/刨冰店，走 AND 分支
    const results = searchItems('冰');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(item => item.pikminType === 'ice')).toBe(true);
  });

  it('已知限制：關鍵字同時是顏色與分類名時，會藏住大部分結果', () => {
    // AND 規則的副作用，兩邊都看不全；鎖住現況，改規則時會被提醒
    const iceSearch = searchItems('冰');
    const allIcePikmin = getItemsByPikminType('ice');

    expect(iceSearch.length).toBeLessThan(allIcePikmin.length);
  });
});

describe('getAllVariantOptions', () => {
  const options = getAllVariantOptions();

  it('應該每個 variant 一筆', () => {
    const variantCount = definitions.reduce((sum, def) => sum + def.variants.length, 0);
    expect(options).toHaveLength(variantCount);
  });

  it('value 應該是 categoryId:variantId 格式', () => {
    options.forEach(option => {
      expect(option.value).toBe(`${option.categoryId}:${option.variantId}`);
    });
  });

  it('value 應該唯一（HeroSettingsModal 用它當 key）', () => {
    const values = options.map(o => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('pikminCount 應該等於該 variant 實際產生的項目數', () => {
    options.forEach(option => {
      expect(option.pikminCount).toBe(
        getItemsByCategoryAndVariant(option.categoryId, option.variantId).length,
      );
    });
  });

  it('每個選項都應該解析出一張可顯示的圖', () => {
    expect(options.filter(o => !o.imageUrl)).toEqual([]);
  });
});

describe('decor.json 與型別常數的一致性', () => {
  it('每個 category.type 都應該是 DECOR_CATEGORY_TYPES 裡定義過的', () => {
    const validTypes = new Set(DECOR_CATEGORY_TYPES.map(t => t.id));
    decorData.definitions.forEach((def: any) => {
      expect(validTypes.has(def.category.type)).toBe(true);
    });
  });

  it('availablePikminTypes 只能包含合法的皮克敏顏色', () => {
    const valid = new Set<string>(PIKMIN_TYPES);
    decorData.definitions.forEach((def: any) => {
      (def.availablePikminTypes || []).forEach((type: string) => {
        expect(valid.has(type)).toBe(true);
      });
    });
  });

  it('同一個分類內的 variant id 不應重複', () => {
    definitions.forEach(def => {
      const ids = def.variants.map(v => v.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('category id 不應重複', () => {
    const categoryIds = definitions.map(def => def.category.id);
    expect(new Set(categoryIds).size).toBe(categoryIds.length);
  });

  it('2025-ornament 的 availablePikminTypes 應包含 ice', () => {
    const ornament = decorData.definitions.find((d: any) => d.category.id === '2025-ornament');
    expect(ornament).toBeTruthy();
    expect((ornament as any).availablePikminTypes).toContain('ice');
  });
});

describe('imageUrls 與 availablePikminTypes 的落差', () => {
  // 兩邊對不上時實際生效的是 imageUrls。
  // 加 exception 前先確認遊戲內是否真有該組合，正解通常是補 availablePikminTypes。
  const KNOWN_OVERFLOWS = new Set<string>([]);

  const findOverflows = (): string[] => {
    const overflows: string[] = [];

    decorData.definitions.forEach((def: any) => {
      const availableTypes = new Set(def.availablePikminTypes || PIKMIN_TYPES);
      def.variants.forEach((variant: any) => {
        if (!variant.imageUrls) return;
        const extras = Object.keys(variant.imageUrls).filter(c => !availableTypes.has(c));
        if (extras.length > 0) {
          overflows.push(`${def.category.id}/${variant.id}: 多出 [${extras.join(', ')}]`);
        }
      });
    });

    return overflows;
  };

  it('imageUrls 的顏色不應超過 availablePikminTypes（已知例外除外）', () => {
    expect(findOverflows().filter(e => !KNOWN_OVERFLOWS.has(e))).toEqual([]);
  });

  // 讓 allowlist 自己過期：資料修好後變紅，提醒移除 exception
  it('已知例外清單不應含有已經修好的項目', () => {
    const actual = new Set(findOverflows());
    expect([...KNOWN_OVERFLOWS].filter(e => !actual.has(e))).toEqual([]);
  });
});
