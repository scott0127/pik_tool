// @vitest-environment nuxt
/**
 * useCollection() 的行為測試，全部打在正式實作上。
 * Supabase 用一個會真的存資料的假 client，所以 save → load 往返是真的往返。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

interface PgError { code: string; message?: string }
interface CloudRow {
  user_id: string;
  collected_items: string[];
  collection_details: unknown;
}
type QueuedResult = { data?: unknown; error: PgError | null };

const mocks = vi.hoisted(() => ({
  userId: { value: 'user-1' as string | null },
  cloud: { value: null as any },
  selectError: { value: null as any },
  // 依序回應的 queue；空的時候走預設行為
  selectQueue: { value: [] as any[] },
  upsertQueue: { value: [] as any[] },
  insertQueue: { value: [] as any[] },
  upsertResult: { value: { error: null } as { error: unknown } },
  insertResult: { value: { error: null } as { error: unknown } },
  calls: { value: [] as string[] },
  payloads: { value: [] as any[] },
}));

mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => ({
    upsert: (payload: any) => {
      mocks.calls.value.push('upsert');
      mocks.payloads.value.push(payload);
      const res = mocks.upsertQueue.value.length
        ? mocks.upsertQueue.value.shift()
        : mocks.upsertResult.value;
      if (!res.error) mocks.cloud.value = payload;
      return Promise.resolve(res);
    },
    insert: (payload: any) => {
      mocks.calls.value.push('insert');
      mocks.payloads.value.push(payload);
      const res = mocks.insertQueue.value.length
        ? mocks.insertQueue.value.shift()
        : mocks.insertResult.value;
      if (!res.error) mocks.cloud.value = payload;
      return Promise.resolve(res);
    },
    select: () => ({
      eq: () => ({
        single: () => {
          mocks.calls.value.push('select');
          if (mocks.selectQueue.value.length) {
            return Promise.resolve(mocks.selectQueue.value.shift());
          }
          if (mocks.selectError.value) {
            return Promise.resolve({ data: null, error: mocks.selectError.value });
          }
          if (!mocks.cloud.value) {
            return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
          }
          return Promise.resolve({ data: mocks.cloud.value, error: null });
        },
      }),
    }),
  }),
}));

// getter 而不是先算好的值：useCollection() 只呼叫 useAuthStore() 一次並留住結果，
// 用固定值的話之後改 mocks.userId 就不會反映進去。
mockNuxtImport('useAuthStore', () => () => ({
  get user() {
    return { value: mocks.userId.value ? { id: mocks.userId.value } : null };
  },
  get isAuthenticated() {
    return { value: Boolean(mocks.userId.value) };
  },
}));

const { useCollection } = await import('~/composables/useCollection');
const { useDecorData } = await import('~/composables/useDecorData');

const allIds = () => useDecorData().getAllDecorItems().map(i => i.id);
const idsAt = (from: number, to: number) => allIds().slice(from, to);
const firstItemId = () => allIds()[0]!;

/** 直接塞一列雲端資料 */
const seedCloud = (collectedItems: string[], details: any = null) => {
  mocks.cloud.value = {
    user_id: 'user-1',
    collected_items: collectedItems,
    collection_details: details,
  };
};

const cloudItems = (): string[] => mocks.cloud.value?.collected_items ?? [];
const upsertCount = () => mocks.calls.value.filter(c => c === 'upsert').length;
const wroteToCloud = () =>
  mocks.calls.value.includes('upsert') || mocks.calls.value.includes('insert');

// useCollection 在錯誤路徑上會 console.error/warn，CI log 看起來像壞掉了。
// 這裡靜音，需要驗證有記錄到的測試再對 spy 斷言。
let consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

