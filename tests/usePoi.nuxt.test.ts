// @vitest-environment nuxt
/**
 * useOverpassAPI 與 useLocalFirstPOI。fetch 全部攔掉。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { useOverpassAPI } = await import('~/composables/useOverpassAPI');
const { useLocalFirstPOI } = await import('~/composables/useLocalFirstPOI');

const RULE_CAFE = { id: 'cafe', name: '咖啡廳', icon: '☕', tags: ['amenity=cafe'] } as any;
const RULE_PARK = { id: 'park', name: '公園', icon: '🌳', tags: ['leisure=park'] } as any;
const RULE_SHRINE = {
  id: 'shrine', name: '神社', icon: '⛩️', tags: ['amenity=place_of_worship'], region: 'JP',
} as any;

const TAIWAN_BOUNDS = { north: 25.05, south: 25.03, east: 121.52, west: 121.50 };

let fetchMock: ReturnType<typeof vi.fn>;
let consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as any);

beforeEach(() => {
  vi.useFakeTimers();
  consoleSpies = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ];
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  consoleSpies.forEach(s => s.mockRestore());
});

/** Overpass 有 2 秒節流，要推進計時器才會真的送出 */
const runThrottled = async <T>(p: Promise<T>): Promise<T> => {
  // 先掛一個 handler：推進 timer 時 p 可能就 reject 了，
  // 這時還沒人接就會變成 unhandled rejection，讓整個 run 以非 0 結束。
  p.catch(() => {});
  await vi.advanceTimersByTimeAsync(5000);
  return p;
};

describe('useOverpassAPI — 查詢組裝', () => {
  it('沒有選任何規則時不打網路', async () => {
    expect(await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, []))).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('查詢語句包含 bbox 與 node/way/relation', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ elements: [] }));
    await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));

    const body = fetchMock.mock.calls[0]![1].body as string;
    expect(body).toContain('amenity');
    expect(body).toContain('cafe');
    expect(body).toContain('node[');
    expect(body).toContain('way[');
    expect(body).toContain('relation[');
    expect(body).toContain(String(TAIWAN_BOUNDS.south));
  });

  it('用 POST 送出', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ elements: [] }));
    await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(fetchMock.mock.calls[0]![1].method).toBe('POST');
  });
});

describe('useOverpassAPI — 結果轉換', () => {
  const cafeNode = {
    type: 'node', id: 1, lat: 25.04, lon: 121.51, tags: { amenity: 'cafe', name: '咖啡店' },
  };

  it('node 會轉成 POIPoint', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ elements: [cafeNode] }));
    const points = await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({
      id: 'node-1', lat: 25.04, lon: 121.51, name: '咖啡店', decorType: 'cafe',
    });
  });

  it('way/relation 用 center 當座標', async () => {
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{ type: 'way', id: 7, center: { lat: 25.04, lon: 121.51 }, tags: { amenity: 'cafe' } }],
    }));
    const points = await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(points[0]).toMatchObject({ id: 'way-7', lat: 25.04, lon: 121.51 });
  });

  it('沒有座標的元素會被略過', async () => {
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{ type: 'way', id: 8, tags: { amenity: 'cafe' } }],
    }));
    expect(await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]))).toEqual([]);
  });

  it('沒有 tags 的元素會被略過', async () => {
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{ type: 'node', id: 9, lat: 25.04, lon: 121.51 }],
    }));
    expect(await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]))).toEqual([]);
  });

  it('對不到任何規則的元素會被略過', async () => {
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{ type: 'node', id: 10, lat: 25.04, lon: 121.51, tags: { shop: 'bakery' } }],
    }));
    expect(await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]))).toEqual([]);
  });

  it('沒有名稱時會給預設名稱', async () => {
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{ type: 'node', id: 11, lat: 25.04, lon: 121.51, tags: { amenity: 'cafe' } }],
    }));
    const points = await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(points[0]!.name).toContain('咖啡廳');
  });

  it('台灣範圍內會排除 JP-only 規則', async () => {
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{
        type: 'node', id: 12, lat: 25.04, lon: 121.51,
        tags: { amenity: 'place_of_worship', name: '廟' },
      }],
    }));
    expect(await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_SHRINE]))).toEqual([]);
  });

  it('日本境內的 JP-only 規則會保留', async () => {
    const jpBounds = { north: 35.7, south: 35.6, east: 139.8, west: 139.7 };
    fetchMock.mockImplementation(() => jsonResponse({
      elements: [{
        type: 'node', id: 13, lat: 35.65, lon: 139.75,
        tags: { amenity: 'place_of_worship', name: '神社' },
      }],
    }));
    expect(await runThrottled(useOverpassAPI().fetchPOIs(jpBounds, [RULE_SHRINE]))).toHaveLength(1);
  });

  it('不儲存完整 tags（省記憶體）', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ elements: [cafeNode] }));
    const points = await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(points[0]!.tags).toEqual({});
  });
});

describe('useOverpassAPI — 錯誤與重試', () => {
  it('429 會換下一台伺服器', async () => {
    fetchMock
      .mockImplementationOnce(() => jsonResponse({}, 429))
      .mockImplementationOnce(() => jsonResponse({ elements: [] }));

    await runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(fetchMock.mock.calls[0]![0]).not.toBe(fetchMock.mock.calls[1]![0]);
  });

  it('全部伺服器都失敗時回空陣列並設定 error', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new Error('network down')));
    const api = useOverpassAPI();

    expect(await runThrottled(api.fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]))).toEqual([]);
    expect(api.error.value).toBeTruthy();
  });

  it('AbortError 會往外丟，不會被吞掉', async () => {
    const abortErr = new Error('aborted');
    abortErr.name = 'AbortError';
    fetchMock.mockImplementation(() => Promise.reject(abortErr));

    await expect(runThrottled(useOverpassAPI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE])))
      .rejects.toThrow('aborted');
  });

  it('查詢結束後 isLoading 回到 false', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ elements: [] }));
    const api = useOverpassAPI();

    await runThrottled(api.fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(api.isLoading.value).toBe(false);
  });
});

