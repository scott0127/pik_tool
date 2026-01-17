export interface DecorRule {
  id: string;
  name: string;
  icon: string;
  iconUrl?: string; // 選填：自訂圖標 URL（若提供則優先顯示）
  tags: string[]; // 格式: "key=value"
  region?: 'JP' | 'TW'; // Optional: Restrict rule to specific region
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface POIPoint {
  id: string;
  lat: number;
  lon: number;
  name: string;
  decorType: string;
  decorName: string;
  decorIcon: string;
   iconUrl?: string;
  tags: Record<string, string>;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string]; // south, north, west, east
  type: string;
  importance: number;
}