// 整份用假 timer：saveToCloud 成功後會排一個 3 秒的 setSyncResult timer，
// 沒人取消它，會跨測試觸發。afterEach 直接把 pending timer 全丟掉。
beforeEach(() => {
  vi.useFakeTimers();

  consoleSpies = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ];

  // 先以未登入狀態重設，避免 resetCollection 順手排了一個 debounce
  mocks.userId.value = null;
  useCollection().resetCollection();

  mocks.userId.value = 'user-1';
  mocks.cloud.value = null;
  mocks.selectError.value = null;
  mocks.selectQueue.value = [];
  mocks.upsertQueue.value = [];
  mocks.insertQueue.value = [];
  mocks.upsertResult.value = { error: null };
  mocks.insertResult.value = { error: null };
  mocks.calls.value = [];
  mocks.payloads.value = [];
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  consoleSpies.forEach(spy => spy.mockRestore());
});

/** saveToCloud 失敗時會 retry 並 sleep，所以要一邊推進 timer 一邊等 */
const settle = async <T>(promise: Promise<T>): Promise<T> => {
  await vi.advanceTimersByTimeAsync(30000);
  return promise;
};

describe('inventory 調整與已收集判定', () => {
  it('加一個 decor 之後應該算已收集', () => {
    const c = useCollection();
    const id = firstItemId();

    expect(c.isCollected(id)).toBe(false);
    c.adjustInventory(id, 'decor', 1);
    expect(c.isCollected(id)).toBe(true);
    expect(c.getInventoryItem(id).decorCount).toBe(1);
  });

  it('扣回 0 之後應該不再算已收集', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'decor', 1);
    c.adjustInventory(id, 'decor', -1);
    expect(c.isCollected(id)).toBe(false);
  });

  it('數量不會被扣成負數', () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', -5);
    expect(c.getInventoryItem(firstItemId()).decorCount).toBe(0);
  });

  it('只有苗不算已收集', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'seedling', 3);
    expect(c.isCollected(id)).toBe(false);
    expect(c.getInventoryItem(id).seedlingCount).toBe(3);
  });

  it('不存在的 item id 應該被忽略', () => {
    const c = useCollection();
    c.adjustInventory('not-a-real-id', 'decor', 1);
    expect(c.isCollected('not-a-real-id')).toBe(false);
  });

  it('每次調整都會留下一筆 event', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'decor', 1);
    expect(c.getRecentCollectionEvents(10).some(e => e.itemId === id && e.delta === 1)).toBe(true);
  });

  it('delta 0 不應該產生 event', () => {
    const c = useCollection();
    const before = c.getRecentCollectionEvents(100).length;
    c.adjustInventory(firstItemId(), 'decor', 0);
    expect(c.getRecentCollectionEvents(100).length).toBe(before);
  });

  // 從 0 再往下扣會被夾到 0，實際 delta 是 0，所以不該留下 event。
  // 用 event 而不是 getInventoryItem 來斷言：後者會再正規化一次，把問題蓋掉。
  it('扣到負數時不應該留下 event', () => {
    const c = useCollection();
    const before = c.getRecentCollectionEvents(100).length;
    c.adjustInventory(firstItemId(), 'decor', -5);
    expect(c.getRecentCollectionEvents(100).length).toBe(before);
  });

  it('export 出來的原始資料不應該有負數', () => {
    const c = useCollection();
    const id = firstItemId();
    c.adjustInventory(id, 'decor', 2);
    c.adjustInventory(id, 'decor', -10);

    const raw = JSON.parse(c.exportCollection());
    expect(raw.details.inventory[id].decorCount).toBe(0);
  });
});

describe('getStats', () => {
  it('沒收集時 collected 為 0，total 等於全部項目數', () => {
    const stats = useCollection().getStats();
    expect(stats.collected).toBe(0);
    expect(stats.total).toBe(allIds().length);
    expect(stats.percentage).toBe(0);
  });

  it('收集一個之後 collected 應該是 1', () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    expect(c.getStats().collected).toBe(1);
  });

  it('幽靈 id 不應該被計入', () => {
    const c = useCollection();
    c.importCollection(JSON.stringify({ collected: { ghost_id_red: true } }));
    expect(c.getStats().collected).toBe(0);
  });
});

