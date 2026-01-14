/**
 * 空間查詢工具函數
 * 提供 POI 資料的空間過濾功能
 */
import type { POIData, BoundingBox } from './types';

/**
 * 過濾在指定 bounding box 內的 POI
 */
export function filterPOIsInBounds(pois: POIData[], bounds: BoundingBox): POIData[] {
  return pois.filter(poi => 
    poi.lat >= bounds.south &&
    poi.lat <= bounds.north &&
    poi.lon >= bounds.west &&
    poi.lon <= bounds.east
  );
}

/**
 * 根據裝飾類型過濾 POI
 */
export function filterPOIsByDecorTypes(pois: POIData[], decorTypes: string[]): POIData[] {
  if (decorTypes.length === 0) return pois;
  const typeSet = new Set(decorTypes);
  return pois.filter(poi => typeSet.has(poi.decorType));
}

/**
 * 組合過濾：同時依據 bounds 和 decorTypes 過濾
 */
export function queryPOIs(
  pois: POIData[],
  bounds: BoundingBox,
  decorTypes: string[]
): POIData[] {
  let result = filterPOIsInBounds(pois, bounds);
  if (decorTypes.length > 0) {
    result = filterPOIsByDecorTypes(result, decorTypes);
  }
  return result;
}
