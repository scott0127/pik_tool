/**
 * 區域定義檔
 * 集中管理所有支援的縣市 bounding box
 * 
 * 擴充方式：新增縣市只需在 REGIONS 中加入新條目
 */
import type { Region } from './types';

/**
 * 支援的區域定義
 * 
 * 台北市 bbox 來源：OpenStreetMap nominatim
 * 驗證方式：https://www.openstreetmap.org/search?query=taipei
 */
export const REGIONS: Record<string, Region> = {
  taipei: {
    id: 'taipei',
    name: '台北市',
    nameEn: 'Taipei City',
    bbox: {
      north: 25.2104,
      south: 24.9607,
      east: 121.6655,
      west: 121.4570,
    },
    gridSize: 4, // 4×4 = 16 區塊
  },

  taiwan_main_island: {
    id: 'taiwan_main_island',
    name: '台灣本島',
    nameEn: 'Taiwan Main Island',
    bbox: {
      north: 25.3000,
      south: 21.7500,
      east: 122.1000,
      west: 120.0000,
    },
    gridSize: 12, // 12×12 = 144 區塊（避免單次查詢過大）
  },

  // === 預留區域（未來擴充） ===
  // newtaipei: {
  //   id: 'newtaipei',
  //   name: '新北市',
  //   nameEn: 'New Taipei City',
  //   bbox: {
  //     north: 25.3004,
  //     south: 24.6742,
  //     east: 122.0122,
  //     west: 121.2830,
  //   },
  //   gridSize: 6, // 較大區域需要更細的分區
  // },
  
  // taoyuan: {
  //   id: 'taoyuan',
  //   name: '桃園市',
  //   nameEn: 'Taoyuan City',
  //   bbox: {
  //     north: 25.1214,
  //     south: 24.7367,
  //     east: 121.4178,
  //     west: 120.9869,
  //   },
  //   gridSize: 5,
  // },
};

/**
 * 取得區域定義
 */
export function getRegion(regionId: string): Region | undefined {
  return REGIONS[regionId];
}

/**
 * 取得所有可用區域 ID
 */
export function getAvailableRegions(): string[] {
  return Object.keys(REGIONS);
}

/**
 * 檢查座標是否在指定區域內
 */
export function isWithinRegion(lat: number, lon: number, region: Region): boolean {
  const { bbox } = region;
  return (
    lat >= bbox.south &&
    lat <= bbox.north &&
    lon >= bbox.west &&
    lon <= bbox.east
  );
}

/**
 * 檢查 bounding box 是否與指定區域有交集
 */
export function bboxIntersectsRegion(
  queryBbox: { north: number; south: number; east: number; west: number },
  region: Region
): boolean {
  const { bbox } = region;
  return !(
    queryBbox.east < bbox.west ||
    queryBbox.west > bbox.east ||
    queryBbox.north < bbox.south ||
    queryBbox.south > bbox.north
  );
}