describe('import / export', () => {
  it('export 後再 import 應該還原收集狀態', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'decor', 1);
    const dump = c.exportCollection();
    c.resetCollection();
    expect(c.isCollected(id)).toBe(false);

    expect(c.importCollection(dump)).toBe(true);
    expect(c.isCollected(id)).toBe(true);
  });

  it('無效 JSON 應該回 false 而不是丟例外，但要留下紀錄', () => {
    expect(useCollection().importCollection('{ not json')).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('缺少 collected 欄位的 JSON 應該回 false', () => {
    expect(useCollection().importCollection('{"foo":1}')).toBe(false);
  });
});

describe('loadFromCloud — 雲端優先', () => {
  it('雲端比本地多時以雲端為準', async () => {
    const c = useCollection();
    idsAt(0, 3).forEach(id => c.adjustInventory(id, 'decor', 1));

    seedCloud(idsAt(0, 10));
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(10);
  });

  it('雲端比本地少時也以雲端為準（支援取消標記）', async () => {
    const c = useCollection();
    idsAt(0, 10).forEach(id => c.adjustInventory(id, 'decor', 1));

    seedCloud(idsAt(0, 3));
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(3);
  });

  it('雲端與本地標記不同項目時，結果完全等於雲端', async () => {
    const c = useCollection();
    idsAt(0, 5).forEach(id => c.adjustInventory(id, 'decor', 1));

    seedCloud(idsAt(20, 25));
    await c.loadFromCloud(true);

    expect(idsAt(20, 25).every(id => c.isCollected(id))).toBe(true);
    expect(idsAt(0, 5).some(id => c.isCollected(id))).toBe(false);
    expect(c.getStats().collected).toBe(5);
  });

  it('雲端與本地相同時結果不變', async () => {
    const c = useCollection();
    idsAt(0, 4).forEach(id => c.adjustInventory(id, 'decor', 1));

    seedCloud(idsAt(0, 4));
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(4);
  });

  it('雲端的幽靈 ID 應該被過濾掉', async () => {
    const c = useCollection();
    seedCloud([...idsAt(0, 3), 'ghost_a_red', 'ghost_b_blue']);
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(3);
  });

  it('過濾掉幽靈 ID 後應該回寫乾淨的資料', async () => {
    const c = useCollection();
    seedCloud([...idsAt(0, 3), 'ghost_a_red']);
    await c.loadFromCloud(true);

    expect(wroteToCloud()).toBe(true);
    expect(cloudItems()).not.toContain('ghost_a_red');
    expect(cloudItems()).toHaveLength(3);
  });

  it('雲端全部是幽靈 ID 時結果為空', async () => {
    const c = useCollection();
    seedCloud(['ghost_a_red', 'ghost_b_blue', 'ghost_c_white']);
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(0);
  });

  it('雲端是空陣列時本地也應該清空', async () => {
    const c = useCollection();
    idsAt(0, 6).forEach(id => c.adjustInventory(id, 'decor', 1));

    seedCloud([], { inventory: {}, rareProgress: {}, events: [] });
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(0);
  });

  it('雲端沒有資料但本地有時，應該把本地推上去', async () => {
    const c = useCollection();
    idsAt(0, 4).forEach(id => c.adjustInventory(id, 'decor', 1));
    mocks.calls.value = [];

    await c.loadFromCloud(true);

    expect(wroteToCloud()).toBe(true);
    expect(cloudItems()).toHaveLength(4);
  });

  it('雲端與本地都空時不應該寫入任何東西', async () => {
    await useCollection().loadFromCloud(true);
    expect(wroteToCloud()).toBe(false);
  });

  it('未登入時不應該讀雲端', async () => {
    mocks.userId.value = null;
    await useCollection().loadFromCloud(true);
    expect(mocks.calls.value).toEqual([]);
  });

  it('讀取失敗時應該保留本地資料，不清空', async () => {
    const c = useCollection();
    idsAt(0, 5).forEach(id => c.adjustInventory(id, 'decor', 1));

    mocks.selectError.value = { code: '08006', message: 'boom' };
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(5);
  });
});

