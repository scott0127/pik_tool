/**
 * OSM 抓取器共用型別定義
 * 設計考量：可擴充至任意區域
 */

/** 地理邊界框 */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** 區域定義 */
export interface Region {
  id: string;
  name: string;
  nameEn: string;
  bbox: BoundingBox;
  /** 分區網格大小 (N×N) */
  gridSize?: number;
}

/** POI 資料點 */
export interface POIData {
  id: string;
  lat: number;
  lon: number;
  name: string;
  decorType: string;
  decorName: string;
  decorIcon: string;
  iconUrl?: string;
}

/** 區域 POI 資料檔案格式 */
export interface RegionPOIFile {
  /** 資料版本 */
  version: string;
  /** 區域 ID */
  regionId: string;
  /** 區域名稱 */
  regionName: string;
  /** 邊界框 */
  bbox: BoundingBox;
  /** 生成時間 (ISO 8601) */
  generatedAt: string;
  /** POI 數量 */
  poiCount: number;
  /** POI 資料列表 */
  pois: POIData[];
}

/** Overpass API 回應元素 */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/** Overpass API 回應 */
export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}
