// @vitest-environment nuxt
/**
 * useCellReports。
 * 快取與 fetchedCellIds 都在 module scope，跨測試不會重置，
 * 所以每個測試都用自己獨一無二的 cell id，避免互相干擾。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mocks = vi.hoisted(() => ({
  userId: { value: 'user-1' as string | null },
  rpcRows: { value: [] as any[] },
  rpcError: { value: null as any },
  insertError: { value: null as any },
  rpcCalls: { value: [] as string[][] },
  inserts: { value: [] as any[] },
}));

mockNuxtImport('useSupabaseClient', () => () => ({
  rpc: (_name: string, args: { cell_ids: string[] }) => {
    mocks.rpcCalls.value.push(args.cell_ids);
    return Promise.resolve(
      mocks.rpcError.value
        ? { data: null, error: mocks.rpcError.value }
        : { data: mocks.rpcRows.value, error: null },
    );
  },
  from: () => ({
    insert: (payload: any) => {
      mocks.inserts.value.push(payload);
      return Promise.resolve({ error: mocks.insertError.value });
    },
  }),
  auth: {
    getUser: () =>
      Promise.resolve({
        data: { user: mocks.userId.value ? { id: mocks.userId.value } : null },
        error: null,
      }),
  },
}));

mockNuxtImport('useSupabaseUser', () => () => ({
  get value() {
    return mocks.userId.value ? { id: mocks.userId.value } : null;
  },
}));

const { useCellReports } = await import('~/composables/useCellReports');

const DEBOUNCE_MS = 2000;
let seq = 0;
/** 每次呼叫都給一組沒用過的 cell id */
const freshCells = (n = 1): string[] =>
  Array.from({ length: n }, () => `cell-${++seq}-${Math.random().toString(36).slice(2, 8)}`);

let consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  consoleSpies = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ];
  mocks.userId.value = 'user-1';
  mocks.rpcRows.value = [];
  mocks.rpcError.value = null;
  mocks.insertError.value = null;
  mocks.rpcCalls.value = [];
  mocks.inserts.value = [];
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  consoleSpies.forEach(s => s.mockRestore());
});

const flush = async () => {
  await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100);
};

describe('未查詢過的 cell', () => {
  it('預設不是 not pure', () => {
    expect(useCellReports().isReportedNotPure(freshCells()[0]!)).toBe(false);
  });

  it('預設沒有新增/移除的飾品', () => {
    const [id] = freshCells();
    const r = useCellReports();
    expect(r.getAddedDecors(id!).size).toBe(0);
    expect(r.getRemovedDecors(id!).size).toBe(0);
    expect(r.hasAddedDecor(id!, 'cafe')).toBe(false);
    expect(r.hasRemovedDecor(id!, 'cafe')).toBe(false);
  });

  it('isReported 是 isReportedNotPure 的別名', () => {
    const r = useCellReports();
    expect(r.isReported).toBe(r.isReportedNotPure);
  });
});

describe('fetchReportsForCells — 批次與 debounce', () => {
  it('空陣列不會觸發查詢', async () => {
    await useCellReports().fetchReportsForCells([]);
    await flush();
    expect(mocks.rpcCalls.value).toHaveLength(0);
  });

  it('debounce 未到期前不會查詢', async () => {
    await useCellReports().fetchReportsForCells(freshCells(2));
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 500);
    expect(mocks.rpcCalls.value).toHaveLength(0);
  });

  it('debounce 到期後送出一次查詢', async () => {
    const cells = freshCells(2);
    await useCellReports().fetchReportsForCells(cells);
    await flush();

    expect(mocks.rpcCalls.value).toHaveLength(1);
    cells.forEach(id => expect(mocks.rpcCalls.value[0]).toContain(id));
  });

  it('連續多次呼叫會合併成一次查詢', async () => {
    const r = useCellReports();
    const a = freshCells(2);
    const b = freshCells(2);

    await r.fetchReportsForCells(a);
    await r.fetchReportsForCells(b);
    await flush();

    expect(mocks.rpcCalls.value).toHaveLength(1);
    [...a, ...b].forEach(id => expect(mocks.rpcCalls.value[0]).toContain(id));
  });

  it('已查詢過的 cell 不會再查一次', async () => {
    const cells = freshCells(2);
    const r = useCellReports();

    await r.fetchReportsForCells(cells);
    await flush();
    expect(mocks.rpcCalls.value).toHaveLength(1);

    await r.fetchReportsForCells(cells);
    await flush();
    expect(mocks.rpcCalls.value).toHaveLength(1);
  });

  it('單次查詢最多送 100 個 cell', async () => {
    await useCellReports().fetchReportsForCells(freshCells(150));
    await flush();

    expect(mocks.rpcCalls.value[0]!.length).toBeLessThanOrEqual(100);
  });

  it('超過批次上限的部分會在後續 flush 補送', async () => {
    await useCellReports().fetchReportsForCells(freshCells(150));
    await flush();
    await flush();

    const total = mocks.rpcCalls.value.reduce((n, batch) => n + batch.length, 0);
    expect(mocks.rpcCalls.value.length).toBeGreaterThan(1);
    expect(total).toBeGreaterThan(100);
  });
});

