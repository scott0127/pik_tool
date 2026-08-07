// @vitest-environment nuxt
/**
 * useCollection() closure 的行為測試（需要 Nuxt 環境）。
 * Supabase 與 auth 都用 mockNuxtImport 換掉，不打網路。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mocks = vi.hoisted(() => ({
  userId: { value: 'user-1' as string | null },
  upsertResult: { value: { error: null } as { error: unknown } },
  insertResult: { value: { error: null } as { error: unknown } },
  calls: { value: [] as string[] },
}));

mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => ({
    upsert: () => {
      mocks.calls.value.push('upsert');
      return Promise.resolve(mocks.upsertResult.value);
    },
    insert: () => {
      mocks.calls.value.push('insert');
      return Promise.resolve(mocks.insertResult.value);
    },
    select: () => ({
      eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) }),
    }),
  }),
}));

mockNuxtImport('useAuthStore', () => () => ({
  user: { value: mocks.userId.value ? { id: mocks.userId.value } : null },
  isAuthenticated: { value: Boolean(mocks.userId.value) },
}));

const { useCollection } = await import('~/composables/useCollection');
const { useDecorData } = await import('~/composables/useDecorData');

const firstItemId = () => useDecorData().getAllDecorItems()[0]!.id;

beforeEach(() => {
  mocks.userId.value = 'user-1';
  mocks.upsertResult.value = { error: null };
  mocks.insertResult.value = { error: null };
  mocks.calls.value = [];
  localStorage.clear();
  useCollection().resetCollection();
});

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
    const id = firstItemId();

    c.adjustInventory(id, 'decor', -5);
    expect(c.getInventoryItem(id).decorCount).toBe(0);
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
    const events = c.getRecentCollectionEvents(10);
    expect(events.some(e => e.itemId === id && e.delta === 1)).toBe(true);
  });

  it('delta 0 不應該產生 event', () => {
    const c = useCollection();
    const id = firstItemId();

    const before = c.getRecentCollectionEvents(100).length;
    c.adjustInventory(id, 'decor', 0);
    expect(c.getRecentCollectionEvents(100).length).toBe(before);
  });
});

describe('getStats', () => {
  it('沒收集時 collected 為 0，total 等於全部項目數', () => {
    const c = useCollection();
    const stats = c.getStats();

    expect(stats.collected).toBe(0);
    expect(stats.total).toBe(useDecorData().getAllDecorItems().length);
    expect(stats.percentage).toBe(0);
  });

  it('收集一個之後 collected 應該是 1', () => {
    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);
    expect(c.getStats().collected).toBe(1);
  });

  it('幽靈 id 不應該被計入', () => {
    const c = useCollection();
    c.importCollection(JSON.stringify({ collected: { 'ghost_id_red': true } }));
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

  it('無效 JSON 應該回 false 而不是丟例外', () => {
    expect(useCollection().importCollection('{ not json')).toBe(false);
  });

  it('缺少 collected 欄位的 JSON 應該回 false', () => {
    expect(useCollection().importCollection('{"foo":1}')).toBe(false);
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
    const c = useCollection();

    await expect(c.forceSync()).resolves.toBe(false);
    expect(mocks.calls.value).toEqual([]);
  });

  // 已知 bug：upsert 失敗後 fallback 到 insert，insert 撞到 23505（既有列）
  // 會被當成成功，但雲端其實沒被更新。修好後這裡要改成 resolves.toBe(false)。
  it('已知 bug：upsert 失敗 + insert 撞 23505 會被誤報為成功', async () => {
    mocks.upsertResult.value = { error: { code: '08006', message: 'connection failure' } };
    mocks.insertResult.value = { error: { code: '23505', message: 'duplicate key' } };

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await expect(c.forceSync()).resolves.toBe(true);
    expect(mocks.calls.value).toEqual(['upsert', 'insert']);
  });

  it('upsert 與 insert 都因非 23505 失敗時應該回報失敗', async () => {
    mocks.upsertResult.value = { error: { code: '42501', message: 'rls denied' } };
    mocks.insertResult.value = { error: { code: '42501', message: 'rls denied' } };

    const c = useCollection();
    c.adjustInventory(firstItemId(), 'decor', 1);

    await expect(c.forceSync()).resolves.toBe(false);
  });
});
