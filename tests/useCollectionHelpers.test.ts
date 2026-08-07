/**
 * useCollection.ts 的純函式 helper 測試。
 * 這些在 closure 外面，不碰 Nuxt，所以用一般環境就能測。
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createEmptyInventoryItem,
  createEmptyDetails,
  createEventId,
  normalizeCount,
  normalizeInventoryItem,
  normalizeRareProgress,
  normalizeDetails,
  hasCollectedDecor,
} from '~/composables/useCollection';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('normalizeCount', () => {
  it('正常整數原樣回傳', () => {
    expect(normalizeCount(5)).toBe(5);
    expect(normalizeCount(0)).toBe(0);
  });

  it('負數應該夾到 0', () => {
    expect(normalizeCount(-3)).toBe(0);
  });

  it('小數應該無條件捨去（往 0 的方向）', () => {
    expect(normalizeCount(3.9)).toBe(3);
    expect(normalizeCount(-0.5)).toBe(0);
  });

  it('數字字串應該被轉換', () => {
    expect(normalizeCount('7')).toBe(7);
  });

  it('無效輸入一律回 0', () => {
    [undefined, null, NaN, Infinity, -Infinity, 'abc', {}, []].forEach(v => {
      expect(normalizeCount(v)).toBe(0);
    });
  });
});

describe('normalizeInventoryItem', () => {
  it('undefined 應該得到全 0 的項目', () => {
    expect(normalizeInventoryItem(undefined)).toEqual({
      seedlingCount: 0,
      preDecorCount: 0,
      decorCount: 0,
      rareCount: 0,
      releaseNoDecorCount: 0,
      releaseWithDecorCount: 0,
      updatedAt: undefined,
    });
  });

  it('部分欄位應該補齊其餘為 0', () => {
    const result = normalizeInventoryItem({ decorCount: 2 });
    expect(result.decorCount).toBe(2);
    expect(result.rareCount).toBe(0);
    expect(result.seedlingCount).toBe(0);
  });

  it('負數與小數應該被正規化', () => {
    const result = normalizeInventoryItem({ decorCount: -5, rareCount: 2.7 } as any);
    expect(result.decorCount).toBe(0);
    expect(result.rareCount).toBe(2);
  });

  it('updatedAt 只接受字串', () => {
    expect(normalizeInventoryItem({ updatedAt: 'x' } as any).updatedAt).toBe('x');
    expect(normalizeInventoryItem({ updatedAt: 12345 } as any).updatedAt).toBeUndefined();
  });

  it('不應該保留來源物件上的多餘欄位', () => {
    const result = normalizeInventoryItem({ decorCount: 1, junk: 'x' } as any);
    expect(result).not.toHaveProperty('junk');
  });
});

describe('normalizeRareProgress', () => {
  it('categoryId 一律以參數為準', () => {
    const result = normalizeRareProgress('cafe', { categoryId: 'wrong', points: 10 } as any);
    expect(result.categoryId).toBe('cafe');
  });

  it('缺少的欄位補 0', () => {
    expect(normalizeRareProgress('cafe', null)).toEqual({
      categoryId: 'cafe',
      points: 0,
      giftsAvailable: 0,
      giftsSpent: 0,
      updatedAt: undefined,
    });
  });

  it('負分應該夾到 0', () => {
    expect(normalizeRareProgress('cafe', { points: -100 } as any).points).toBe(0);
  });
});

describe('normalizeDetails', () => {
  it('null / undefined 應該得到空結構', () => {
    expect(normalizeDetails(null)).toEqual({ inventory: {}, rareProgress: {}, events: [] });
    expect(normalizeDetails(undefined)).toEqual({ inventory: {}, rareProgress: {}, events: [] });
  });

  it('inventory 每一筆都應該被正規化', () => {
    const result = normalizeDetails({
      inventory: { 'a_b_red': { decorCount: -1, rareCount: 3.9 } },
    } as any);
    expect(result.inventory['a_b_red']).toMatchObject({ decorCount: 0, rareCount: 3 });
  });

  it('rareProgress 的 key 應該被寫回 categoryId', () => {
    const result = normalizeDetails({ rareProgress: { cafe: { points: 5 } } } as any);
    expect(result.rareProgress.cafe!.categoryId).toBe('cafe');
  });

  it('保留結構完整的 event', () => {
    const event = { id: 'e1', type: 'inventory_adjustment', createdAt: 'iso' };
    expect(normalizeDetails({ events: [event] } as any).events).toEqual([event]);
  });

  it('丟掉缺欄位或型別錯誤的 event', () => {
    const bad = [
      null,
      undefined,
      {},
      { id: 'e', type: 't' },
      { id: 1, type: 't', createdAt: 'iso' },
      { id: 'e', type: 2, createdAt: 'iso' },
      { id: 'e', type: 't', createdAt: 99 },
    ];
    expect(normalizeDetails({ events: bad } as any).events).toEqual([]);
  });

  it('events 不是陣列時應該回空陣列', () => {
    expect(normalizeDetails({ events: 'nope' } as any).events).toEqual([]);
  });

  it('inventory 不是物件時不應該爆掉', () => {
    expect(normalizeDetails({ inventory: 'nope' } as any).inventory).toEqual({});
  });

  it('不應該修改傳入的物件', () => {
    const input = { inventory: { a: { decorCount: -1 } } } as any;
    const snapshot = JSON.parse(JSON.stringify(input));
    normalizeDetails(input);
    expect(input).toEqual(snapshot);
  });
});

describe('hasCollectedDecor', () => {
  const base = createEmptyInventoryItem();

  it('decor 或 rare 大於 0 就算已收集', () => {
    expect(hasCollectedDecor({ ...base, decorCount: 1 })).toBe(true);
    expect(hasCollectedDecor({ ...base, rareCount: 1 })).toBe(true);
  });

  it('全 0 不算已收集', () => {
    expect(hasCollectedDecor(base)).toBe(false);
  });

  it('只有苗或放生數量不算已收集', () => {
    expect(hasCollectedDecor({ ...base, seedlingCount: 9 })).toBe(false);
    expect(hasCollectedDecor({ ...base, preDecorCount: 9 })).toBe(false);
    expect(hasCollectedDecor({ ...base, releaseNoDecorCount: 9 })).toBe(false);
    expect(hasCollectedDecor({ ...base, releaseWithDecorCount: 9 })).toBe(false);
  });
});

describe('createEmpty* 工廠', () => {
  it('每次都要回傳新物件，否則會共用可變狀態', () => {
    expect(createEmptyInventoryItem()).not.toBe(createEmptyInventoryItem());
    expect(createEmptyDetails()).not.toBe(createEmptyDetails());
    expect(createEmptyDetails().events).not.toBe(createEmptyDetails().events);
  });

  it('空的 details 結構正確', () => {
    expect(createEmptyDetails()).toEqual({ inventory: {}, rareProgress: {}, events: [] });
  });
});

describe('createEventId', () => {
  it('有 crypto.randomUUID 時應該直接用它', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'stub-uuid' });
    expect(createEventId()).toBe('stub-uuid');
  });

  it('沒有 randomUUID 時應該退回 evt- 前綴的 id', () => {
    vi.stubGlobal('crypto', {});
    expect(createEventId()).toMatch(/^evt-\d+-[a-z0-9]+$/);
  });

  it('連續產生的 id 不應重複', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createEventId()));
    expect(ids.size).toBe(200);
  });
});
