/**
 * 蒐集功能完整測試套件
 * 
 * 涵蓋以下情境：
 * 1. 基礎功能：DecorItem 生成、ID 唯一性、資料一致性
 * 2. 雲端優先同步（修復後）：各種合併/覆蓋場景
 * 3. 幽靈 ID 過濾：saveToCloud 和 loadFromCloud 的清理
 * 4. 離線操作：未登入時的本地操作
 * 5. 邊界情況：空資料、完全收集、單一項目
 * 6. 多裝置場景：手機/電腦不同狀態的同步
 * 7. 舊 Bug 確認不再出現：103→107 跳動問題
 */
import { describe, it, expect, beforeEach } from 'vitest';
import decorData from '~/data/decor.json';

// =====================================================
// 共用常數與型別
// =====================================================
const PIKMIN_TYPES = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'] as const;
type PikminType = typeof PIKMIN_TYPES[number];

interface DecorItem {
  id: string;
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
}

// =====================================================
// 模擬 useDecorData.ts 的 getAllDecorItems 邏輯
// =====================================================
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
// 模擬修復後的 useCollection 核心邏輯
// =====================================================
function getValidItemIds(): Set<string> {
  return new Set(getAllDecorItems().map(item => item.id));
}

/** 模擬修復後的 loadFromCloud：雲端優先 + 過濾無效 ID */
function simulateLoadFromCloud_fixed(
  localState: Record<string, boolean>,
  cloudItems: string[] | null
): { newState: Record<string, boolean>; shouldPushToCloud: boolean } {
  if (!cloudItems) {
    // 雲端沒資料 → 保留本地，推到雲端
    const localCount = Object.keys(localState).filter(k => localState[k]).length;
    return { newState: localState, shouldPushToCloud: localCount > 0 };
  }

  const validIds = getValidItemIds();
  const cloudCollected: Record<string, boolean> = {};
  let filteredCount = 0;

  cloudItems.forEach(id => {
    if (validIds.has(id)) {
      cloudCollected[id] = true;
    } else {
      filteredCount++;
    }
  });

  // 雲端優先：直接用雲端資料取代本地
  return {
    newState: cloudCollected,
    shouldPushToCloud: filteredCount > 0, // 有無效 ID 被過濾，需回寫清理
  };
}

/** 模擬修復後的 saveToCloud：過濾無效 ID */
function simulateSaveToCloud_fixed(
  localState: Record<string, boolean>
): string[] {
  const validIds = getValidItemIds();
  return Object.keys(localState).filter(id => localState[id] && validIds.has(id));
}

/** 模擬舊版的 loadFromCloud：UNION merge（有 Bug 的版本，用於對照） */
function simulateLoadFromCloud_buggy(
  localState: Record<string, boolean>,
  cloudItems: string[]
): Record<string, boolean> {
  const merged: Record<string, boolean> = { ...localState };
  cloudItems.forEach(id => {
    merged[id] = true;
  });
  return merged;
}

/** 模擬 getStats() */
function simulateGetStats(collected: Record<string, boolean>) {
  const items = getAllDecorItems();
  let collectedCount = 0;
  items.forEach(item => {
    if (collected[item.id]) collectedCount++;
  });
  return { total: items.length, collected: collectedCount };
}

function countCollected(state: Record<string, boolean>): number {
  return Object.keys(state).filter(id => state[id]).length;
}

// =====================================================
// 測試開始
// =====================================================
let allItems: DecorItem[];
let validIds: Set<string>;

beforeEach(() => {
  allItems = getAllDecorItems();
  validIds = getValidItemIds();
});

// =========================================================================
// 1. 基礎功能測試
// =========================================================================
describe('1. 基礎功能', () => {
  it('decor.json 應有 95 個分類', () => {
    expect(decorData.definitions.length).toBe(95);
  });

  it('getAllDecorItems() 應生成正確數量的 DecorItem', () => {
    expect(allItems.length).toBeGreaterThan(800);
    console.log(`總 DecorItem: ${allItems.length}`);
  });

  it('所有 ID 應唯一', () => {
    const ids = allItems.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每個 DecorItem 的 ID 格式應為 category_variant_pikminType', () => {
    allItems.forEach(item => {
      expect(item.id).toBe(`${item.categoryId}_${item.variantId}_${item.pikminType}`);
    });
  });

  it('所有 pikminType 應是 8 種有效類型之一', () => {
    const validTypes = new Set(PIKMIN_TYPES);
    allItems.forEach(item => {
      expect(validTypes.has(item.pikminType)).toBe(true);
    });
  });

  it('getValidItemIds 應該回傳與 getAllDecorItems 相同數量的 ID', () => {
    expect(validIds.size).toBe(allItems.length);
  });
});