describe('多裝置場景', () => {
  it('手機新標記後，電腦同步會拿到手機的結果', async () => {
    const phone = useCollection();
    idsAt(0, 3).forEach(id => phone.adjustInventory(id, 'decor', 1));
    await phone.forceSync();

    // 電腦端：本地只有 1 個，載入後應該變成手機的 3 個
    phone.resetCollection();
    phone.adjustInventory(idsAt(50, 51)[0]!, 'decor', 1);
    await phone.loadFromCloud(true);

    expect(phone.getStats().collected).toBe(3);
    expect(idsAt(0, 3).every(id => phone.isCollected(id))).toBe(true);
  });

  it('手機取消標記後，電腦同步也會跟著減少', async () => {
    const c = useCollection();
    idsAt(0, 6).forEach(id => c.adjustInventory(id, 'decor', 1));
    await c.forceSync();
    expect(cloudItems()).toHaveLength(6);

    // 手機取消 2 個並上傳
    idsAt(0, 2).forEach(id => c.adjustInventory(id, 'decor', -1));
    await c.forceSync();

    await c.loadFromCloud(true);
    expect(c.getStats().collected).toBe(4);
  });

  it('最後寫入雲端的那一份會勝出', async () => {
    const c = useCollection();

    idsAt(0, 3).forEach(id => c.adjustInventory(id, 'decor', 1));
    await c.forceSync();

    c.resetCollection();
    idsAt(10, 18).forEach(id => c.adjustInventory(id, 'decor', 1));
    await c.forceSync();

    c.resetCollection();
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(8);
  });
});

describe('往返一致性', () => {
  it('save → load 應該得到相同的收集結果', async () => {
    const c = useCollection();
    idsAt(0, 7).forEach(id => c.adjustInventory(id, 'decor', 1));
    await c.forceSync();

    c.resetCollection();
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(7);
    expect(idsAt(0, 7).every(id => c.isCollected(id))).toBe(true);
  });

  it('多次往返應該冪等', async () => {
    const c = useCollection();
    idsAt(0, 5).forEach(id => c.adjustInventory(id, 'decor', 1));

    for (let i = 0; i < 3; i++) {
      await c.forceSync();
      await c.loadFromCloud(true);
    }

    expect(c.getStats().collected).toBe(5);
  });

  it('帶幽靈 ID 與 false 值的狀態，往返後應該被清乾淨', async () => {
    const c = useCollection();
    const valid = idsAt(0, 3);

    c.importCollection(JSON.stringify({
      collected: {
        [valid[0]!]: true,
        [valid[1]!]: true,
        [valid[2]!]: false,
        ghost_x_red: true,
      },
    }));

    await c.forceSync();

    expect(cloudItems()).toHaveLength(2);
    expect(cloudItems()).not.toContain('ghost_x_red');
    expect(cloudItems()).not.toContain(valid[2]);
  });

  it('inventory 數量也應該跟著往返保存', async () => {
    const c = useCollection();
    const id = firstItemId();
    c.adjustInventory(id, 'decor', 3);
    await c.forceSync();

    c.resetCollection();
    await c.loadFromCloud(true);

    expect(c.getInventoryItem(id).decorCount).toBe(3);
  });
});

describe('邊界情況', () => {
  // 只用 100 筆而不是全部 969 筆：adjustInventory 每次都重建一次 validIds
  // （useCollection.ts getValidItemIds），整份跑完要 ~10 秒。
  it('大量收集後往返仍然一致', async () => {
    const c = useCollection();
    const many = idsAt(0, 100);
    many.forEach(id => c.adjustInventory(id, 'decor', 1));
    await c.forceSync();

    c.resetCollection();
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(100);
  });

  it('只收集 1 個也能正確往返', async () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    await c.forceSync();

    c.resetCollection();
    await c.loadFromCloud(true);

    expect(c.getStats().collected).toBe(1);
  });
});

