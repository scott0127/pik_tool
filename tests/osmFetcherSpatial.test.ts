/**
 * OSM 資料管線空間工具測試（scripts/osm-fetcher/）。
 * 原名 useLocalFirstPOI.test.ts，但從未 import 該 composable，故改名。
 * 注意：useLocalFirstPOI.ts 有自己一份未 export 的同名函式，仍無覆蓋。
 */
import { describe, it, expect } from 'vitest';
import {
  filterPOIsInBounds,
  filterPOIsByDecorTypes,
  queryPOIs,
} from '../scripts/osm-fetcher/spatial';
import {
  REGIONS,
  getRegion,
  getAvailableRegions,
  isWithinRegion,
  bboxIntersectsRegion,
} from '../scripts/osm-fetcher/regions';
import type { BoundingBox, POIData } from '../scripts/osm-fetcher/types';

const makePOI = (
  id: string,
  lat: number,
  lon: number,
  decorType: string,
  name = id,
): POIData => ({
  id,
  lat,
  lon,
  name,
  decorType,
  decorName: decorType,
  decorIcon: '📍',
});

const TAIPEI_POIS: POIData[] = [
  makePOI('node-1', 25.0478, 121.5170, 'station', '台北車站'),
  makePOI('node-2', 25.0330, 121.5654, 'movie_theater', '信義威秀'),
  makePOI('node-3', 25.0423, 121.5077, 'park', '二二八公園'),
];

const BOUNDS: BoundingBox = { north: 25.05, south: 25.03, east: 121.52, west: 121.50 };

describe('filterPOIsInBounds', () => {
  it('應該留下範圍內的 POI', () => {
    const filtered = filterPOIsInBounds(TAIPEI_POIS, BOUNDS);
    expect(filtered.map(p => p.name)).toEqual(['台北車站', '二二八公園']);
  });

  it('範圍內沒有 POI 時應該回傳空陣列', () => {
    const filtered = filterPOIsInBounds(TAIPEI_POIS, {
      north: 24.0, south: 23.9, east: 121.0, west: 120.9,
    });
    expect(filtered).toEqual([]);
  });

  it('空輸入應該回傳空陣列', () => {
    expect(filterPOIsInBounds([], BOUNDS)).toEqual([]);
  });

  // ---- 邊界值：目前的實作四邊都是「包含」(>= / <=) ----
  it('剛好落在南邊界上應該算在範圍內', () => {
    const poi = makePOI('south-edge', BOUNDS.south, 121.51, 'park');
    expect(filterPOIsInBounds([poi], BOUNDS)).toHaveLength(1);
  });

  it('剛好落在北邊界上應該算在範圍內', () => {
    const poi = makePOI('north-edge', BOUNDS.north, 121.51, 'park');
    expect(filterPOIsInBounds([poi], BOUNDS)).toHaveLength(1);
  });

  it('剛好落在西邊界上應該算在範圍內', () => {
    const poi = makePOI('west-edge', 25.04, BOUNDS.west, 'park');
    expect(filterPOIsInBounds([poi], BOUNDS)).toHaveLength(1);
  });

  it('剛好落在東邊界上應該算在範圍內', () => {
    const poi = makePOI('east-edge', 25.04, BOUNDS.east, 'park');
    expect(filterPOIsInBounds([poi], BOUNDS)).toHaveLength(1);
  });

  it('四個角落都應該算在範圍內', () => {
    const corners = [
      makePOI('sw', BOUNDS.south, BOUNDS.west, 'park'),
      makePOI('se', BOUNDS.south, BOUNDS.east, 'park'),
      makePOI('nw', BOUNDS.north, BOUNDS.west, 'park'),
      makePOI('ne', BOUNDS.north, BOUNDS.east, 'park'),
    ];
    expect(filterPOIsInBounds(corners, BOUNDS)).toHaveLength(4);
  });

  it('只要超出邊界一點點就應該被排除', () => {
    const outside = [
      makePOI('too-south', BOUNDS.south - 0.0001, 121.51, 'park'),
      makePOI('too-north', BOUNDS.north + 0.0001, 121.51, 'park'),
      makePOI('too-west', 25.04, BOUNDS.west - 0.0001, 'park'),
      makePOI('too-east', 25.04, BOUNDS.east + 0.0001, 'park'),
    ];
    expect(filterPOIsInBounds(outside, BOUNDS)).toEqual([]);
  });

  it('零面積 bbox 應該只留下剛好在那個點上的 POI', () => {
    const point: BoundingBox = { north: 25.04, south: 25.04, east: 121.51, west: 121.51 };
    const exact = makePOI('exact', 25.04, 121.51, 'park');
    const near = makePOI('near', 25.0401, 121.51, 'park');
    expect(filterPOIsInBounds([exact, near], point).map(p => p.id)).toEqual(['exact']);
  });

  it('不應該修改輸入陣列', () => {
    const input = [...TAIPEI_POIS];
    filterPOIsInBounds(input, BOUNDS);
    expect(input).toEqual(TAIPEI_POIS);
  });
});

