// @vitest-environment nuxt
/**
 * useDecorRules 與 useS2Grid。
 * s2-geometry 是純函式且結果固定，直接用真的，不 mock。
 */
import { describe, it, expect } from 'vitest';
import { useDecorRules, decorRules } from '~/composables/useDecorRules';
import { useS2Grid } from '~/composables/useS2Grid';

const TAIPEI_STATION = { lat: 25.0478, lng: 121.5170 };

describe('useDecorRules', () => {
  const { getDecorRule, getAllCategories } = useDecorRules();

  it('規則 id 不應重複', () => {
    const ids = decorRules.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // 路邊貼紙與天氣飾品不是 OSM 地物，本來就沒有 tag
  const TAGLESS_RULES = new Set(['roadside', 'weather_rain', 'weather_snow']);

  it('每條規則都要有 id / name / icon', () => {
    decorRules.forEach(rule => {
      expect(rule.id.length).toBeGreaterThan(0);
      expect(rule.name.length).toBeGreaterThan(0);
      expect(rule.icon.length).toBeGreaterThan(0);
      expect(Array.isArray(rule.tags)).toBe(true);
    });
  });

  it('沒有 tag 的規則只有已知那幾個（其餘都要能對到 OSM）', () => {
    const tagless = decorRules.filter(r => r.tags.length === 0).map(r => r.id);
    expect(new Set(tagless)).toEqual(TAGLESS_RULES);
  });

  it('tags 一律是 key=value 格式', () => {
    decorRules.forEach(rule => {
      rule.tags.forEach(tag => {
        expect(tag).toMatch(/^[a-zA-Z_:]+=[^=]+$/);
      });
    });
  });

  it('getDecorRule 查得到既有規則', () => {
    const first = decorRules[0]!;
    expect(getDecorRule(first.id)).toEqual(first);
  });

  it('getDecorRule 查不到時回 undefined', () => {
    expect(getDecorRule('not-a-real-rule')).toBeUndefined();
  });

  it('getAllCategories 就是完整的規則表', () => {
    expect(getAllCategories()).toEqual(decorRules);
  });

  it('region 只會是已知值', () => {
    decorRules.forEach(rule => {
      if (rule.region) expect(['JP', 'TW']).toContain(rule.region);
    });
  });

  // 同一組 tag 對到兩條規則時，比對順序決定結果，等於有一條永遠選不到
  it('不應該有兩條規則搶同一個 tag', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];

    decorRules.forEach(rule => {
      rule.tags.forEach(tag => {
        if (seen.has(tag)) clashes.push(`${tag}: ${seen.get(tag)} vs ${rule.id}`);
        else seen.set(tag, rule.id);
      });
    });

    expect(clashes).toEqual([]);
  });
});