// =========================================================================
// 2. 資料一致性測試
// =========================================================================
describe('2. decor.json 資料一致性', () => {
  it('2025-ornament 的 availablePikminTypes 應包含 ice（已修復）', () => {
    const ornament = decorData.definitions.find((d: any) => d.category.id === '2025-ornament');
    expect(ornament).toBeTruthy();
    expect((ornament as any).availablePikminTypes).toContain('ice');
  });

  it('所有有 imageUrls 的 variant，其顏色不應超過 availablePikminTypes + ice', () => {
    // 只檢查 imageUrls 有「多出」的情況（不檢查少的，因為少的是正常的圖片缺失）
    const overflows: string[] = [];

    decorData.definitions.forEach((def: any) => {
      const availableTypes = new Set(def.availablePikminTypes || PIKMIN_TYPES);
      def.variants.forEach((variant: any) => {
        if (variant.imageUrls) {
          const imageColors = Object.keys(variant.imageUrls);
          const extras = imageColors.filter(c => !availableTypes.has(c));
          if (extras.length > 0) {
            overflows.push(`${def.category.id}/${variant.id}: 多出 [${extras.join(', ')}]`);
          }
        }
      });
    });

    if (overflows.length > 0) {
      console.warn('imageUrls 多出的顏色:', overflows);
    }
    // 修復後不應有 overflow
    expect(overflows.length).toBe(0);
  });

  it('getStats().total 應等於 getAllDecorItems().length', () => {
    const stats = simulateGetStats({});
    expect(stats.total).toBe(allItems.length);
  });
});

// =========================================================================
// 3. 雲端優先同步 — 正常操作
// =========================================================================
describe('3. 雲端優先同步 — 正常操作', () => {
  it('雲端有 50 個，本地有 30 個 → 結果應該是 50 個（雲端優先）', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 30).forEach(i => { local[i.id] = true; });

    const cloudItems = allItems.slice(0, 50).map(i => i.id);

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(50);
  });

  it('雲端有 30 個，本地有 50 個 → 結果應該是 30 個（雲端優先覆蓋）', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 50).forEach(i => { local[i.id] = true; });

    const cloudItems = allItems.slice(0, 30).map(i => i.id);

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(30);
  });

  it('雲端和本地完全相同 → 結果不變', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 100).forEach(i => { local[i.id] = true; });

    const cloudItems = allItems.slice(0, 100).map(i => i.id);

    const { newState, shouldPushToCloud } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(100);
    expect(shouldPushToCloud).toBe(false);
  });

  it('雲端有不同的項目（手機標了其他的）→ 結果用雲端', () => {
    // 電腦標了 #0~#49
    const local: Record<string, boolean> = {};
    allItems.slice(0, 50).forEach(i => { local[i.id] = true; });

    // 手機標了 #30~#79
    const cloudItems = allItems.slice(30, 80).map(i => i.id);

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    // 結果只有雲端的 50 個
    expect(countCollected(newState)).toBe(50);
  });
});

// =========================================================================
// 4. 雲端優先同步 — 取消標記
// =========================================================================
describe('4. 雲端優先同步 — 取消標記', () => {
  it('使用者在手機取消了 3 個 → 電腦同步後也應該減少', () => {
    // 兩邊原本都有 100 個
    const local: Record<string, boolean> = {};
    allItems.slice(0, 100).forEach(i => { local[i.id] = true; });

    // 手機取消了 #97, #98, #99 → 雲端只有 97 個
    const cloudItems = allItems.slice(0, 97).map(i => i.id);

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(97);
  });

  it('舊版 UNION merge 不支援取消標記（對照）', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 100).forEach(i => { local[i.id] = true; });

    // 手機取消了 3 個 → 雲端只有 97 個
    const cloudItems = allItems.slice(0, 97).map(i => i.id);

    const buggyResult = simulateLoadFromCloud_buggy(local, cloudItems);
    // ⚠️ 舊版 UNION 結果仍然是 100（取消無效！）
    expect(countCollected(buggyResult)).toBe(100);
  });
});