describe('filterPOIsByDecorTypes', () => {
  it('應該依 decorType 過濾', () => {
    const filtered = filterPOIsByDecorTypes(TAIPEI_POIS, ['station', 'park']);
    expect(filtered.map(p => p.decorType).sort()).toEqual(['park', 'station']);
  });

  it('空的 decorTypes 應該原樣回傳全部（不是回傳空陣列）', () => {
    // filterPOIsByDecorTypes 的 early return —— 之前完全沒有測試覆蓋。
    expect(filterPOIsByDecorTypes(TAIPEI_POIS, [])).toEqual(TAIPEI_POIS);
  });

  it('沒有任何 POI 符合時應該回傳空陣列', () => {
    expect(filterPOIsByDecorTypes(TAIPEI_POIS, ['zoo'])).toEqual([]);
  });

  it('重複的 decorType 不應該造成重複結果', () => {
    expect(filterPOIsByDecorTypes(TAIPEI_POIS, ['park', 'park'])).toHaveLength(1);
  });

  it('不認得的 decorType 應該被忽略而不是報錯', () => {
    const filtered = filterPOIsByDecorTypes(TAIPEI_POIS, ['park', 'not-a-real-type']);
    expect(filtered.map(p => p.id)).toEqual(['node-3']);
  });
});

describe('queryPOIs', () => {
  it('應該同時套用 bounds 與 decorTypes', () => {
    // 台北車站(station) 與 二二八公園(park) 在範圍內，再挑 park。
    const result = queryPOIs(TAIPEI_POIS, BOUNDS, ['park']);
    expect(result.map(p => p.id)).toEqual(['node-3']);
  });

  it('decorTypes 為空時應該只套用 bounds', () => {
    const result = queryPOIs(TAIPEI_POIS, BOUNDS, []);
    expect(result.map(p => p.id)).toEqual(['node-1', 'node-3']);
  });

  it('bounds 內沒東西時，decorTypes 再怎麼寬也應該是空的', () => {
    const result = queryPOIs(
      TAIPEI_POIS,
      { north: 24.0, south: 23.9, east: 121.0, west: 120.9 },
      ['park', 'station'],
    );
    expect(result).toEqual([]);
  });

  it('結果應該等同於手動依序呼叫兩個過濾函式', () => {
    const manual = filterPOIsByDecorTypes(
      filterPOIsInBounds(TAIPEI_POIS, BOUNDS),
      ['park', 'station'],
    );
    expect(queryPOIs(TAIPEI_POIS, BOUNDS, ['park', 'station'])).toEqual(manual);
  });
});

describe('getRegion / getAvailableRegions', () => {
  it('應該查得到已定義的區域', () => {
    expect(getRegion('taipei')?.id).toBe('taipei');
  });

  it('查不到時應該回傳 undefined', () => {
    expect(getRegion('atlantis')).toBeUndefined();
  });

  it('getAvailableRegions 應該列出 REGIONS 的所有 key', () => {
    expect(getAvailableRegions().sort()).toEqual(Object.keys(REGIONS).sort());
  });

  it('每個列出的區域都應該真的查得到', () => {
    getAvailableRegions().forEach(id => {
      expect(getRegion(id)).toBeTruthy();
    });
  });

  it('每個區域的 bbox 都應該是合法的（north > south、east > west）', () => {
    getAvailableRegions().forEach(id => {
      const { bbox } = getRegion(id)!;
      expect(bbox.north).toBeGreaterThan(bbox.south);
      expect(bbox.east).toBeGreaterThan(bbox.west);
    });
  });
});

