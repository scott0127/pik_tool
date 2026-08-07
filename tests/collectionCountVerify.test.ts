/**
 * 圖鑑功能總數一致性驗證
 * 
 * 確認 decor.json → getAllDecorItems() → collection.vue → HeroSection 
 * 整條資料流的計數是否一致
 */
import { describe, it, expect } from 'vitest';
import decorData from '~/data/decor.json';
import { useDecorData } from '~/composables/useDecorData';
import { PIKMIN_TYPES } from '~/types/decor';

// 用正式實作，不要在測試裡複製一份
const { getAllDecorItems } = useDecorData();

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


      expect(directCount.categoryCount).toBe(decorData.definitions.length);
    });
  });

  describe('Level 2: getAllDecorItems() 的結果', () => {
    it('getAllDecorItems() 應該與 decor.json 的實際計算一致', () => {
      const allItems = getAllDecorItems();
      const directCount = countFromDecorJsonDirectly();


      // 這兩個應該完全一樣
      expect(allItems.length).toBe(directCount.totalActual);
    });

    it('檢查 getAllDecorItems() 中所有 ID 唯一', () => {
      const allItems = getAllDecorItems();
      const ids = allItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // Level 3（列出 imageUrls 不一致）沒有任何斷言，已移除；
  // 該檢查由 useCollectionSync.test.ts 的 allowlist 測試負責。

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


      // ⚠️ 兩個計數都會增加到 107！
      expect(statsAfterMerge.collected).toBe(107);
      expect(pageCountAfterMerge).toBe(107);

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
      
      // 此時 getStats 和 collectedCount 都是 103
      expect(simulateGetStats(localState).collected).toBe(103);

      // === T=1min+2s: saveToCloud debounce 完成，存入 103 個到 Supabase ===
      const cloudData = Object.keys(localState).filter(k => localState[k]);

      // === 模擬「雲端已有舊資料」的情況 ===
      // 也許使用者之前在手機上標記過 4 個額外的
      const preExistingCloudData = [
        ...cloudData, // 103 個跟 local 一樣
        allItems[103]?.id, // + 4 個使用者在手機上標記過但電腦沒有的
        allItems[104]?.id,
        allItems[105]?.id,
        allItems[106]?.id,
      ].filter(Boolean);


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

      // 使用者看到首頁 stats 從 103 → 107 !!
      expect(afterMerge.collected).toBe(107);

    });
  });
});