describe('fetchReportsForCells — 套用結果', () => {
  it('is_not_pure 會被記錄下來', async () => {
    const [id] = freshCells();
    mocks.rpcRows.value = [
      { s2_cell_id: id, is_not_pure: true, added_decors: null, removed_decors: null },
    ];

    const r = useCellReports();
    await r.fetchReportsForCells([id!]);
    await flush();

    expect(r.isReportedNotPure(id!)).toBe(true);
  });

  it('added / removed decors 會被記錄下來', async () => {
    const [id] = freshCells();
    mocks.rpcRows.value = [
      { s2_cell_id: id, is_not_pure: false, added_decors: ['cafe'], removed_decors: ['park'] },
    ];

    const r = useCellReports();
    await r.fetchReportsForCells([id!]);
    await flush();

    expect(r.hasAddedDecor(id!, 'cafe')).toBe(true);
    expect(r.hasRemovedDecor(id!, 'park')).toBe(true);
    expect(r.hasAddedDecor(id!, 'park')).toBe(false);
  });

  it('null 的 decor 陣列不會爆掉', async () => {
    const [id] = freshCells();
    mocks.rpcRows.value = [
      { s2_cell_id: id, is_not_pure: null, added_decors: null, removed_decors: null },
    ];

    const r = useCellReports();
    await r.fetchReportsForCells([id!]);
    await flush();

    expect(r.isReportedNotPure(id!)).toBe(false);
    expect(r.getAddedDecors(id!).size).toBe(0);
  });

  it('查到資料時 cellReportsVersion 會遞增', async () => {
    const [id] = freshCells();
    mocks.rpcRows.value = [
      { s2_cell_id: id, is_not_pure: true, added_decors: null, removed_decors: null },
    ];

    const r = useCellReports();
    const before = r.cellReportsVersion.value;
    await r.fetchReportsForCells([id!]);
    await flush();

    expect(r.cellReportsVersion.value).toBeGreaterThan(before);
  });

  it('沒有 s2_cell_id 的資料列會被忽略', async () => {
    const [id] = freshCells();
    mocks.rpcRows.value = [{ s2_cell_id: null, is_not_pure: true }];

    const r = useCellReports();
    await r.fetchReportsForCells([id!]);
    await flush();

    expect(r.isReportedNotPure(id!)).toBe(false);
  });
});

describe('fetchReportsForCells — 查詢失敗', () => {
  it('RPC 失敗不應該丟例外', async () => {
    mocks.rpcError.value = { code: '08006', message: 'boom' };
    const r = useCellReports();

    await r.fetchReportsForCells(freshCells(2));
    await expect(flush()).resolves.not.toThrow();
  });

  // 失敗時 cell 會從 pendingCellIds 移除且不寫入 fetchedCellIds，
  // 所以當下這批會漏掉，但下次呼叫還是會重新排進去。
  it('查詢失敗的 cell 之後還會再被查一次', async () => {
    const cells = freshCells(2);
    const r = useCellReports();

    mocks.rpcError.value = { code: '08006', message: 'boom' };
    await r.fetchReportsForCells(cells);
    await flush();
    expect(mocks.rpcCalls.value).toHaveLength(1);

    mocks.rpcError.value = null;
    await r.fetchReportsForCells(cells);
    await flush();

    expect(mocks.rpcCalls.value.length).toBeGreaterThan(1);
  });
});

