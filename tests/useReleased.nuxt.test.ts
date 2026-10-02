// @vitest-environment nuxt
/**
 * useReleased —— 第二套雲端同步，和 useCollection 同型但多了衝突處理。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mocks = vi.hoisted(() => ({
  userId: { value: 'user-1' as string | null },
  cloud: { value: null as any },
  selectError: { value: null as any },
  upsertResult: { value: { error: null } as { error: unknown } },
  insertResult: { value: { error: null } as { error: unknown } },
  calls: { value: [] as string[] },
}));

mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => ({
    upsert: (payload: any) => {
      mocks.calls.value.push('upsert');
      const res = mocks.upsertResult.value;
      if (!res.error) mocks.cloud.value = payload;
      return Promise.resolve(res);
    },
    insert: (payload: any) => {
      mocks.calls.value.push('insert');
      const res = mocks.insertResult.value;
      if (!res.error) mocks.cloud.value = payload;
      return Promise.resolve(res);
    },
    select: () => ({
      eq: () => ({
        single: () => {
          mocks.calls.value.push('select');
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

mockNuxtImport('useAuthStore', () => () => ({
  get user() {
    return { value: mocks.userId.value ? { id: mocks.userId.value } : null };
  },
  get isAuthenticated() {
    return { value: Boolean(mocks.userId.value) };
  },
}));

const { useReleased } = await import('~/composables/useReleased');

const DEBOUNCE_MS = 15000;
const draft = (decorItemId: string, releasedAt = '2026-01-01') => ({
  decorItemId,
  releasedAt,
  nickname: 'nick-' + decorItemId,
});

const seedCloud = (records: any[]) => {
  mocks.cloud.value = { user_id: 'user-1', released_data: records, updated_at: 'x' };
};
const cloudRecords = (): any[] => mocks.cloud.value?.released_data ?? [];
const wrote = () => mocks.calls.value.some(c => c === 'upsert' || c === 'insert');

let consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  consoleSpies = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ];

  // 先清空本地狀態；未登入避免順手排一個 debounce
  mocks.userId.value = null;
  localStorage.clear();
  const r = useReleased();
  r.getRecords().slice().forEach(rec => r.deleteRecord(rec.id));

  mocks.userId.value = 'user-1';
  mocks.cloud.value = null;
  mocks.selectError.value = null;
  mocks.upsertResult.value = { error: null };
  mocks.insertResult.value = { error: null };
  mocks.calls.value = [];
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  consoleSpies.forEach(s => s.mockRestore());
});

const settle = async <T>(p: Promise<T>): Promise<T> => {
  p.catch(() => {}); // 避免推進 timer 時變成 unhandled rejection
  await vi.advanceTimersByTimeAsync(30000);
  return p;
};

describe('CRUD', () => {
  it('addRecord 會補上 id 與 createdAt', () => {
    const r = useReleased();
    r.addRecord(draft('restaurant_chef_hat_red'));

    const [rec] = r.getRecords();
    expect(rec!.id).toBeTruthy();
    expect(rec!.createdAt).toBeTruthy();
    expect(rec!.decorItemId).toBe('restaurant_chef_hat_red');
  });

  it('新增的紀錄排在最前面', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    r.addRecord(draft('b'));

    expect(r.getRecords().map(x => x.decorItemId)).toEqual(['b', 'a']);
  });

  it('每筆 id 都不一樣', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    r.addRecord(draft('b'));

    expect(new Set(r.getRecords().map(x => x.id)).size).toBe(2);
  });

  it('getRecordCount 與 getRecords 長度一致', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    r.addRecord(draft('b'));
    expect(r.getRecordCount()).toBe(r.getRecords().length);
  });

  it('updateRecord 會改到指定那筆並回 true', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    const id = r.getRecords()[0]!.id;

    expect(r.updateRecord(id, { nickname: 'renamed' })).toBe(true);
    expect(r.getRecords()[0]!.nickname).toBe('renamed');
  });

  it('updateRecord 不會動到 id 與 createdAt', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    const before = { ...r.getRecords()[0]! };

    r.updateRecord(before.id, { note: 'hi' });
    const after = r.getRecords()[0]!;
    expect(after.id).toBe(before.id);
    expect(after.createdAt).toBe(before.createdAt);
  });

  it('updateRecord 找不到 id 回 false', () => {
    expect(useReleased().updateRecord('nope', { note: 'x' })).toBe(false);
  });

  it('deleteRecord 會移除該筆並回 true', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    r.addRecord(draft('b'));
    const id = r.getRecords()[0]!.id;

    expect(r.deleteRecord(id)).toBe(true);
    expect(r.getRecordCount()).toBe(1);
    expect(r.getRecords().some(x => x.id === id)).toBe(false);
  });

  it('deleteRecord 找不到 id 回 false', () => {
    expect(useReleased().deleteRecord('nope')).toBe(false);
  });
});

describe('本地儲存', () => {
  it('新增後會寫進 localStorage', () => {
    useReleased().addRecord(draft('a'));
    expect(localStorage.getItem('pikmin-bloom-released')).toContain('a');
  });

  it('loadFromLocal 會還原紀錄', () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    const snapshot = localStorage.getItem('pikmin-bloom-released')!;

    r.deleteRecord(r.getRecords()[0]!.id);
    expect(r.getRecordCount()).toBe(0);

    localStorage.setItem('pikmin-bloom-released', snapshot);
    r.loadFromLocal();
    expect(r.getRecordCount()).toBe(1);
  });

  it('localStorage 壞掉時不應該丟例外', () => {
    localStorage.setItem('pikmin-bloom-released', '{ not json');
    expect(() => useReleased().loadFromLocal()).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('debounce 同步', () => {
  it('新增之後不會馬上打雲端', () => {
    useReleased().addRecord(draft('a'));
    expect(wrote()).toBe(false);
  });

  it('debounce 到期才寫雲端', async () => {
    useReleased().addRecord(draft('a'));
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100);
    expect(wrote()).toBe(true);
  });

  it('連續多次操作只寫一次', async () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    r.addRecord(draft('b'));
    r.addRecord(draft('c'));

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100);
    expect(mocks.calls.value.filter(c => c === 'upsert')).toHaveLength(1);
  });

  it('未登入時 debounce 到期也不會寫雲端', async () => {
    mocks.userId.value = null;
    useReleased().addRecord(draft('a'));

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100);
    expect(wrote()).toBe(false);
  });

  it('forceSyncNow 立刻寫雲端', async () => {
    const r = useReleased();
    r.addRecord(draft('a'));

    await settle(r.forceSyncNow());
    expect(wrote()).toBe(true);
    expect(cloudRecords()).toHaveLength(1);
  });
});

describe('loadFromCloud', () => {
  it('本地是空的時候直接套用雲端', async () => {
    const r = useReleased();
    seedCloud([{ id: 'c1', decorItemId: 'a', releasedAt: '2026-01-01', createdAt: 'x' }]);

    await r.loadFromCloud(true);
    expect(r.getRecordCount()).toBe(1);
    expect(r.syncConflict.value).toBeNull();
  });

  it('本地與雲端相同時不算衝突', async () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    await settle(r.forceSyncNow());

    await r.loadFromCloud(true);
    expect(r.syncConflict.value).toBeNull();
  });

  it('本地與雲端不同時會標記衝突，且不動本地資料', async () => {
    const r = useReleased();
    r.addRecord(draft('local-only'));
    seedCloud([{ id: 'c1', decorItemId: 'cloud-only', releasedAt: '2026-01-01', createdAt: 'x' }]);

    await r.loadFromCloud(true);

    expect(r.syncConflict.value).toBeTruthy();
    expect(r.syncConflict.value!.localCount).toBe(1);
    expect(r.syncConflict.value!.cloudCount).toBe(1);
    expect(r.getRecords()[0]!.decorItemId).toBe('local-only');
  });

  it('未登入時不讀雲端', async () => {
    mocks.userId.value = null;
    await useReleased().loadFromCloud(true);
    expect(mocks.calls.value).toEqual([]);
  });

  it('讀取失敗時保留本地資料', async () => {
    const r = useReleased();
    r.addRecord(draft('a'));
    mocks.selectError.value = { code: '08006', message: 'boom' };

    await r.loadFromCloud(true);
    expect(r.getRecordCount()).toBe(1);
  });
});

describe('衝突解決', () => {
  const setUpConflict = async () => {
    const r = useReleased();
    r.addRecord(draft('local-only'));
    seedCloud([{ id: 'c1', decorItemId: 'cloud-only', releasedAt: '2026-01-01', createdAt: 'x' }]);
    await r.loadFromCloud(true);
    expect(r.syncConflict.value).toBeTruthy();
    return r;
  };

  it('mergeCloudConflict 會把兩邊合起來並清掉衝突', async () => {
    const r = await setUpConflict();
    await settle(r.mergeCloudConflict());

    const ids = r.getRecords().map(x => x.decorItemId);
    expect(ids).toContain('local-only');
    expect(ids).toContain('cloud-only');
    expect(r.syncConflict.value).toBeNull();
  });

  it('discardLocalConflict 會丟掉本地、改用雲端', async () => {
    const r = await setUpConflict();
    await settle(r.discardLocalConflict());

    expect(r.getRecords().map(x => x.decorItemId)).toEqual(['cloud-only']);
    expect(r.syncConflict.value).toBeNull();
  });

  it('沒有衝突時解決函式回 false', async () => {
    const r = useReleased();
    await expect(r.mergeCloudConflict()).resolves.toBe(false);
    await expect(r.discardLocalConflict()).resolves.toBe(false);
  });

  it('合併後的結果會寫回雲端', async () => {
    const r = await setUpConflict();
    mocks.calls.value = [];

    await settle(r.mergeCloudConflict());
    expect(wrote()).toBe(true);
    expect(cloudRecords()).toHaveLength(2);
  });
});

describe('saveToCloud 錯誤處理', () => {
  it('未登入時回 false', async () => {
    mocks.userId.value = null;
    await expect(settle(useReleased().saveToCloud(true))).resolves.toBe(false);
  });

  it('upsert 與 insert 都失敗時回 false', async () => {
    mocks.upsertResult.value = { error: { code: '42501' } };
    mocks.insertResult.value = { error: { code: '42501' } };

    const r = useReleased();
    r.addRecord(draft('a'));
    await expect(settle(r.saveToCloud(true))).resolves.toBe(false);
  });

  // 與 useCollection 同一個 bug：insert 撞 23505 被當成成功，雲端其實沒更新
  it.fails('upsert 失敗 + insert 撞 23505 不應回報成功', async () => {
    mocks.upsertResult.value = { error: { code: '08006' } };
    mocks.insertResult.value = { error: { code: '23505' } };

    const r = useReleased();
    r.addRecord(draft('a'));
    await expect(settle(r.saveToCloud(true))).resolves.toBe(false);
  });
});