describe('saveCollection 的 debounce', () => {
  it('單一調整不會立刻打雲端，要等 debounce 到期', async () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    expect(wroteToCloud()).toBe(false);

    await vi.advanceTimersByTimeAsync(15000);
    expect(wroteToCloud()).toBe(true);
  });

  it('debounce 未到期前不應該寫入', async () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await vi.advanceTimersByTimeAsync(14000);
    expect(wroteToCloud()).toBe(false);
  });

  it('連續多次調整只會產生一次雲端寫入', async () => {
    const c = useCollection();
    idsAt(0, 5).forEach(id => c.adjustInventory(id, 'decor', 1));

    await vi.advanceTimersByTimeAsync(15000);
    expect(upsertCount()).toBe(1);
  });

  it('toggleCollected 也走 debounce', async () => {
    const c = useCollection();
    c.toggleCollected(firstItemId());
    expect(wroteToCloud()).toBe(false);

    await vi.advanceTimersByTimeAsync(15000);
    expect(wroteToCloud()).toBe(true);
  });

  it('未登入時不排 debounce，時間到也不會寫雲端', async () => {
    mocks.userId.value = null;
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await vi.advanceTimersByTimeAsync(15000);
    expect(wroteToCloud()).toBe(false);
  });

  it('collectAllInCategory 不等 debounce，立刻寫雲端', async () => {
    const c = useCollection();
    const categoryId = useDecorData().getAllDecorItems()[0]!.categoryId;

    await c.collectAllInCategory(categoryId);
    expect(wroteToCloud()).toBe(true);
  });

  it('clearCategory 也立刻寫雲端', async () => {
    const c = useCollection();
    const categoryId = useDecorData().getAllDecorItems()[0]!.categoryId;

    await c.collectAllInCategory(categoryId);
    mocks.calls.value = [];

    await c.clearCategory(categoryId);
    expect(wroteToCloud()).toBe(true);
  });

  it('批次操作會取消先前 pending 的 debounce，不會重複寫入', async () => {
    const c = useCollection();
    const categoryId = useDecorData().getAllDecorItems()[0]!.categoryId;

    c.adjustInventory(idsAt(500, 501)[0]!, 'decor', 1); // 排一個 debounce
    await c.collectAllInCategory(categoryId);           // 應該取消它並立刻存
    const afterBatch = upsertCount();

    await vi.advanceTimersByTimeAsync(15000);
    expect(upsertCount()).toBe(afterBatch);
  });

  it('批次之後的單一操作會重新排一個 debounce', async () => {
    const c = useCollection();
    const categoryId = useDecorData().getAllDecorItems()[0]!.categoryId;

    await c.collectAllInCategory(categoryId);
    const afterBatch = upsertCount();

    c.adjustInventory(idsAt(500, 501)[0]!, 'decor', 1);
    expect(upsertCount()).toBe(afterBatch);

    await vi.advanceTimersByTimeAsync(15000);
    expect(upsertCount()).toBe(afterBatch + 1);
  });

  it('連續兩次批次操作都會各自立刻寫入', async () => {
    const c = useCollection();
    const items = useDecorData().getAllDecorItems();
    const catA = items[0]!.categoryId;
    const catB = items.find(i => i.categoryId !== catA)!.categoryId;

    await c.collectAllInCategory(catA);
    await c.collectAllInCategory(catB);

    expect(upsertCount()).toBe(2);
  });
});

