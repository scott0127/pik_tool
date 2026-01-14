/**
 * Local-First POI 查詢 Composable
 * 
 * 運作流程：
 * 1. 優先使用本地預先抓取的 POI 資料
 * 2. 若查詢範圍超出本地資料涵蓋區域，則 fallback 到 Overpass API
 * 
 * 設計考量：
 * - 可擴充支援多個區域（透過動態載入）
 * - 減少 API 呼叫次數，提升使用體驗
 * - 提供資料來源指示器
 */
import type { DecorRule, MapBounds, POIPoint } from '~/types/map';
import { useOverpassAPI } from '~/composables/useOverpassAPI';

/** 資料來源類型 */
export type POIDataSource = 'local' | 'api' | 'mixed';

/** 查詢結果 */
export interface LocalFirstPOIResult {
  source: POIDataSource;
  points: POIPoint[];
  regionsCovered: string[];
}

/** 區域資料快取 */
interface RegionData {
  regionId: string;
  regionName: string;
  bbox: { north: number; south: number; east: number; west: number };
  pois: Array<{
    id: string;
    lat: number;
    lon: number;
    name: string;
    decorType: string;
    decorName: string;
    decorIcon: string;
    iconUrl?: string;
  }>;
}

/** 支援的區域列表 */
const SUPPORTED_REGIONS = ['taipei'] as const;
type SupportedRegion = typeof SUPPORTED_REGIONS[number];

/** 區域資料快取 */
const regionCache = new Map<SupportedRegion, RegionData | null>();
const loadingPromises = new Map<SupportedRegion, Promise<RegionData | null>>();

/**
 * 動態載入區域資料
 */
async function loadRegionData(regionId: SupportedRegion): Promise<RegionData | null> {
  // 檢查快取
  if (regionCache.has(regionId)) {
    return regionCache.get(regionId)!;
  }

  // 正在載入中，等待完成
  if (loadingPromises.has(regionId)) {
    return loadingPromises.get(regionId)!;
  }

  // 開始載入
  const loadPromise = (async () => {
    try {
      // 動態載入 JSON 檔案
      const data = await import(`~/data/regions/${regionId}.json`);
      const regionData: RegionData = data.default;
      regionCache.set(regionId, regionData);
      console.log(`[LocalFirstPOI] 載入 ${regionData.regionName} 資料成功，共 ${regionData.pois.length} 個 POI`);
      return regionData;
    } catch (err) {
      console.warn(`[LocalFirstPOI] 載入 ${regionId} 資料失敗:`, err);
      regionCache.set(regionId, null);
      return null;
    }
  })();

  loadingPromises.set(regionId, loadPromise);
  return loadPromise;
}

/**
 * 檢查 bounding box 是否與區域有交集
 */
function bboxIntersects(
  queryBbox: MapBounds,
  regionBbox: { north: number; south: number; east: number; west: number }
): boolean {
  return !(
    queryBbox.east < regionBbox.west ||
    queryBbox.west > regionBbox.east ||
    queryBbox.north < regionBbox.south ||
    queryBbox.south > regionBbox.north
  );
}

/**
 * 檢查 bounding box 是否完全包含在區域內
 */
function bboxFullyContained(
  queryBbox: MapBounds,
  regionBbox: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    queryBbox.south >= regionBbox.south &&
    queryBbox.north <= regionBbox.north &&
    queryBbox.west >= regionBbox.west &&
    queryBbox.east <= regionBbox.east
  );
}

/**
 * 從本地資料篩選 POI
 */
function filterLocalPOIs(
  regionData: RegionData,
  bounds: MapBounds,
  selectedRules: DecorRule[]
): POIPoint[] {
  const ruleIds = new Set(selectedRules.map(r => r.id));
  const ruleMap = new Map(selectedRules.map(r => [r.id, r]));

  return regionData.pois
    .filter(poi => {
      // 檢查是否在範圍內
      if (poi.lat < bounds.south || poi.lat > bounds.north) return false;
      if (poi.lon < bounds.west || poi.lon > bounds.east) return false;
      // 檢查是否在選擇的類型內
      return ruleIds.has(poi.decorType);
    })
    .map(poi => {
      const rule = ruleMap.get(poi.decorType);
      return {
        id: poi.id,
        lat: poi.lat,
        lon: poi.lon,
        name: poi.name,
        decorType: poi.decorType,
        decorName: poi.decorName,
        decorIcon: poi.decorIcon,
        iconUrl: rule?.iconUrl || poi.iconUrl,
        tags: {},
      };
    });
}

export function useLocalFirstPOI() {
  const overpassAPI = useOverpassAPI();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dataSource = ref<POIDataSource | null>(null);

  /**
   * 查詢 POI 資料（優先使用本地資料）
   */
  async function fetchPOIs(
    bounds: MapBounds,
    selectedRules: DecorRule[],
    abortSignal?: AbortSignal
  ): Promise<POIPoint[]> {
    if (selectedRules.length === 0) {
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 1. 檢查哪些區域與查詢範圍有交集
      const intersectingRegions: SupportedRegion[] = [];
      let fullyContained = false;

      for (const regionId of SUPPORTED_REGIONS) {
        const regionData = await loadRegionData(regionId);
        if (regionData && bboxIntersects(bounds, regionData.bbox)) {
          intersectingRegions.push(regionId);
          if (bboxFullyContained(bounds, regionData.bbox)) {
            fullyContained = true;
          }
        }
      }

      // 2. 如果查詢範圍完全在某個區域內，直接使用本地資料
      if (fullyContained && intersectingRegions.length > 0) {
        const regionId = intersectingRegions[0];
        const regionData = regionCache.get(regionId);
        
        if (regionData) {
          const localPoints = filterLocalPOIs(regionData, bounds, selectedRules);
          dataSource.value = 'local';
          console.log(`[LocalFirstPOI] 使用本地 ${regionData.regionName} 資料，找到 ${localPoints.length} 個 POI`);
          return localPoints;
        }
      }

      // 3. 部分交集或無本地資料，fallback 到 API
      console.log(`[LocalFirstPOI] Fallback 到 Overpass API`);
      dataSource.value = 'api';
      return await overpassAPI.fetchPOIs(bounds, selectedRules, abortSignal);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      const message = err instanceof Error ? err.message : '未知錯誤';
      error.value = message;
      console.error('[LocalFirstPOI] 查詢失敗:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 預先載入所有區域資料
   */
  async function preloadAllRegions(): Promise<void> {
    console.log('[LocalFirstPOI] 預先載入所有區域資料...');
    await Promise.all(SUPPORTED_REGIONS.map(loadRegionData));
    console.log('[LocalFirstPOI] 預載完成');
  }

  /**
   * 取得目前支援的區域列表
   */
  function getSupportedRegions(): string[] {
    return [...SUPPORTED_REGIONS];
  }

  return {
    fetchPOIs,
    preloadAllRegions,
    getSupportedRegions,
    isLoading: readonly(isLoading),
    error: readonly(error),
    dataSource: readonly(dataSource),
  };
}
