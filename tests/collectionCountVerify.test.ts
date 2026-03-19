/**
 * 圖鑑功能總數一致性驗證
 * 
 * 確認 decor.json → getAllDecorItems() → collection.vue → HeroSection 
 * 整條資料流的計數是否一致
 */
import { describe, it, expect } from 'vitest';
import decorData from '~/data/decor.json';

const PIKMIN_TYPES = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'] as const;
type PikminType = typeof PIKMIN_TYPES[number];

// =====================================================
// 完全複製 useDecorData.ts 的 getAllDecorItems 邏輯
// =====================================================
function getAllDecorItems() {
  const definitions = decorData.definitions;
  const items: Array<{ id: string; categoryId: string; variantId: string; pikminType: PikminType }> = [];

  definitions.forEach((def: any) => {
    const availableTypes = def.availablePikminTypes || PIKMIN_TYPES;

    def.variants.forEach((variant: any) => {
      const variantImageUrls = variant.imageUrls;
      let typesToGenerate: PikminType[];

      if (variantImageUrls && typeof variantImageUrls === 'object') {
        // ★ 分支 A: 有 imageUrls → 用 imageUrls 的 key 決定顏色
        const availableTypesInVariant = new Set(Object.keys(variantImageUrls) as PikminType[]);
        typesToGenerate = PIKMIN_TYPES.filter(type => availableTypesInVariant.has(type));
      } else {
        // ★ 分支 B: 沒有 imageUrls → 用 availablePikminTypes
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
// 模擬 getStats() 的計算 (useCollection.ts L233-293)
// =====================================================
function simulateGetStats(collected: Record<string, boolean>) {
  const items = getAllDecorItems();
  let collectedCount = 0;

  items.forEach(item => {
    if (collected[item.id]) {
      collectedCount++;
    }
  });

  return {
    total: items.length,
    collected: collectedCount,
    percentage: items.length > 0 ? Math.round((collectedCount / items.length) * 100) : 0,
  };
}

// =====================================================
// 模擬 collection.vue 的 collectedCount (L466-468)
// =====================================================
function simulateCollectionPageCount(
  filteredItems: Array<{ id: string }>,
  collected: Record<string, boolean>
) {
  return filteredItems.filter(item => collected[item.id]).length;
}

// =====================================================
// 直接從 decor.json 計算「應有」的數量
// =====================================================
function countFromDecorJsonDirectly() {
  let totalFromAvailablePikminTypes = 0;
  let totalFromImageUrls = 0;
  let totalActual = 0; // 模擬真實邏輯
  let variantCount = 0;
  let categoryCount = decorData.definitions.length;

  const details: Array<{
    category: string;
    variant: string;
    usedBranch: 'imageUrls' | 'availablePikminTypes';
    imageUrlsCount: number | null;
    availableTypesCount: number;
    actualCount: number;
    mismatch: boolean;
  }> = [];

  decorData.definitions.forEach((def: any) => {
    const availableTypes = def.availablePikminTypes || PIKMIN_TYPES;
    const availableTypesCount = availableTypes.length;

    def.variants.forEach((variant: any) => {
      variantCount++;
      const variantImageUrls = variant.imageUrls;
      let actualColors: number;
      let usedBranch: 'imageUrls' | 'availablePikminTypes';

      if (variantImageUrls && typeof variantImageUrls === 'object') {
        const imageUrlsColorCount = Object.keys(variantImageUrls).length;
        totalFromImageUrls += imageUrlsColorCount;
        actualColors = imageUrlsColorCount;
        usedBranch = 'imageUrls';
      } else {
        actualColors = availableTypesCount;
        usedBranch = 'availablePikminTypes';
      }

      totalFromAvailablePikminTypes += availableTypesCount;
      totalActual += actualColors;

      const imageUrlsCount = variantImageUrls ? Object.keys(variantImageUrls).length : null;
      const mismatch = imageUrlsCount !== null && imageUrlsCount !== availableTypesCount;

      details.push({
        category: def.category.id,
        variant: variant.id,
        usedBranch,
        imageUrlsCount,
        availableTypesCount,
        actualCount: actualColors,
        mismatch,
      });
    });
  });

  return {
    categoryCount,
    variantCount,
    totalFromAvailablePikminTypes,
    totalFromImageUrls,
    totalActual,
    details,
    mismatches: details.filter(d => d.mismatch),
  };
}

// =====================================================
// 測試開始
// =====================================================
describe('圖鑑功能總數一致性驗證', () => {

  describe('Level 1: decor.json 本身的數據統計', () => {
    it('統計 decor.json 的分類數、variant 數、理論總項目數', () => {
      const directCount = countFromDecorJsonDirectly();

      console.log('\n========== decor.json 統計 ==========');
      console.log(`分類 (category) 數量: ${directCount.categoryCount}`);
      console.log(`飾品種類 (variant) 數量: ${directCount.variantCount}`);
      console.log(`理論總項目數 (用 availablePikminTypes 算): ${directCount.totalFromAvailablePikminTypes}`);
      console.log(`實際總項目數 (走 imageUrls 分支後): ${directCount.totalActual}`);
      console.log(`差異: ${directCount.totalActual - directCount.totalFromAvailablePikminTypes}`);

      expect(directCount.categoryCount).toBe(decorData.definitions.length);
    });
  });

  describe('Level 2: getAllDecorItems() 的結果', () => {
    it('getAllDecorItems() 應該與 decor.json 的實際計算一致', () => {
      const allItems = getAllDecorItems();
      const directCount = countFromDecorJsonDirectly();

      console.log('\n========== getAllDecorItems() ==========');
      console.log(`getAllDecorItems() 返回數量: ${allItems.length}`);
      console.log(`decor.json 實際計算數量: ${directCount.totalActual}`);

      // 這兩個應該完全一樣
      expect(allItems.length).toBe(directCount.totalActual);
    });

    it('檢查 getAllDecorItems() 中所有 ID 唯一', () => {
      const allItems = getAllDecorItems();
      const ids = allItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
      console.log(`ID 唯一性: ${uniqueIds.size === ids.length ? '✅ 通過' : '❌ 有重複!'}`);
    });
  });

  describe('Level 3: 找出所有 imageUrls vs availablePikminTypes 不一致之處', () => {
    it('列出所有不一致的 variant', () => {
      const directCount = countFromDecorJsonDirectly();
      const mismatches = directCount.mismatches;

      console.log('\n========== 不一致的 Variant ==========');
      if (mismatches.length === 0) {
        console.log('✅ 全部一致！');
      } else {
        console.log(`⚠️ 發現 ${mismatches.length} 處不一致:`);
        mismatches.forEach(m => {
          const diff = (m.imageUrlsCount ?? 0) - m.availableTypesCount;
          console.log(`  ${m.category}/${m.variant}:`);
          console.log(`    imageUrls: ${m.imageUrlsCount} 色`);
          console.log(`    availablePikminTypes: ${m.availableTypesCount} 色`);
          console.log(`    差 ${diff > 0 ? '+' : ''}${diff} (實際走: ${m.usedBranch})`);
        });
      }

      // 把影響記錄下來
      const totalExtraItems = mismatches.reduce((sum, m) => {
        return sum + ((m.imageUrlsCount ?? 0) - m.availableTypesCount);
      }, 0);
      console.log(`\n因不一致而多出的總 item 數: ${totalExtraItems}`);
    });
  });

  describe('Level 4: getStats() 和 collection.vue collectedCount 的一致性', () => {
    it('getStats() 和 collectionPage 在無篩選器時應顯示相同數字', () => {
      const allItems = getAllDecorItems();

      // 模擬使用者隨機收集 103 個
      const collected: Record<string, boolean> = {};
      allItems.slice(0, 103).forEach(item => {
        collected[item.id] = true;
      });

      // HeroSection 的 stats.collected
      const stats = simulateGetStats(collected);
      // collection.vue 的 collectedCount（filteredItems = getAllDecorItems()，無篩選）
      const pageCount = simulateCollectionPageCount(allItems, collected);

      console.log('\n========== 計數一致性 ==========');
      console.log(`getStats().total: ${stats.total}`);
      console.log(`getStats().collected: ${stats.collected}`);
      console.log(`collection.vue collectedCount: ${pageCount}`);
      console.log(`getAllDecorItems().length: ${allItems.length}`);

      // 兩個計數方式應該一致
      expect(stats.collected).toBe(pageCount);
      expect(stats.total).toBe(allItems.length);
      expect(stats.collected).toBe(103);
    });

    it('如果 collectionState 有幽靈 ID, getStats() 和 collectedCount 都不受影響', () => {
      const allItems = getAllDecorItems();

      // 103 個有效 + 4 個幽靈 ID
      const collected: Record<string, boolean> = {};
      allItems.slice(0, 103).forEach(item => {
        collected[item.id] = true;
      });
      collected['phantom_1'] = true;
      collected['phantom_2'] = true;
      collected['phantom_3'] = true;
      collected['phantom_4'] = true;

      // 幽靈 ID 不影響顯示
      const stats = simulateGetStats(collected);
      const pageCount = simulateCollectionPageCount(allItems, collected);

      console.log('\n========== 幽靈 ID 影響測試 ==========');
      console.log(`collectionState 中的 ID 數 (含幽靈): ${Object.keys(collected).filter(k => collected[k]).length}`);
      console.log(`getStats().collected (不含幽靈): ${stats.collected}`);
      console.log(`collectedCount (不含幽靈): ${pageCount}`);

      expect(stats.collected).toBe(103);
      expect(pageCount).toBe(103);
    });

    it('重大發現：如果多分頁合併了「有效但本來沒勾的」ID，兩個計數都會增加！', () => {
      const allItems = getAllDecorItems();

      // 使用者原本標記了 0-102 (103 個)
      const localCollected: Record<string, boolean> = {};
      allItems.slice(0, 103).forEach(item => {
        localCollected[item.id] = true;
      });

      // 雲端的舊資料有 100-106 (共 7 個，其中 100-102 重疊，103-106 是多的)
      const cloudCollected: Record<string, boolean> = {};
      allItems.slice(100, 107).forEach(item => {
        cloudCollected[item.id] = true;
      });

      // UNION merge
      const merged: Record<string, boolean> = { ...localCollected };
      Object.keys(cloudCollected).forEach(id => {
        if (cloudCollected[id]) merged[id] = true;
      });

      const statsAfterMerge = simulateGetStats(merged);
      const pageCountAfterMerge = simulateCollectionPageCount(allItems, merged);

      console.log('\n========== 多分頁合併後的計數 ==========');
      console.log(`合併前 local: 103`);
      console.log(`合併前 cloud: 7`);
      console.log(`合併後 getStats().collected: ${statsAfterMerge.collected}`);
      console.log(`合併後 collectedCount: ${pageCountAfterMerge}`);

      // ⚠️ 兩個計數都會增加到 107！
      expect(statsAfterMerge.collected).toBe(107);
      expect(pageCountAfterMerge).toBe(107);

      console.log('\n⚠️ 這就是使用者看到 103 → 107 的原因！');
      console.log('雲端有「使用者之前在其他裝置/分頁標記」的有效 ID');
      console.log('UNION merge 後，這些 ID 被加入了，所以 getStats() 和 collectedCount 都增加了');
    });
  });

  describe('Level 5: 時間線模擬 — 完整複現使用者的操作', () => {
    it('模擬：使用者標記103個 → 2秒後cloud save → cloud有舊資料 → 觸發merge → 變107', () => {
      const allItems = getAllDecorItems();

      // === T=0: 使用者新開頁面，localStorage 為空 ===
      let localState: Record<string, boolean> = {};

      // === T=1min: 使用者標記了 103 個 ===
      allItems.slice(0, 103).forEach(item => {
        localState[item.id] = true;
      });
      console.log(`\nT=0~1min: 使用者標記 ${Object.keys(localState).filter(k => localState[k]).length} 個`);
      
      // 此時 getStats 和 collectedCount 都是 103
      expect(simulateGetStats(localState).collected).toBe(103);

      // === T=1min+2s: saveToCloud debounce 完成，存入 103 個到 Supabase ===
      const cloudData = Object.keys(localState).filter(k => localState[k]);
      console.log(`T=1min+2s: saveToCloud 完成，存入 ${cloudData.length} 個`);

      // === 模擬「雲端已有舊資料」的情況 ===
      // 也許使用者之前在手機上標記過 4 個額外的
      const preExistingCloudData = [
        ...cloudData, // 103 個跟 local 一樣
        allItems[103]?.id, // + 4 個使用者在手機上標記過但電腦沒有的
        allItems[104]?.id,
        allItems[105]?.id,
        allItems[106]?.id,
      ].filter(Boolean);

      console.log(`雲端舊資料: ${preExistingCloudData.length} 個 (含手機上的 4 個)`);

      // === T=~2min: 觸發 loadFromCloud (例如 visibility change / auth refresh) ===
      // loadFromCloud 會做 UNION merge
      const cloudCollected: Record<string, boolean> = {};
      preExistingCloudData.forEach(id => {
        cloudCollected[id!] = true;
      });

      // UNION merge (current buggy logic)
      const mergedState: Record<string, boolean> = { ...localState };
      Object.keys(cloudCollected).forEach(id => {
        if (cloudCollected[id]) mergedState[id] = true;
      });

      const afterMerge = simulateGetStats(mergedState);
      console.log(`T=~2min: loadFromCloud 觸發 UNION merge`);
      console.log(`合併後 getStats().collected: ${afterMerge.collected}`);
      console.log(`合併後 getStats().percentage: ${afterMerge.percentage}%`);

      // 使用者看到首頁 stats 從 103 → 107 !!
      expect(afterMerge.collected).toBe(107);

      console.log('\n✅ Bug 完整複現: 使用者按了 103 種，但因為雲端合併，變成 107 種');
      console.log('使用者不需要做任何操作，只要頁面觸發了 loadFromCloud 就會發生');
    });
  });
});