describe('saveToCloud 的錯誤處理', () => {
  it('upsert 成功時應該回報成功', async () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await expect(c.forceSync()).resolves.toBe(true);
    expect(mocks.calls.value).toContain('upsert');
  });

  it('未登入時應該直接跳過雲端儲存', async () => {
    mocks.userId.value = null;
    await expect(useCollection().forceSync()).resolves.toBe(false);
    expect(mocks.calls.value).toEqual([]);
  });

  // attemptSaveToCloud 把 insert 的 23505 當成成功，雲端沒更新卻回報成功。
  // 用 it.fails 是為了讓修好之後這個測試變紅，提醒把 .fails 拿掉。
  it.fails('upsert 失敗 + insert 撞 23505 不應回報成功', async () => {
    mocks.upsertResult.value = { error: { code: '08006', message: 'connection failure' } };
    mocks.insertResult.value = { error: { code: '23505', message: 'duplicate key' } };

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await expect(settle(c.forceSync())).resolves.toBe(false);
  });

  it('upsert 失敗 + insert 撞 23505 時，雲端內容確實沒有被更新', async () => {
    seedCloud(['stale_marker_red']);
    mocks.upsertResult.value = { error: { code: '08006', message: 'connection failure' } };
    mocks.insertResult.value = { error: { code: '23505', message: 'duplicate key' } };

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    await settle(c.forceSync());

    // 這就是 bug 的實際傷害：回報成功，但雲端還是舊的那一列
    expect(cloudItems()).toEqual(['stale_marker_red']);
  });

  it('upsert 與 insert 都因非 23505 失敗時應該回報失敗', async () => {
    mocks.upsertResult.value = { error: { code: '42501', message: 'rls denied' } };
    mocks.insertResult.value = { error: { code: '42501', message: 'rls denied' } };

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await expect(settle(c.forceSync())).resolves.toBe(false);
  });

  it('儲存到雲端的內容不應包含幽靈 ID', async () => {
    const c = useCollection();
    c.importCollection(JSON.stringify({
      collected: { [firstItemId()]: true, ghost_y_blue: true },
    }));

    await c.forceSync();
    expect(cloudItems()).toEqual([firstItemId()]);
  });
});

describe('collection_details 欄位不存在時的 legacy fallback', () => {
  const hasDetailsKey = (p: any) => Object.prototype.hasOwnProperty.call(p, 'collection_details');

  it('upsert 撞 PGRST204 應該改用不含 collection_details 的 payload 重試', async () => {
    mocks.upsertQueue.value = [{ error: { code: 'PGRST204', message: 'column not found' } }];

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    await settle(c.forceSync());

    const upserts = mocks.payloads.value.filter((_, i) => mocks.calls.value[i] === 'upsert');
    expect(upserts).toHaveLength(2);
    expect(hasDetailsKey(upserts[0])).toBe(true);
    expect(hasDetailsKey(upserts[1])).toBe(false);
  });

  it('錯誤訊息提到 collection_details 也應該觸發 legacy 重試', async () => {
    mocks.upsertQueue.value = [
      { error: { code: '42703', message: 'column "collection_details" does not exist' } },
    ];

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    await settle(c.forceSync());

    expect(mocks.calls.value.filter(x => x === 'upsert')).toHaveLength(2);
  });

  it('insert fallback 撞 PGRST204 也會改用 legacy payload', async () => {
    mocks.upsertQueue.value = [
      { error: { code: '08006', message: 'connection failure' } },
      { error: { code: '08006', message: 'connection failure' } },
    ];
    mocks.insertQueue.value = [{ error: { code: 'PGRST204', message: 'column not found' } }];

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    await settle(c.forceSync());

    expect(mocks.calls.value.filter(x => x === 'insert').length).toBeGreaterThanOrEqual(2);
  });

  it('讀取時撞 PGRST204 應該改用只取 collected_items 的查詢', async () => {
    mocks.selectQueue.value = [
      { data: null, error: { code: 'PGRST204', message: 'column not found' } },
      { data: { collected_items: idsAt(0, 2) }, error: null },
    ];

    const c = useCollection();
    await c.loadFromCloud(true);

    expect(mocks.calls.value.filter(x => x === 'select')).toHaveLength(2);
    expect(c.getStats().collected).toBe(2);
  });
});

describe('setCollected', () => {
  it('設為 true 會標記為已收集', () => {
    const c = useCollection();
    c.setCollected(firstItemId(), true);
    expect(c.isCollected(firstItemId())).toBe(true);
  });

  it('設為 false 會取消標記', () => {
    const c = useCollection();
    c.setCollected(firstItemId(), true);
    c.setCollected(firstItemId(), false);
    expect(c.isCollected(firstItemId())).toBe(false);
  });

  it('重複設定同一個值不應該產生額外的 event', () => {
    const c = useCollection();
    c.setCollected(firstItemId(), true);
    const after = c.getRecentCollectionEvents(100).length;

    c.setCollected(firstItemId(), true);
    expect(c.getRecentCollectionEvents(100).length).toBe(after);
  });
});