// =========================================================================
// 5. 幽靈 ID 過濾
// =========================================================================
describe('5. 幽靈 ID 過濾', () => {
  it('loadFromCloud 應過濾掉雲端的幽靈 ID', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 50).forEach(i => { local[i.id] = true; });

    // 雲端有 50 個有效 + 5 個幽靈
    const cloudItems = [
      ...allItems.slice(0, 50).map(i => i.id),
      'phantom_old_category_v1_red',
      'phantom_deleted_variant_blue',
      'phantom_renamed_thing_white',
      'phantom_typo_ctg_variant_purple',
      'phantom_obsolete_rock',
    ];

    const { newState, shouldPushToCloud } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(50); // 只有有效的 50 個
    expect(shouldPushToCloud).toBe(true); // 需要回寫清理
  });

  it('saveToCloud 應過濾掉本地的幽靈 ID', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 50).forEach(i => { local[i.id] = true; });
    // 加入幽靈
    local['phantom_1'] = true;
    local['phantom_2'] = true;

    const savedItems = simulateSaveToCloud_fixed(local);
    expect(savedItems.length).toBe(50);
    expect(savedItems).not.toContain('phantom_1');
    expect(savedItems).not.toContain('phantom_2');
  });

  it('getStats() 不應計算幽靈 ID（無論本地還有幽靈都不影響）', () => {
    const collected: Record<string, boolean> = {};
    allItems.slice(0, 80).forEach(i => { collected[i.id] = true; });
    collected['phantom_a'] = true;
    collected['phantom_b'] = true;

    const stats = simulateGetStats(collected);
    expect(stats.collected).toBe(80);
    expect(stats.total).toBe(allItems.length);
  });
});

// =========================================================================
// 6. 離線操作（雲端無資料）
// =========================================================================
describe('6. 離線操作', () => {
  it('雲端無資料 + 本地有資料 → 保留本地，推到雲端', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 30).forEach(i => { local[i.id] = true; });

    const { newState, shouldPushToCloud } = simulateLoadFromCloud_fixed(local, null);
    expect(countCollected(newState)).toBe(30);
    expect(shouldPushToCloud).toBe(true);
  });

  it('雲端無資料 + 本地也沒資料 → 空的，不推', () => {
    const local: Record<string, boolean> = {};

    const { newState, shouldPushToCloud } = simulateLoadFromCloud_fixed(local, null);
    expect(countCollected(newState)).toBe(0);
    expect(shouldPushToCloud).toBe(false);
  });

  it('首次使用者：本地標記後存到雲端，再 load 回來應一致', () => {
    // 使用者首次標了 20 個
    const local: Record<string, boolean> = {};
    allItems.slice(0, 20).forEach(i => { local[i.id] = true; });

    // saveToCloud
    const savedItems = simulateSaveToCloud_fixed(local);
    expect(savedItems.length).toBe(20);

    // loadFromCloud (同一批資料)
    const { newState } = simulateLoadFromCloud_fixed(local, savedItems);
    expect(countCollected(newState)).toBe(20);
  });
});

