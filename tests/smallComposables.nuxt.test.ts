// @vitest-environment nuxt
/**
 * useToast / useGeocoding / useSiteConfig / usePageViews。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mocks = vi.hoisted(() => ({
  selectRows: { value: [] as any[] },
  selectError: { value: null as any },
  writeError: { value: null as any },
  rpcResult: { value: { data: 1, error: null } as any },
  calls: { value: [] as string[] },
  payloads: { value: [] as any[] },
}));

const thenable = (result: any) => {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    then: (res: any) => Promise.resolve(result).then(res),
  };
  return chain;
};

mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => ({
    select: () => {
      mocks.calls.value.push('select');
      return thenable(
        mocks.selectError.value
          ? { data: null, error: mocks.selectError.value }
          : { data: mocks.selectRows.value, error: null },
      );
    },
    upsert: (payload: any) => {
      mocks.calls.value.push('upsert');
      mocks.payloads.value.push(payload);
      return thenable({ data: null, error: mocks.writeError.value });
    },
    insert: (payload: any) => {
      mocks.calls.value.push('insert');
      mocks.payloads.value.push(payload);
      return thenable({ data: null, error: mocks.writeError.value });
    },
    update: (payload: any) => {
      mocks.calls.value.push('update');
      mocks.payloads.value.push(payload);
      return thenable({ data: null, error: mocks.writeError.value });
    },
  }),
  rpc: () => {
    mocks.calls.value.push('rpc');
    return Promise.resolve(mocks.rpcResult.value);
  },
}));

const { useToast } = await import('~/composables/useToast');
const { useGeocoding } = await import('~/composables/useGeocoding');

let fetchMock: ReturnType<typeof vi.fn>;
let consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  consoleSpies = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ];
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  mocks.selectRows.value = [];
  mocks.selectError.value = null;
  mocks.writeError.value = null;
  mocks.rpcResult.value = { data: 1, error: null };
  mocks.calls.value = [];
  mocks.payloads.value = [];
  localStorage.clear();
});

afterEach(() => {
  // toast 佇列在 module scope，要先讓它排完再清 timer，否則會漏到下一個測試
  const t = useToast();
  for (let i = 0; i < 30 && t.isShowing.value; i++) {
    vi.advanceTimersByTime(60000);
  }

  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  consoleSpies.forEach(s => s.mockRestore());
});

describe('useToast', () => {
  it('showToast 會顯示訊息', () => {
    const t = useToast();
    t.showToast('hello');

    expect(t.isShowing.value).toBe(true);
    expect(t.currentToast.value?.message).toBe('hello');
  });

  it('success / error / info / warning 帶出對應的 type', () => {
    const t = useToast();
    ([['success', t.success], ['error', t.error], ['info', t.info], ['warning', t.warning]] as const)
      .forEach(([type, fn]) => {
        vi.advanceTimersByTime(10000);
        fn('msg-' + type);
        expect(t.currentToast.value?.type).toBe(type);
      });
  });

  it('時間到之後會自己收起來', () => {
    const t = useToast();
    t.showToast('bye', 'info', 1000);
    expect(t.isShowing.value).toBe(true);

    vi.advanceTimersByTime(5000);
    expect(t.isShowing.value).toBe(false);
  });

  it('連續兩則訊息會排隊顯示，不會互相蓋掉', () => {
    const t = useToast();
    t.showToast('first', 'info', 1000);
    t.showToast('second', 'info', 1000);

    expect(t.currentToast.value?.message).toBe('first');
    vi.advanceTimersByTime(10000);
    expect(t.currentToast.value?.message).not.toBe('first');
  });
});

describe('useGeocoding', () => {
  const nominatimHit = [{
    place_id: 1, display_name: '台北車站', lat: '25.0478', lon: '121.5170',
    boundingbox: ['25.0', '25.1', '121.5', '121.6'], type: 'station', importance: 0.7,
  }];

  const okJson = (body: unknown) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as any);

  it('太短的關鍵字不打網路', async () => {
    expect(await useGeocoding().searchLocation('a')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('空白關鍵字不打網路', async () => {
    expect(await useGeocoding().searchLocation('   ')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('會把結果轉成 GeocodingResult', async () => {
    fetchMock.mockImplementation(() => okJson(nominatimHit));
    const results = await useGeocoding().searchLocation('台北車站');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      place_id: '1', display_name: '台北車站', lat: '25.0478', lon: '121.5170',
    });
  });

  it('查詢字串會編碼進 URL', async () => {
    fetchMock.mockImplementation(() => okJson([]));
    await useGeocoding().searchLocation('台北 車站');

    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain('nominatim.openstreetmap.org');
    expect(url).toContain('format=json');
    expect(url).toContain('limit=5');
  });

  it('沒有 importance 時補 0', async () => {
    fetchMock.mockImplementation(() => okJson([{ ...nominatimHit[0], importance: undefined }]));
    const results = await useGeocoding().searchLocation('台北車站');
    expect(results[0]!.importance).toBe(0);
  });

  it('HTTP 錯誤時回空陣列並設定 searchError', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) } as any));

    const g = useGeocoding();
    expect(await g.searchLocation('台北車站')).toEqual([]);
    expect(g.searchError.value).toBeTruthy();
  });

  it('網路失敗時回空陣列', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new Error('offline')));
    const g = useGeocoding();

    expect(await g.searchLocation('台北車站')).toEqual([]);
    expect(g.searchError.value).toBe('offline');
  });

  it('查完之後 isSearching 回到 false', async () => {
    fetchMock.mockImplementation(() => okJson([]));
    const g = useGeocoding();

    await g.searchLocation('台北車站');
    expect(g.isSearching.value).toBe(false);
  });
});

describe('useSiteConfig', () => {
  it('讀取失敗時不應該丟例外', async () => {
    const { useSiteConfig } = await import('~/composables/useSiteConfig');
    mocks.selectError.value = { code: '42501', message: 'denied' };

    await expect(useSiteConfig().fetchHeroConfig()).resolves.not.toThrow();
  });

  it('fetchHeroConfig 會查詢資料庫', async () => {
    const { useSiteConfig } = await import('~/composables/useSiteConfig');
    await useSiteConfig().fetchHeroConfig();
    expect(mocks.calls.value).toContain('select');
  });

  it('查完之後 isConfigLoading 回到 false', async () => {
    const { useSiteConfig } = await import('~/composables/useSiteConfig');
    const c = useSiteConfig();

    await c.fetchHeroConfig();
    expect(c.isConfigLoading.value).toBe(false);
  });
});

describe('usePageViews', () => {
  it('incrementPageViews 會呼叫 RPC', async () => {
    const { usePageViews } = await import('~/composables/usePageViews');
    await usePageViews().incrementPageViews();
    expect(mocks.calls.value).toContain('rpc');
  });

  it('RPC 失敗時不應該丟例外', async () => {
    const { usePageViews } = await import('~/composables/usePageViews');
    mocks.rpcResult.value = { data: null, error: { message: 'boom' } };

    await expect(usePageViews().incrementPageViews()).resolves.not.toThrow();
  });

  it('getPageViews 不應該丟例外', async () => {
    const { usePageViews } = await import('~/composables/usePageViews');
    await expect(usePageViews().getPageViews()).resolves.not.toThrow();
  });
});