describe('稀有點數', () => {
  const categoryOf = (id: string) =>
    useDecorData().getAllDecorItems().find(i => i.id === id)!.categoryId;

  /** 找一個項目數最少的分類，方便「全收集」 */
  const smallestCategory = () => {
    const counts = new Map<string, number>();
    useDecorData().getAllDecorItems().forEach(i => {
      counts.set(i.categoryId, (counts.get(i.categoryId) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[1] - b[1])[0]![0];
  };

  it('manual_adjustment 會依照傳入的點數累加', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());

    c.addRarePoints(cat, 'manual_adjustment', { points: 250 });
    expect(c.getRareProgress(cat).points).toBe(250);
  });

  it('具名 action 使用固定點數表', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());

    c.addRarePoints(cat, 'pluck_seedling');
    expect(c.getRareProgress(cat).points).toBe(c.rarePointValues.pluck_seedling);
  });

  it('點數不會被扣成負數', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());

    c.addRarePoints(cat, 'manual_adjustment', { points: -500 });
    expect(c.getRareProgress(cat).points).toBe(0);
  });

  it('手動增加 decor 會自動加上 gift_expedition 的點數', () => {
    const c = useCollection();
    const id = firstItemId();
    const cat = categoryOf(id);

    c.adjustInventory(id, 'decor', 1);
    expect(c.getRareProgress(cat).points).toBe(c.rarePointValues.gift_expedition);
  });

  it('分類沒收集完時等級為 0', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());

    c.addRarePoints(cat, 'manual_adjustment', { points: 5000 });
    expect(c.getRareProgress(cat).isCategoryComplete).toBe(false);
    expect(c.getRareProgress(cat).level).toBe(0);
  });

  it('分類收集完之後會依點數分級', () => {
    const c = useCollection();
    const cat = smallestCategory();
    useDecorData().getItemsByCategory(cat).forEach(i => c.adjustInventory(i.id, 'decor', 1));

    expect(c.getRareProgress(cat).isCategoryComplete).toBe(true);

    const levelAt = (points: number) => {
      const current = c.getRareProgress(cat).points;
      c.addRarePoints(cat, 'manual_adjustment', { points: points - current });
      return c.getRareProgress(cat).level;
    };

    expect(levelAt(799)).toBe(1);
    expect(levelAt(800)).toBe(2);
    expect(levelAt(1199)).toBe(2);
    expect(levelAt(1200)).toBe(3);
    expect(levelAt(2999)).toBe(3);
    expect(levelAt(3000)).toBe(4);
    expect(levelAt(8000)).toBe(5);
  });

  // getNextRareLevelPoints 型別是 number | null，但分類未完成時回 0。
  // 用 it.fails 是為了讓修好之後這個測試變紅，提醒把 .fails 拿掉。
  it.fails('分類未完成時 nextRareLevelPoints 應該是 null 而不是 0', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());
    expect(c.getRareProgress(cat).nextRareLevelPoints).toBeNull();
  });
});

describe('getCategoryInventorySummary', () => {
  const categoryOf = (id: string) =>
    useDecorData().getAllDecorItems().find(i => i.id === id)!.categoryId;

  it('空的分類各項計數都是 0', () => {
    const c = useCollection();
    const summary = c.getCategoryInventorySummary(categoryOf(firstItemId()));

    expect(summary.collectedCount).toBe(0);
    expect(summary.decorCount).toBe(0);
    expect(summary.totalItems).toBeGreaterThan(0);
  });

  it('會加總分類內所有項目的庫存', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());
    const items = useDecorData().getItemsByCategory(cat);

    c.adjustInventory(items[0]!.id, 'decor', 2);
    c.adjustInventory(items[0]!.id, 'seedling', 3);

    const summary = c.getCategoryInventorySummary(cat);
    expect(summary.decorCount).toBe(2);
    expect(summary.seedlingCount).toBe(3);
    expect(summary.collectedCount).toBe(1);
  });

  it('totalItems 應該等於該分類的項目數', () => {
    const c = useCollection();
    const cat = categoryOf(firstItemId());
    expect(c.getCategoryInventorySummary(cat).totalItems)
      .toBe(useDecorData().getItemsByCategory(cat).length);
  });
});