// =========================================================================
// 7. 邊界情況
// =========================================================================
describe('7. 邊界情況', () => {
  it('空的雲端 Items 列表 → 本地也變空', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 50).forEach(i => { local[i.id] = true; });

    const { newState } = simulateLoadFromCloud_fixed(local, []);
    expect(countCollected(newState)).toBe(0);
  });

  it('全部收集（899 個）→ 雲端同步後仍然全部', () => {
    const local: Record<string, boolean> = {};
    allItems.forEach(i => { local[i.id] = true; });

    const savedItems = simulateSaveToCloud_fixed(local);
    expect(savedItems.length).toBe(allItems.length);

    const { newState } = simulateLoadFromCloud_fixed(local, savedItems);
    expect(countCollected(newState)).toBe(allItems.length);
  });

  it('只收集 1 個 → 正確同步', () => {
    const local: Record<string, boolean> = {};
    local[allItems[0].id] = true;

    const savedItems = simulateSaveToCloud_fixed(local);
    expect(savedItems.length).toBe(1);

    const { newState } = simulateLoadFromCloud_fixed({}, savedItems);
    expect(countCollected(newState)).toBe(1);
    expect(newState[allItems[0].id]).toBe(true);
  });

  it('雲端全部是幽靈 ID → 結果為空', () => {
    const local: Record<string, boolean> = {};
    const cloudItems = ['ghost_1', 'ghost_2', 'ghost_3'];

    const { newState, shouldPushToCloud } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(0);
    expect(shouldPushToCloud).toBe(true); // 需要清理
  });

  it('本地有 false 的 ID → saveToCloud 不應上傳', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 10).forEach(i => { local[i.id] = true; });
    // 標記為 false（取消收集）
    local[allItems[5].id] = false;
    local[allItems[6].id] = false;

    const savedItems = simulateSaveToCloud_fixed(local);
    expect(savedItems.length).toBe(8);
    expect(savedItems).not.toContain(allItems[5].id);
    expect(savedItems).not.toContain(allItems[6].id);
  });
});

// =========================================================================
// 8. 多裝置場景
// =========================================================================
describe('8. 多裝置場景', () => {
  it('手機新標記 → 電腦同步後得到手機的結果', () => {
    // 電腦：0~99
    const pcLocal: Record<string, boolean> = {};
    allItems.slice(0, 100).forEach(i => { pcLocal[i.id] = true; });

    // 手機：0~99 + 100~109（多標了 10 個）→ save to cloud
    const phoneState: Record<string, boolean> = {};
    allItems.slice(0, 110).forEach(i => { phoneState[i.id] = true; });
    const phoneCloudSave = simulateSaveToCloud_fixed(phoneState);

    // 電腦 loadFromCloud → 應得到手機的 110 個
    const { newState } = simulateLoadFromCloud_fixed(pcLocal, phoneCloudSave);
    expect(countCollected(newState)).toBe(110);
  });

  it('手機取消了一些 → 電腦同步後也會減少', () => {
    // 兩邊原本都有 #0~#99 (100 個)
    const pcLocal: Record<string, boolean> = {};
    allItems.slice(0, 100).forEach(i => { pcLocal[i.id] = true; });

    // 手機取消了 #90~#99（10 個）→ save to cloud
    const phoneState: Record<string, boolean> = {};
    allItems.slice(0, 90).forEach(i => { phoneState[i.id] = true; });
    const phoneCloudSave = simulateSaveToCloud_fixed(phoneState);

    // 電腦 loadFromCloud → 應得到手機的 90 個
    const { newState } = simulateLoadFromCloud_fixed(pcLocal, phoneCloudSave);
    expect(countCollected(newState)).toBe(90);
  });

  it('手機和電腦同時操作（最後寫入的贏）', () => {
    // 電腦：標了 #0~#49（50 個）→ save to cloud
    const pcState: Record<string, boolean> = {};
    allItems.slice(0, 50).forEach(i => { pcState[i.id] = true; });
    // 模擬電腦存了

    // 手機：標了 #25~#74（50 個）→ save to cloud（覆蓋電腦的）
    const phoneState: Record<string, boolean> = {};
    allItems.slice(25, 75).forEach(i => { phoneState[i.id] = true; });
    const phoneCloudSave = simulateSaveToCloud_fixed(phoneState);

    // 電腦 loadFromCloud → 得到手機的 50 個 (last write wins)
    const { newState } = simulateLoadFromCloud_fixed(pcState, phoneCloudSave);
    expect(countCollected(newState)).toBe(50);
    // 電腦原本的 #0~#24 會消失（因為手機沒有這些）
    expect(newState[allItems[0].id]).toBeUndefined();
    expect(newState[allItems[25].id]).toBe(true);
  });
});

