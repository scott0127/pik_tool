import type { LatLng as LeafletLatLng } from 'leaflet';

/**
 * S2 Cell 數據結構
 */
export interface S2CellData {
  cellId: string;                           // S2 Cell ID (Level 17)
  bounds: [LatLng, LatLng, LatLng, LatLng]; // 4個頂點座標 (順時針)
  center: LatLng;                           // 中心點座標
  decorTypes: Set<string>;                  // 關聯的飾品類型 IDs
  tags: string[];                           // 原始 OSM 標籤
  poiCount: number;                         // POI 數量
  priority: 'high' | 'medium' | 'low' | 'none'; // 優先級
}

/**
 * 座標接口（兼容 Leaflet）
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * S2 網格配置
 */
export interface S2GridConfig {
  enabled: boolean;          // 是否啟用網格顯示
  level: number;             // S2 Cell Level (預設 17)
  maxCells: number;          // 最大渲染網格數量
  minZoom: number;           // 最小縮放等級才顯示網格
}

/**
 * 網格樣式配置
 */
export interface GridStyle {
  strokeColor: string;       // 邊框顏色
  strokeWeight: number;      // 邊框寬度
  strokeOpacity: number;     // 邊框透明度
  fillColor: string;         // 填充顏色
  fillOpacity: number;       // 填充透明度
}

/**
 * 雷達配置
 */
export interface RadarConfig {
  center: LatLng;            // 雷達中心點
  radius: number;            // 半徑（公尺）
  enabled: boolean;          // 是否啟用
}

/**
 * 雷達預測結果
 */
export interface RadarPrediction {
  decorTypes: Array<{
    id: string;
    name: string;
    icon: string;
    cellCount: number;       // 該類型出現的網格數量
  }>;
  totalCells: number;        // 雷達範圍內的總網格數
  confidence: number;        // 信心度 (0-1)
  recommendation: string;    // 推薦建議
}
