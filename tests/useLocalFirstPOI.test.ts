/**
 * useLocalFirstPOI 單元測試
 * TDD: 先寫測試，再實作功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模擬區域資料
const mockTaipeiData = {
  version: '1.0.0',
  regionId: 'taipei',
  regionName: '台北市',
  bbox: {
    north: 25.2104,
    south: 24.9607,
    east: 121.6655,
    west: 121.4570,
  },
  generatedAt: '2026-01-14T00:00:00Z',
  poiCount: 3,
  pois: [
    { id: 'node-1', lat: 25.0478, lon: 121.5170, name: '台北車站', decorType: 'station', decorName: '車站', decorIcon: '🚂' },
    { id: 'node-2', lat: 25.0330, lon: 121.5654, name: '信義威秀', decorType: 'movie_theater', decorName: '電影院', decorIcon: '🎬' },
    { id: 'node-3', lat: 25.0423, lon: 121.5077, name: '二二八公園', decorType: 'park', decorName: '公園', decorIcon: '🍀' },
  ],
};

// 模擬 fetch 函數
vi.mock('~/data/regions/taipei.json', () => ({
  default: mockTaipeiData,
}));

describe('LocalFirstPOI Helper Functions', () => {
  describe('isWithinRegion', () => {
    it('should return true for coordinates inside Taipei', async () => {
      const { isWithinRegion, REGIONS } = await import('../scripts/osm-fetcher/regions');
      const taipei = REGIONS.taipei;
      
      // 台北車站座標
      expect(isWithinRegion(25.0478, 121.5170, taipei)).toBe(true);
    });

    it('should return false for coordinates outside Taipei', async () => {
      const { isWithinRegion, REGIONS } = await import('../scripts/osm-fetcher/regions');
      const taipei = REGIONS.taipei;
      
      // 桃園座標
      expect(isWithinRegion(24.9936, 121.3010, taipei)).toBe(false);
    });
  });

  describe('bboxIntersectsRegion', () => {
    it('should return true when query bbox overlaps with Taipei', async () => {
      const { bboxIntersectsRegion, REGIONS } = await import('../scripts/osm-fetcher/regions');
      const taipei = REGIONS.taipei;
      
      const queryBbox = {
        north: 25.05,
        south: 25.03,
        east: 121.52,
        west: 121.50,
      };
      
      expect(bboxIntersectsRegion(queryBbox, taipei)).toBe(true);
    });

    it('should return false when query bbox does not overlap with Taipei', async () => {
      const { bboxIntersectsRegion, REGIONS } = await import('../scripts/osm-fetcher/regions');
      const taipei = REGIONS.taipei;
      
      // 完全在桃園的 bbox
      const queryBbox = {
        north: 25.0,
        south: 24.9,
        east: 121.3,
        west: 121.2,
      };
      
      expect(bboxIntersectsRegion(queryBbox, taipei)).toBe(false);
    });
  });
});

describe('POI Spatial Query', () => {
  describe('filterPOIsInBounds', () => {
    it('should filter POIs within the given bounds', async () => {
      const { filterPOIsInBounds } = await import('../scripts/osm-fetcher/spatial');
      
      const bounds = {
        north: 25.05,
        south: 25.03,
        east: 121.52,
        west: 121.50,
      };
      
      const filtered = filterPOIsInBounds(mockTaipeiData.pois, bounds);
      
      // 台北車站 (25.0478, 121.5170) 和二二八公園 (25.0423, 121.5077) 都在範圍內
      expect(filtered.length).toBe(2);
      expect(filtered.map(p => p.name)).toContain('台北車站');
      expect(filtered.map(p => p.name)).toContain('二二八公園');
    });

    it('should return empty array when no POIs in bounds', async () => {
      const { filterPOIsInBounds } = await import('../scripts/osm-fetcher/spatial');
      
      const bounds = {
        north: 24.0,
        south: 23.9,
        east: 121.0,
        west: 120.9,
      };
      
      const filtered = filterPOIsInBounds(mockTaipeiData.pois, bounds);
      expect(filtered.length).toBe(0);
    });
  });

  describe('filterPOIsByDecorTypes', () => {
    it('should filter POIs by decor type', async () => {
      const { filterPOIsByDecorTypes } = await import('../scripts/osm-fetcher/spatial');
      
      const filtered = filterPOIsByDecorTypes(mockTaipeiData.pois, ['station', 'park']);
      
      expect(filtered.length).toBe(2);
      expect(filtered.map(p => p.decorType)).toContain('station');
      expect(filtered.map(p => p.decorType)).toContain('park');
    });
  });
});