// =========================================================================
// 9. 舊 Bug 確認已修復
// =========================================================================
describe('9. 舊 Bug 確認已修復：103→107 跳動', () => {
  it('修復前的 UNION merge — 會從 103 跳到 107', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 103).forEach(i => { local[i.id] = true; });

    // 雲端有 103 + 額外 4 個（之前手機標的）
    const cloudItems = [
      ...allItems.slice(0, 103).map(i => i.id),
      allItems[103].id,
      allItems[104].id,
      allItems[105].id,
      allItems[106].id,
    ];

    const buggyResult = simulateLoadFromCloud_buggy(local, cloudItems);
    // ⚠️ 舊版 Bug：103 → 107
    expect(countCollected(buggyResult)).toBe(107);
    expect(simulateGetStats(buggyResult).collected).toBe(107);
  });

  it('修復後的雲端優先 — 保持雲端的 107（如果雲端就是有 107 個有效的）', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 103).forEach(i => { local[i.id] = true; });

    // 雲端有 107 個有效 ID → 結果就是 107（雲端是唯一真實來源）
    const cloudItems = allItems.slice(0, 107).map(i => i.id);

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(107);
    // 這是「正確」的 107 — 因為雲端確實有 107 個
    // 使用者只是忘了自己在手機上多標了 4 個
  });

  it('修復後 — 本地 103 + 雲端 103（一樣）→ 不會跳動', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 103).forEach(i => { local[i.id] = true; });

    // 雲端也是同樣的 103 個
    const cloudItems = allItems.slice(0, 103).map(i => i.id);

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    expect(countCollected(newState)).toBe(103);
    expect(simulateGetStats(newState).collected).toBe(103);
  });

  it('修復後 — 雲端有幽靈 ID 不會導致數量異常增加', () => {
    const local: Record<string, boolean> = {};
    allItems.slice(0, 103).forEach(i => { local[i.id] = true; });

    // 雲端有 103 個有效 + 4 個幽靈
    const cloudItems = [
      ...allItems.slice(0, 103).map(i => i.id),
      'phantom_old_v1_red',
      'phantom_old_v2_blue',
      'phantom_old_v3_white',
      'phantom_old_v4_purple',
    ];

    const { newState } = simulateLoadFromCloud_fixed(local, cloudItems);
    // 幽靈 ID 被過濾 → 仍然是 103
    expect(countCollected(newState)).toBe(103);
    expect(simulateGetStats(newState).collected).toBe(103);
  });
});

// =========================================================================
// 10. saveToCloud → loadFromCloud 往返一致性
// =========================================================================
describe('10. 往返一致性 (roundtrip)', () => {
  it('save → load 應該得到相同結果', () => {
    const original: Record<string, boolean> = {};
    allItems.slice(10, 60).forEach(i => { original[i.id] = true; });

    const saved = simulateSaveToCloud_fixed(original);
    const { newState } = simulateLoadFromCloud_fixed({}, saved);

    expect(countCollected(newState)).toBe(50);
    saved.forEach(id => {
      expect(newState[id]).toBe(true);
    });
  });

  it('多次 save → load 往返應冪等', () => {
    let state: Record<string, boolean> = {};
    allItems.slice(0, 75).forEach(i => { state[i.id] = true; });

    // 往返 3 次
    for (let round = 0; round < 3; round++) {
      const saved = simulateSaveToCloud_fixed(state);
      const { newState } = simulateLoadFromCloud_fixed(state, saved);
      state = newState;
    }

    expect(countCollected(state)).toBe(75);
  });

  it('帶 幽靈 ID + false 值的 state，往返後應被清理乾淨', () => {
    const dirty: Record<string, boolean> = {};
    allItems.slice(0, 40).forEach(i => { dirty[i.id] = true; });
    dirty['phantom_x'] = true;
    dirty['phantom_y'] = true;
    dirty[allItems[41].id] = false; // false 不應上傳

    const saved = simulateSaveToCloud_fixed(dirty);
    expect(saved.length).toBe(40); // 只有 40 個有效 true

    const { newState } = simulateLoadFromCloud_fixed({}, saved);
    expect(countCollected(newState)).toBe(40);
    expect(newState['phantom_x']).toBeUndefined();
    expect(newState['phantom_y']).toBeUndefined();
  });
});
