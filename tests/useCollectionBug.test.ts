/**
 * 飾品蒐集數量異常跳動 Bug 複現測試
 * 
 * 問題：使用者反映按了 103 種後，下一分鐘突然變成 107 種
 * 
 * 測試策略：
 * 1. 驗證 UNION merge 會引入幽靈 ID（cloud 有但 decor.json 中不存在的 ID）
 * 2. 驗證 imageUrls vs availablePikminTypes 不一致性
 * 3. 驗證多分頁 merge 導致的資料爆炸
 */
import { describe, it, expect, beforeEach } from 'vitest';
import decorData from '~/data/decor.json';

// =====================================================
// Helper：模擬 useDecorData 的 getAllDecorItems 邏輯
// =====================================================
const PIKMIN_TYPES = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'] as const;
type PikminType = typeof PIKMIN_TYPES[number];

interface DecorItem {
  id: string;
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
}

function getAllDecorItems(): DecorItem[] {
  const definitions = decorData.definitions;
  const items: DecorItem[] = [];

  definitions.forEach((def: any) => {
    const availableTypes = def.availablePikminTypes || PIKMIN_TYPES;

    def.variants.forEach((variant: any) => {
      const variantImageUrls = variant.imageUrls;
      let typesToGenerate: PikminType[];

      if (variantImageUrls && typeof variantImageUrls === 'object') {
        const availableTypesInVariant = new Set(Object.keys(variantImageUrls) as PikminType[]);
        typesToGenerate = PIKMIN_TYPES.filter(type => availableTypesInVariant.has(type));
      } else {
        typesToGenerate = availableTypes as PikminType[];
      }

      typesToGenerate.forEach(pikminType => {
        items.push({
          id: `${def.category.id}_${variant.id}_${pikminType}`,
          categoryId: def.category.id,
          variantId: variant.id,
          pikminType: pikminType,
        });
      });
    });
  });

  return items;
}

// =====================================================
// Helper：模擬 useCollection 的 mergeCollections 邏輯（當前有 Bug 的版本）
// =====================================================
function mergeCollections_buggy(
  local: Record<string, boolean>,
  cloud: Record<string, boolean>
): Record<string, boolean> {
  const merged: Record<string, boolean> = { ...local };
  Object.keys(cloud).forEach(id => {
    if (cloud[id]) {
      merged[id] = true; // ← 不驗證 ID 是否有效！
    }
  });
  return merged;
}

// =====================================================
// Helper：修復後的 mergeCollections（加入有效性驗證）
// =====================================================
function mergeCollections_fixed(
  local: Record<string, boolean>,
  cloud: Record<string, boolean>
): Record<string, boolean> {
  const validIds = new Set(getAllDecorItems().map(item => item.id));
  const merged: Record<string, boolean> = {};

  Object.keys(local).forEach(id => {
    if (local[id] && validIds.has(id)) merged[id] = true;
  });
  Object.keys(cloud).forEach(id => {
    if (cloud[id] && validIds.has(id)) merged[id] = true;
  });

  return merged;
}

function countCollected(state: Record<string, boolean>): number {
  return Object.keys(state).filter(id => state[id]).length;
}