describe('useLocalFirstPOI', () => {
  it('getSupportedRegions 回傳已知區域', () => {
    const regions = useLocalFirstPOI().getSupportedRegions();
    expect(regions).toContain('taiwan_main_island');
    expect(regions).toContain('taipei');
  });

  it('沒有選規則時不查任何東西', async () => {
    expect(await useLocalFirstPOI().fetchPOIs(TAIWAN_BOUNDS, [])).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('本地索引載入失敗時 fallback 到 Overpass', async () => {
    fetchMock.mockImplementation((url: string) =>
      String(url).includes('/data/regions/')
        ? jsonResponse({}, 404)
        : jsonResponse({ elements: [] }),
    );

    const poi = useLocalFirstPOI();
    await runThrottled(poi.fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(poi.dataSource.value).toBe('api');
  });

  it('查詢範圍超出本地涵蓋時走 Overpass', async () => {
    fetchMock.mockImplementation((url: string) =>
      String(url).includes('/data/regions/')
        ? jsonResponse({}, 404)
        : jsonResponse({ elements: [] }),
    );

    const poi = useLocalFirstPOI();
    await runThrottled(poi.fetchPOIs(
      { north: -33.8, south: -33.9, east: 151.3, west: 151.2 }, [RULE_PARK],
    ));
    expect(poi.dataSource.value).toBe('api');
  });

  it('fetchPOIs 結束後 isLoading 回到 false', async () => {
    fetchMock.mockImplementation(() => jsonResponse({}, 404));
    const poi = useLocalFirstPOI();

    await runThrottled(poi.fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]));
    expect(poi.isLoading.value).toBe(false);
  });

  it('preloadAllRegions 全部失敗也不應該丟例外', async () => {
    fetchMock.mockImplementation(() => jsonResponse({}, 404));
    await expect(useLocalFirstPOI().preloadAllRegions()).resolves.toBeUndefined();
  });

  it('已中止的 signal 會直接丟 AbortError', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      useLocalFirstPOI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE], controller.signal),
    ).rejects.toThrow(/abort/i);
  });
});

// 這一段放在最後：區域索引與分片快取都在 module scope，
// 一旦載入成功就會被前面的測試共用。
describe('useLocalFirstPOI — 本地分片命中', () => {
  const REGION_BBOX = { north: 26, south: 21, east: 122, west: 120 };
  const TILE_BBOX = { north: 25.1, south: 25.0, east: 121.6, west: 121.5 };

  const index = {
    regionId: 'taiwan_main_island',
    regionName: '台灣本島',
    bbox: REGION_BBOX,
    tileGridSize: 1,
    tiles: [{ id: 'r0_c0', bbox: TILE_BBOX, file: 'r0_c0.json', poiCount: 3 }],
  };

  const tile = {
    bbox: TILE_BBOX,
    features: [
      { id: 'f-cafe', n: '咖啡店', t: 'cafe', pts: [[25.04, 121.51]] },
      { id: 'f-park', n: '公園', t: 'park', pts: [[25.045, 121.515]] },
      { id: 'f-shrine', n: '神社', t: 'shrine', pts: [[25.041, 121.512]] },
    ],
  };

  const serveLocal = (opts: { tileStatus?: number } = {}) => {
    fetchMock.mockImplementation((url: string) => {
      const u = String(url);
      if (u.includes('taiwan_main_island/index.json')) return jsonResponse(index);
      if (u.includes('/tiles/')) return jsonResponse(tile, opts.tileStatus ?? 200);
      if (u.includes('/data/regions/')) return jsonResponse({}, 404);
      return jsonResponse({ elements: [] });
    });
  };

  it('範圍落在本地區域內時用本地資料，不打 Overpass', async () => {
    serveLocal();
    const poi = useLocalFirstPOI();

    const points = await poi.fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]);
    expect(poi.dataSource.value).toBe('local');
    expect(points.map(p => p.decorType)).toEqual(['cafe']);
  });

  it('只回傳有勾選的飾品類型', async () => {
    serveLocal();
    const points = await useLocalFirstPOI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE, RULE_PARK]);
    expect(new Set(points.map(p => p.decorType))).toEqual(new Set(['cafe', 'park']));
  });

  it('超出查詢範圍的點會被濾掉', async () => {
    serveLocal();
    const tight = { north: 25.042, south: 25.039, east: 121.513, west: 121.509 };
    const points = await useLocalFirstPOI().fetchPOIs(tight, [RULE_CAFE, RULE_PARK]);

    expect(points.map(p => p.decorType)).toEqual(['cafe']);
  });

  it('台灣境內會濾掉 JP-only 規則', async () => {
    serveLocal();
    const points = await useLocalFirstPOI().fetchPOIs(TAIWAN_BOUNDS, [RULE_SHRINE]);
    expect(points).toEqual([]);
  });

  it('名稱與 icon 會從規則帶入', async () => {
    serveLocal();
    const [point] = await useLocalFirstPOI().fetchPOIs(TAIWAN_BOUNDS, [RULE_CAFE]);

    expect(point!.name).toBe('咖啡店');
    expect(point!.decorName).toBe(RULE_CAFE.name);
    expect(point!.decorIcon).toBe(RULE_CAFE.icon);
  });
});