describe('submitReport', () => {
  it('未登入時應該擋下來', async () => {
    mocks.userId.value = null;
    await expect(useCellReports().submitReport(freshCells()[0]!, 'not_pure')).rejects.toThrow();
  });

  it('missing_decor 沒帶 decorId 應該擋下來', async () => {
    await expect(useCellReports().submitReport(freshCells()[0]!, 'missing_decor')).rejects.toThrow();
  });

  it('extra_decor 沒帶 decorId 應該擋下來', async () => {
    await expect(useCellReports().submitReport(freshCells()[0]!, 'extra_decor')).rejects.toThrow();
  });

  it('not_pure 會樂觀更新並寫入資料庫', async () => {
    const [id] = freshCells();
    const r = useCellReports();

    await r.submitReport(id!, 'not_pure');

    expect(r.isReportedNotPure(id!)).toBe(true);
    expect(mocks.inserts.value[0]).toMatchObject({
      s2_cell_id: id,
      user_id: 'user-1',
      report_type: 'not_pure',
      decor_id: null,
    });
  });

  it('missing_decor 會加進 addedDecors', async () => {
    const [id] = freshCells();
    const r = useCellReports();

    await r.submitReport(id!, 'missing_decor', 'cafe');

    expect(r.hasAddedDecor(id!, 'cafe')).toBe(true);
    expect(mocks.inserts.value[0]).toMatchObject({ report_type: 'missing_decor', decor_id: 'cafe' });
  });

  it('extra_decor 會加進 removedDecors', async () => {
    const [id] = freshCells();
    const r = useCellReports();

    await r.submitReport(id!, 'extra_decor', 'park');
    expect(r.hasRemovedDecor(id!, 'park')).toBe(true);
  });

  it('重複回報同一項不會再打一次資料庫', async () => {
    const [id] = freshCells();
    const r = useCellReports();

    await r.submitReport(id!, 'not_pure');
    await r.submitReport(id!, 'not_pure');

    expect(mocks.inserts.value).toHaveLength(1);
  });

  it('寫入失敗時樂觀更新要回滾', async () => {
    const [id] = freshCells();
    const r = useCellReports();
    mocks.insertError.value = { code: '42501', message: 'rls denied' };

    await expect(r.submitReport(id!, 'missing_decor', 'cafe')).rejects.toBeTruthy();
    expect(r.hasAddedDecor(id!, 'cafe')).toBe(false);
  });

  it('撞到 23505（已回報過）視為成功，狀態保留', async () => {
    const [id] = freshCells();
    const r = useCellReports();
    mocks.insertError.value = { code: '23505', message: 'duplicate' };

    await expect(r.submitReport(id!, 'not_pure')).resolves.toBeUndefined();
    expect(r.isReportedNotPure(id!)).toBe(true);
  });

  it('回報後 cellReportsVersion 會遞增', async () => {
    const [id] = freshCells();
    const r = useCellReports();
    const before = r.cellReportsVersion.value;

    await r.submitReport(id!, 'not_pure');
    expect(r.cellReportsVersion.value).toBeGreaterThan(before);
  });

  // 已知 bug：submitReport 在 insert 之前就把 cell 加進 fetchedCellIds，
  // 失敗回滾時沒有移除，所以之後永遠不會再向後端查這一格。
  it.fails('回報失敗的 cell 之後仍然應該可以被查詢', async () => {
    const [id] = freshCells();
    const r = useCellReports();

    mocks.insertError.value = { code: '42501', message: 'rls denied' };
    await expect(r.submitReport(id!, 'not_pure')).rejects.toBeTruthy();

    mocks.insertError.value = null;
    await r.fetchReportsForCells([id!]);
    await flush();

    expect(mocks.rpcCalls.value.some(batch => batch.includes(id!))).toBe(true);
  });
});