// =====================================================
// 測試開始
// =====================================================
describe('Bug 複現：飾品蒐集數量異常跳動', () => {
  let allItems: DecorItem[];
  let validIds: Set<string>;

  beforeEach(() => {
    allItems = getAllDecorItems();
    validIds = new Set(allItems.map(item => item.id));
  });

  // ----- 基礎驗證 -----
  describe('基礎驗證：DecorItem 生成', () => {
    it('應該能從 decor.json 生成 DecorItems', () => {
      expect(allItems.length).toBeGreaterThan(0);
      console.log(`[INFO] 總 DecorItem 數量: ${allItems.length}`);
    });

    it('所有 DecorItem ID 應該是唯一的', () => {
      const ids = allItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      
      if (duplicates.length > 0) {
        console.warn('[WARNING] 發現重複 ID:', duplicates);
      }
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ----- Bug 1：imageUrls vs availablePikminTypes 不一致 -----
  describe('Bug 檢測：imageUrls vs availablePikminTypes 不一致', () => {
    it('檢查所有 variant 的 imageUrls 顏色數量是否超過 availablePikminTypes', () => {
      const inconsistencies: Array<{
        category: string;
        variant: string;
        imageUrlsCount: number;
        availableTypesCount: number;
        extraColors: string[];
      }> = [];

      decorData.definitions.forEach((def: any) => {
        const availableTypes = new Set(def.availablePikminTypes || PIKMIN_TYPES);

        def.variants.forEach((variant: any) => {
          if (variant.imageUrls && typeof variant.imageUrls === 'object') {
            const imageUrlColors = Object.keys(variant.imageUrls);
            const extraColors = imageUrlColors.filter(color => !availableTypes.has(color));

            if (extraColors.length > 0) {
              inconsistencies.push({
                category: def.category.id,
                variant: variant.id,
                imageUrlsCount: imageUrlColors.length,
                availableTypesCount: availableTypes.size,
                extraColors,
              });
            }
          }
        });
      });

      if (inconsistencies.length > 0) {
        console.warn('[BUG FOUND] imageUrls 有比 availablePikminTypes 更多的顏色:');
        inconsistencies.forEach(inc => {
          console.warn(`  ${inc.category}/${inc.variant}: imageUrls 有 ${inc.imageUrlsCount} 色, availablePikminTypes 有 ${inc.availableTypesCount} 色, 多出: [${inc.extraColors.join(', ')}]`);
        });
      }

      // 記錄但不強制失敗 — 這是資料品質問題
      console.log(`[RESULT] 不一致的 variant 數量: ${inconsistencies.length}`);
      // 如果有不一致，每個不一致的 variant 都會多生成 extraColors.length 個 DecorItem
      const totalExtraItems = inconsistencies.reduce((sum, inc) => sum + inc.extraColors.length, 0);
      console.log(`[RESULT] 因不一致而多出的 DecorItem 數量: ${totalExtraItems}`);
    });
  });

  // ----- Bug 2：UNION Merge 引入幽靈 ID -----
  describe('Bug 複現：UNION merge 引入幽靈 ID', () => {
    it('幽靈 ID 從雲端合併後會增加 collectionState 的計數', () => {
      // 模擬使用者收集 103 個有效項目
      const local: Record<string, boolean> = {};
      const itemsToCollect = allItems.slice(0, 103);
      itemsToCollect.forEach(item => {
        local[item.id] = true;
      });

      expect(countCollected(local)).toBe(103);

      // 模擬雲端有 4 個「幽靈 ID」（不存在於 decor.json 的舊版 ID）
      const cloud: Record<string, boolean> = { ...local };
      cloud['old_category_old_variant_red'] = true;
      cloud['deleted_category_v1_blue'] = true;
      cloud['renamed_category_variant_white'] = true;
      cloud['typo_catgory_variant_purple'] = true;

      // 使用有 Bug 的 merge
      const merged = mergeCollections_buggy(local, cloud);

      const mergedCount = countCollected(merged);
      console.log(`[BUG REPRODUCED] Local: 103, Cloud 有 4 個幽靈 ID, Merged: ${mergedCount}`);

      // ⚠️ Bug 展現：merge 後變成 107，多了 4 個！
      expect(mergedCount).toBe(107);
    });

    it('但 getStats() 計算方式不會把幽靈 ID 計入（因為遍歷的是 getAllDecorItems）', () => {
      // 模擬帶有幽靈 ID 的 collectionState
      const collected: Record<string, boolean> = {};
      const itemsToCollect = allItems.slice(0, 103);
      itemsToCollect.forEach(item => {
        collected[item.id] = true;
      });
      // 加入幽靈 ID
      collected['phantom_id_1'] = true;
      collected['phantom_id_2'] = true;
      collected['phantom_id_3'] = true;
      collected['phantom_id_4'] = true;

      // 模擬 getStats() 的計算方式
      let statsCollected = 0;
      allItems.forEach(item => {
        if (collected[item.id]) {
          statsCollected++;
        }
      });

      // getStats() 只計算有效項目 → 仍然是 103
      expect(statsCollected).toBe(103);

      // 但是 Object.keys(collected).filter(k => collected[k]).length 會是 107
      expect(countCollected(collected)).toBe(107);

      console.log(`[INFO] getStats() 計算結果: ${statsCollected} (正確)`);
      console.log(`[INFO] Object.keys 計算結果: ${countCollected(collected)} (包含幽靈)`);
    });

    it('collection.vue 的 collectedCount 也遍歷 filteredItems（來自 getAllDecorItems），所以理論上幽靈 ID 不會影響', () => {
      // collection.vue L466-468:
      // const collectedCount = computed(() => {
      //   return filteredItems.value.filter(item => isCollected(item.id)).length;
      // });
      
      // 所以 collection.vue 的 collectedCount 只計算有效 ID — 幽靈 ID 不會被計入
      // 這意味著使用者看到的數字來源不是單純的幽靈 ID 問題

      // 如果使用者看到數字從 103 → 107，問題出在 getAllDecorItems() 返回的列表變了
      // 也就是 decor.json 被更新了（SW 快取失效後重新載入新版）
      console.log('[ANALYSIS] 如果 collectedCount 用的是 filteredItems.filter(isCollected)');
      console.log('[ANALYSIS] 那麼幽靈 ID 不會被計入');
      console.log('[ANALYSIS] 數字跳動的原因必定是 decor.json 改變 或 合併引入了「有效但使用者沒手動標記」的 ID');
      expect(true).toBe(true); // 記錄分析結果
    });
  });

  // ----- Bug 3：多分頁/多裝置合併導致數量爆炸 -----
  describe('Bug 複現：多分頁合併導致數量增加', () => {
    it('不同分頁記錄的不同項目在 UNION merge 後會加總', () => {
      // 分頁 A: 使用者標記了項目 0-102 (共 103 個)
      const tabA: Record<string, boolean> = {};
      allItems.slice(0, 103).forEach(item => {
        tabA[item.id] = true;
      });

      // 分頁 B: 使用者先標記了 0-102，然後取消了 0-3，但又標記了 103-106
      // 所以分頁 B 有: 4-102 + 103-106 = 103 個（不同的 103 個）
      const tabB: Record<string, boolean> = {};
      allItems.slice(4, 107).forEach(item => {
        tabB[item.id] = true;
      });

      expect(countCollected(tabA)).toBe(103);
      expect(countCollected(tabB)).toBe(103);

      // UNION merge 結果：0-106 全部都是 true（共 107 個）
      const merged = mergeCollections_buggy(tabA, tabB);
      const mergedCount = countCollected(merged);

      console.log(`[BUG REPRODUCED] Tab A: 103, Tab B: 103, Merged: ${mergedCount}`);
      expect(mergedCount).toBe(107); // UNION 導致 103 + 4 = 107
    });

    it('修復後的 merge 對於合法但非預期的合併效果沒有改善（因為都是有效 ID）', () => {
      // 多分頁問題中所有 ID 都是有效的，所以 fixed merge 結果一樣
      const tabA: Record<string, boolean> = {};
      allItems.slice(0, 103).forEach(item => {
        tabA[item.id] = true;
      });

      const tabB: Record<string, boolean> = {};
      allItems.slice(4, 107).forEach(item => {
        tabB[item.id] = true;
      });

      const mergedFixed = mergeCollections_fixed(tabA, tabB);
      expect(countCollected(mergedFixed)).toBe(107);

      console.log('[INFO] 多分頁問題的修復需要更複雜的策略（如 last-write-wins 或向量單調時鐘）');
    });
  });

  // ----- 修復驗證 -----
  describe('修復驗證：mergeCollections_fixed 過濾幽靈 ID', () => {
    it('修復後的 merge 應該排除幽靈 ID', () => {
      const local: Record<string, boolean> = {};
      allItems.slice(0, 103).forEach(item => {
        local[item.id] = true;
      });

      // 雲端帶有 4 個幽靈 ID
      const cloud: Record<string, boolean> = { ...local };
      cloud['phantom_old_v1_red'] = true;
      cloud['phantom_old_v2_blue'] = true;
      cloud['phantom_old_v3_white'] = true;
      cloud['phantom_old_v4_purple'] = true;

      // Buggy version: 107
      expect(countCollected(mergeCollections_buggy(local, cloud))).toBe(107);

      // Fixed version: 103 — 幽靈 ID 被過濾掉了！
      expect(countCollected(mergeCollections_fixed(local, cloud))).toBe(103);

      console.log('[FIX VERIFIED] 修復後的 merge 成功排除了幽靈 ID');
    });
  });

  // ----- 報告：分析所有 category 的項目數量 -----
  describe('輔助分析：各 category 的項目數量', () => {
    it('列出所有 category 及其項目數量', () => {
      const categoryMap = new Map<string, number>();
      let totalVariants = 0;

      decorData.definitions.forEach((def: any) => {
        let categoryItemCount = 0;
        def.variants.forEach((variant: any) => {
          totalVariants++;
          const variantImageUrls = variant.imageUrls;
          let colorCount: number;

          if (variantImageUrls && typeof variantImageUrls === 'object') {
            colorCount = Object.keys(variantImageUrls).length;
          } else {
            colorCount = (def.availablePikminTypes || PIKMIN_TYPES).length;
          }
          categoryItemCount += colorCount;
        });

        categoryMap.set(def.category.id, categoryItemCount);
      });

      console.log(`\n[REPORT] 總分類數: ${decorData.definitions.length}`);
      console.log(`[REPORT] 總 variant 數（種類）: ${totalVariants}`);
      console.log(`[REPORT] 總 DecorItem 數（含顏色）: ${allItems.length}`);
      console.log(`[REPORT] 各分類項目數量:`);
      
      for (const [catId, count] of categoryMap) {
        console.log(`  ${catId}: ${count} items`);
      }

      expect(categoryMap.size).toBe(decorData.definitions.length);
    });
  });
});