describe('undo 與重建', () => {
  const categoryOf = (id: string) =>
    useDecorData().getAllDecorItems().find(i => i.id === id)!.categoryId;

  // seedling 不在 RARE_POINT_ACTION_BY_BUCKET 裡，所以只會產生一筆 event
  it('undo 會把最後一次庫存調整還原', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'seedling', 1);
    expect(c.undoLastCollectionEvent()).toBe(true);
    expect(c.getInventoryItem(id).seedlingCount).toBe(0);
  });

  it('沒有事件可還原時回傳 false', () => {
    expect(useCollection().undoLastCollectionEvent()).toBe(false);
  });

  it('同一筆事件不會被 undo 兩次', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'seedling', 2);
    c.undoLastCollectionEvent();
    const afterFirst = c.getInventoryItem(id).seedlingCount;

    c.undoLastCollectionEvent();
    expect(c.getInventoryItem(id).seedlingCount).toBe(afterFirst);
  });

  // 一次手動 decor 調整會寫入兩筆 event（庫存 + 自動加點），
  // 而 undo 是一次退一筆 event，不是退一個「使用者動作」。
  // 使用者要按兩次 undo 才會回到原狀 —— 這是目前的行為，不是預期的 UX。
  it('undo 一次只退一筆 event，手動加 decor 需要按兩次', () => {
    const c = useCollection();
    const id = firstItemId();
    const cat = categoryOf(id);

    c.adjustInventory(id, 'decor', 1);
    expect(c.getRecentCollectionEvents(100)).toHaveLength(2);

    c.undoLastCollectionEvent();
    expect(c.getRareProgress(cat).points).toBe(0);      // 先退掉點數
    expect(c.getInventoryItem(id).decorCount).toBe(1);  // 庫存還在

    c.undoLastCollectionEvent();
    expect(c.getInventoryItem(id).decorCount).toBe(0);  // 第二次才退庫存
  });

  it('rebuildCollectionFromEvents 應該還原出相同的庫存', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'decor', 2);
    c.adjustInventory(id, 'seedling', 1);
    const before = c.getInventoryItem(id);

    c.rebuildCollectionFromEvents();
    const after = c.getInventoryItem(id);

    expect(after.decorCount).toBe(before.decorCount);
    expect(after.seedlingCount).toBe(before.seedlingCount);
  });
});

describe('本地儲存', () => {
  it('loadCollection 會從 localStorage 還原', () => {
    const c = useCollection();
    const id = firstItemId();

    c.adjustInventory(id, 'decor', 1);
    // resetCollection 也會寫回 localStorage，所以要先把快照留下來
    const snapshot = localStorage.getItem('pikmin-bloom-collection')!;
    expect(snapshot).toBeTruthy();

    c.resetCollection();
    expect(c.isCollected(id)).toBe(false);

    localStorage.setItem('pikmin-bloom-collection', snapshot);
    c.loadCollection();
    expect(c.isCollected(id)).toBe(true);
  });

  it('localStorage 內容損毀時不應該丟例外，但要留下紀錄', () => {
    localStorage.setItem('pikmin-bloom-collection', '{ not json');

    expect(() => useCollection().loadCollection()).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it('clearLocalData 會清掉狀態與 localStorage', () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    c.clearLocalData();

    expect(c.getStats().collected).toBe(0);
    expect(localStorage.getItem('pikmin-bloom-collection')).toBeNull();
  });
});
