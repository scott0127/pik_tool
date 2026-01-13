import type { S2CellData, LatLng, S2GridConfig } from '~/types/s2';
import type { MapBounds } from '~/types/map';

/**
 * S2 Grid 系統 - 簡化穩定版
 * 
 * 使用整數索引系統，避免浮點數精度問題
 */
export function useS2Grid() {
  const DEFAULT_CONFIG: S2GridConfig = {
    enabled: false,
    level: 17,
    maxCells: 200,
    minZoom: 14, // 允許在較低縮放級別顯示網格
  };

  const config = ref<S2GridConfig>({ ...DEFAULT_CONFIG });
  const cells = shallowRef<S2CellData[]>([]);
  const isCalculating = ref(false);
  
  // Cell size in degrees (L17 約 66 公尺)
  const CELL_SIZE = 0.0006;

  /**
   * 將經緯度轉換為整數 Cell 索引
   */
  function latLngToCellIndex(coord: number): number {
    return Math.floor(coord / CELL_SIZE);
  }
  
  /**
   * 將 Cell 索引轉換回經緯度
   */
  function cellIndexToLatLng(index: number): number {
    return index * CELL_SIZE;
  }
  
  /**
   * 根據經緯度計算 Cell ID
   */
  function getCellIdFromLatLng(lat: number, lng: number): string {
    const latIndex = latLngToCellIndex(lat);
    const lngIndex = latLngToCellIndex(lng);
    return `L17_${latIndex}_${lngIndex}`;
  }

  /**
   * 生成覆蓋指定地圖範圍的網格
   */
  function generateGridForBounds(bounds: MapBounds, level: number = 17): S2CellData[] {
    isCalculating.value = true;
    const result: S2CellData[] = [];
    const cellSet = new Set<string>();

    try {
      const { north, south, east, west } = bounds;
      
      // 計算起始和結束的 Cell 索引
      const startLatIndex = latLngToCellIndex(south);
      const endLatIndex = latLngToCellIndex(north) + 1;
      const startLngIndex = latLngToCellIndex(west);
      const endLngIndex = latLngToCellIndex(east) + 1;
      
      const totalCells = (endLatIndex - startLatIndex) * (endLngIndex - startLngIndex);
      
      console.log(`[S2Grid] Bounds: ${south.toFixed(5)}°N to ${north.toFixed(5)}°N, ${west.toFixed(5)}°E to ${east.toFixed(5)}°E`);
      console.log(`[S2Grid] Cell indices: Lat[${startLatIndex} to ${endLatIndex}], Lng[${startLngIndex} to ${endLngIndex}]`);
      console.log(`[S2Grid] Total cells: ${totalCells} (limit: ${config.value.maxCells})`);
      
      // 如果超過限制，提示用戶縮放
      if (totalCells > config.value.maxCells) {
        console.warn(`[S2Grid] Too many cells (${totalCells}), skipping generation. Please zoom in.`);
        return [];
      }
      
      // 遍歷 Cell 索引生成網格
      for (let latIndex = startLatIndex; latIndex < endLatIndex; latIndex++) {
        for (let lngIndex = startLngIndex; lngIndex < endLngIndex; lngIndex++) {
          const cellId = `L17_${latIndex}_${lngIndex}`;
          
          // 避免重複
          if (cellSet.has(cellId)) continue;
          cellSet.add(cellId);
          
          // 計算 Cell 邊界
          const minLat = cellIndexToLatLng(latIndex);
          const maxLat = cellIndexToLatLng(latIndex + 1);
          const minLng = cellIndexToLatLng(lngIndex);
          const maxLng = cellIndexToLatLng(lngIndex + 1);
          
          const cellCorners: [LatLng, LatLng, LatLng, LatLng] = [
            { lat: minLat, lng: minLng }, // SW
            { lat: maxLat, lng: minLng }, // NW  
            { lat: maxLat, lng: maxLng }, // NE
            { lat: minLat, lng: maxLng }, // SE
          ];
          
          const cellData: S2CellData = {
            cellId,
            bounds: cellCorners,
            center: {
              lat: (minLat + maxLat) / 2,
              lng: (minLng + maxLng) / 2,
            },
            decorTypes: new Set(),
            tags: [],
            poiCount: 0,
            priority: 'none',
          };
          
          result.push(cellData);
          
          // 檢查是否達到限制
          if (result.length >= config.value.maxCells) {
            console.warn(`[S2Grid] Reached max cells limit (${config.value.maxCells})`);
            return result;
          }
        }
      }
      
      console.log(`[S2Grid] Generated ${result.length} cells successfully`);
      return result;
    } catch (err) {
      console.error('[S2Grid] Error generating grid:', err);
      return [];
    } finally {
      isCalculating.value = false;
    }
  }

  /**
   * 根據經緯度查找所屬的 Cell
   */
  function findCellForPoint(lat: number, lng: number): S2CellData | null {
    const targetCellId = getCellIdFromLatLng(lat, lng);
    return cells.value.find(cell => cell.cellId === targetCellId) || null;
  }

  /**
   * 更新網格配置
   */
  function updateConfig(newConfig: Partial<S2GridConfig>) {
    config.value = { ...config.value, ...newConfig };
  }

  /**
   * 清空網格
   */
  function clearGrid() {
    cells.value = [];
  }

  /**
   * 計算並設置網格（包含縮放級別檢查）
   */
  function calculateGrid(bounds: MapBounds, currentZoom?: number) {
    if (!config.value.enabled) {
      cells.value = [];
      return;
    }
    
    // 檢查縮放級別
    if (currentZoom !== undefined && currentZoom < config.value.minZoom) {
      console.log(`[S2Grid] Zoom ${currentZoom} < minZoom ${config.value.minZoom}, skipping grid generation`);
      cells.value = [];
      return;
    }

    const newCells = generateGridForBounds(bounds, config.value.level);
    cells.value = newCells;
  }

  /**
   * 根據網格優先級獲取顏色
   */
  function getCellColor(cell: S2CellData): string {
    const typeCount = cell.decorTypes.size;

    if (typeCount === 0) return '#9CA3AF'; // 灰色 - 路邊/無標籤
    if (typeCount === 1) return '#10B981'; // 綠色 - 單一類型（最佳）
    if (typeCount <= 3) return '#F59E0B'; // 黃色 - 中等混雜
    return '#EF4444';                      // 紅色 - 高度混雜
  }

  /**
   * 獲取網格樣式
   */
  function getCellStyle(cell: S2CellData) {
    const color = getCellColor(cell);
    return {
      strokeColor: color,
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: color,
      fillOpacity: 0.15,
    };
  }

  return {
    config: readonly(config),
    cells: readonly(cells),
    isCalculating: readonly(isCalculating),
    
    // Methods
    updateConfig,
    calculateGrid,
    clearGrid,
    findCellForPoint,
    getCellIdFromLatLng,
    getCellColor,
    getCellStyle,
  };
}