describe('useS2Grid — 距離計算', () => {
  const { calculateDistance } = useS2Grid();

  it('同一點距離為 0', () => {
    expect(calculateDistance(25, 121, 25, 121)).toBe(0);
  });

  it('距離是對稱的', () => {
    const a = calculateDistance(25.0, 121.0, 25.1, 121.1);
    const b = calculateDistance(25.1, 121.1, 25.0, 121.0);
    expect(a).toBeCloseTo(b, 6);
  });

  it('緯度差 1 度約 111 公里', () => {
    const d = calculateDistance(25, 121, 26, 121);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it('距離永遠非負', () => {
    expect(calculateDistance(-33.8, 151.2, 51.5, -0.12)).toBeGreaterThan(0);
  });

  it('越遠的點距離越大', () => {
    const near = calculateDistance(25.0, 121.0, 25.001, 121.0);
    const far = calculateDistance(25.0, 121.0, 25.01, 121.0);
    expect(far).toBeGreaterThan(near);
  });
});

describe('useS2Grid — cell 查詢', () => {
  const { getCellIdFromLatLng, getCellCenter, getCellVertices } = useS2Grid();

  it('同一座標永遠得到同一個 cell id', () => {
    const a = getCellIdFromLatLng(TAIPEI_STATION.lat, TAIPEI_STATION.lng);
    const b = getCellIdFromLatLng(TAIPEI_STATION.lat, TAIPEI_STATION.lng);
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it('相距很遠的座標會落在不同 cell', () => {
    expect(getCellIdFromLatLng(25.0478, 121.5170))
      .not.toBe(getCellIdFromLatLng(35.6812, 139.7671));
  });

  it('cell 中心點會落回同一個 cell', () => {
    const id = getCellIdFromLatLng(TAIPEI_STATION.lat, TAIPEI_STATION.lng);
    const center = getCellCenter(id);
    expect(getCellIdFromLatLng(center.lat, center.lng)).toBe(id);
  });

  it('cell 中心點應該離原座標很近', () => {
    const id = getCellIdFromLatLng(TAIPEI_STATION.lat, TAIPEI_STATION.lng);
    const center = getCellCenter(id);
    expect(Math.abs(center.lat - TAIPEI_STATION.lat)).toBeLessThan(0.01);
    expect(Math.abs(center.lng - TAIPEI_STATION.lng)).toBeLessThan(0.01);
  });

  it('getCellVertices 回四個角，且圍住中心點', () => {
    const id = getCellIdFromLatLng(TAIPEI_STATION.lat, TAIPEI_STATION.lng);
    const corners = getCellVertices(id);
    const center = getCellCenter(id);

    expect(corners).toHaveLength(4);
    const lats = corners.map(c => c.lat);
    const lngs = corners.map(c => c.lng);
    expect(Math.min(...lats)).toBeLessThanOrEqual(center.lat);
    expect(Math.max(...lats)).toBeGreaterThanOrEqual(center.lat);
    expect(Math.min(...lngs)).toBeLessThanOrEqual(center.lng);
    expect(Math.max(...lngs)).toBeGreaterThanOrEqual(center.lng);
  });
});

describe('useS2Grid — 網格生成', () => {
  const bounds = { north: 25.05, south: 25.04, east: 121.52, west: 121.51 };

  it('calculateGrid 會產生涵蓋範圍的 cells', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);

    expect(grid.cells.value.length).toBeGreaterThan(0);
    grid.cells.value.forEach(cell => {
      expect(cell.cellId.length).toBeGreaterThan(0);
      expect(cell.center).toBeTruthy();
    });
  });

  it('產生出來的 cell id 不重複', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);

    const ids = grid.cells.value.map(c => c.cellId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('範圍越大 cell 越多', () => {
    const small = useS2Grid();
    small.updateConfig({ enabled: true });
    
    small.calculateGrid({ north: 25.042, south: 25.041, east: 121.512, west: 121.511 }, 17);

    const large = useS2Grid();
    large.updateConfig({ enabled: true });
    
    large.calculateGrid({ north: 25.06, south: 25.03, east: 121.53, west: 121.50 }, 17);

    expect(large.cells.value.length).toBeGreaterThan(small.cells.value.length);
  });

  it('clearGrid 會清空', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);
    expect(grid.cells.value.length).toBeGreaterThan(0);

    grid.clearGrid();
    expect(grid.cells.value).toEqual([]);
  });

  it('findCellForPoint 找得到範圍內的點所屬 cell', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);

    const found = grid.findCellForPoint(25.045, 121.515);
    expect(found?.cellId).toBe(grid.getCellIdFromLatLng(25.045, 121.515));
  });

  it('findCellForPoint 對範圍外的點回 falsy', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);
    expect(grid.findCellForPoint(0, 0)).toBeFalsy();
  });

  it('calculateGrid 之後 isCalculating 會回到 false', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);
    expect(grid.isCalculating.value).toBe(false);
  });
});

describe('useS2Grid — 雷達預測', () => {
  const bounds = { north: 25.05, south: 25.04, east: 121.52, west: 121.51 };

  it('半徑 0 時不應該偵測到任何東西', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);
    expect(grid.calculateRadarPrediction(25.045, 121.515, 0).size).toBe(0);
  });

  it('半徑越大，偵測到的種類不會變少', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    grid.calculateGrid(bounds, 17);

    const small = grid.calculateRadarPrediction(25.045, 121.515, 50).size;
    const big = grid.calculateRadarPrediction(25.045, 121.515, 500).size;
    expect(big).toBeGreaterThanOrEqual(small);
  });

  it('沒有網格時回空集合', () => {
    const grid = useS2Grid();
    grid.updateConfig({ enabled: true });
    expect(grid.calculateRadarPrediction(25.045, 121.515, 100).size).toBe(0);
  });
});

describe('useS2Grid — 樣式', () => {
  const { getCellStyle } = useS2Grid();
  const cell = { id: 'x', center: TAIPEI_STATION, decorTypes: [] } as any;

  it('stroke 與 fill 用同一個顏色', () => {
    const style = getCellStyle(cell);
    expect(style.strokeColor).toBe(style.fillColor);
  });

  it('fillOpacity 應該比 strokeOpacity 低（格線要看得見）', () => {
    const style = getCellStyle(cell);
    expect(style.fillOpacity).toBeLessThan(style.strokeOpacity);
  });
});