describe('isWithinRegion', () => {
  const taipei = REGIONS.taipei!;

  it('台北車站座標應該在台北市內', () => {
    expect(isWithinRegion(25.0478, 121.5170, taipei)).toBe(true);
  });

  it('桃園座標不應該在台北市內', () => {
    expect(isWithinRegion(24.9936, 121.3010, taipei)).toBe(false);
  });

  it('剛好在邊界上應該算在區域內', () => {
    const { bbox } = taipei;
    expect(isWithinRegion(bbox.south, bbox.west, taipei)).toBe(true);
    expect(isWithinRegion(bbox.north, bbox.east, taipei)).toBe(true);
  });

  it('超出邊界一點點就不應該在區域內', () => {
    const { bbox } = taipei;
    expect(isWithinRegion(bbox.south - 0.0001, bbox.west, taipei)).toBe(false);
    expect(isWithinRegion(bbox.north + 0.0001, bbox.east, taipei)).toBe(false);
  });

  it('緯度對但經度錯不應該算在內（確認是 AND 不是 OR）', () => {
    const { bbox } = taipei;
    expect(isWithinRegion(bbox.south + 0.01, bbox.east + 10, taipei)).toBe(false);
  });

  it('test_park 應該完整落在 taipei 範圍內（子區域關係）', () => {
    const park = REGIONS.test_park!;
    expect(isWithinRegion(park.bbox.north, park.bbox.east, taipei)).toBe(true);
    expect(isWithinRegion(park.bbox.south, park.bbox.west, taipei)).toBe(true);
  });
});

describe('bboxIntersectsRegion', () => {
  const taipei = REGIONS.taipei!;

  it('重疊的 bbox 應該回傳 true', () => {
    expect(bboxIntersectsRegion(
      { north: 25.05, south: 25.03, east: 121.52, west: 121.50 },
      taipei,
    )).toBe(true);
  });

  it('完全不重疊的 bbox 應該回傳 false', () => {
    expect(bboxIntersectsRegion(
      { north: 25.0, south: 24.9, east: 121.3, west: 121.2 },
      taipei,
    )).toBe(false);
  });

  it('完全包住整個區域的 bbox 應該回傳 true', () => {
    expect(bboxIntersectsRegion(
      { north: 90, south: -90, east: 180, west: -180 },
      taipei,
    )).toBe(true);
  });

  it('只在邊界相接（共邊）應該算作有交集', () => {
    const { bbox } = taipei;
    expect(bboxIntersectsRegion(
      { north: bbox.south, south: bbox.south - 1, east: bbox.east, west: bbox.west },
      taipei,
    )).toBe(true);
  });

  it('只差一點點就不相接時應該回傳 false', () => {
    const { bbox } = taipei;
    expect(bboxIntersectsRegion(
      { north: bbox.south - 0.0001, south: bbox.south - 1, east: bbox.east, west: bbox.west },
      taipei,
    )).toBe(false);
  });

  it('四個方向各自錯開時都應該回傳 false', () => {
    const { bbox } = taipei;
    const gap = 1;

    expect(bboxIntersectsRegion(
      { north: bbox.north + gap + 1, south: bbox.north + gap, east: bbox.east, west: bbox.west },
      taipei,
    )).toBe(false);

    expect(bboxIntersectsRegion(
      { north: bbox.south - gap, south: bbox.south - gap - 1, east: bbox.east, west: bbox.west },
      taipei,
    )).toBe(false);

    expect(bboxIntersectsRegion(
      { north: bbox.north, south: bbox.south, east: bbox.west - gap, west: bbox.west - gap - 1 },
      taipei,
    )).toBe(false);

    expect(bboxIntersectsRegion(
      { north: bbox.north, south: bbox.south, east: bbox.east + gap + 1, west: bbox.east + gap },
      taipei,
    )).toBe(false);
  });

  it('一個區域自己的 bbox 一定與自己有交集', () => {
    getAvailableRegions().forEach(id => {
      const region = getRegion(id)!;
      expect(bboxIntersectsRegion(region.bbox, region)).toBe(true);
    });
  });
});
