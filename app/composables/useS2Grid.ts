import type { S2CellData, LatLng, S2GridConfig } from '~/types/s2';
import type { MapBounds } from '~/types/map';
// @ts-ignore - s2-geometry doesn't have TypeScript definitions
import { S2 } from 's2-geometry';

/**
 * S2 Grid 系統 - 使用真正的 S2 Geometry
 * 
 * S2 Cell Level 17 約為 66-97 公尺（依緯度而異）
 * Pikmin Bloom 使用 Level 17 作為飾品種類的決定單位
 */
export function useS2Grid() {
  const DEFAULT_CONFIG: S2GridConfig = {
    enabled: false,
    level: 17,
    maxCells: 200,
    minZoom: 0,
  };

  const config = ref<S2GridConfig>({ ...DEFAULT_CONFIG });
  const cells = shallowRef<S2CellData[]>([]);
  const isCalculating = ref(false);

  /**
   * 根據經緯度獲取 S2 Cell ID（Level 17）
   */
  function getCellIdFromLatLng(lat: number, lng: number): string {
    const key = S2.latLngToKey(lat, lng, config.value.level);
    return S2.keyToId(key);
  }

  /**
   * 根據 S2 Cell ID 獲取 4 個頂點座標
   * S2 Cell 在地圖上是不規則四邊形
   */
  function getCellVertices(cellId: string): [LatLng, LatLng, LatLng, LatLng] {
    const key = S2.idToKey(cellId);
    const corners = S2.S2Cell.FromHilbertQuadKey(key).getCornerLatLngs();
    
    // corners 順序：[SW, SE, NE, NW] - 逆時針
    // 我們需要：[SW, NW, NE, SE] - 順時針（for Leaflet polygon）
    return [
      { lat: corners[0].lat, lng: corners[0].lng }, // SW
      { lat: corners[3].lat, lng: corners[3].lng }, // NW
      { lat: corners[2].lat, lng: corners[2].lng }, // NE
      { lat: corners[1].lat, lng: corners[1].lng }, // SE
    ];
  }

  /**
   * 獲取 S2 Cell 的中心點
   */
  function getCellCenter(cellId: string): LatLng {
    const key = S2.idToKey(cellId);
    const latLng = S2.keyToLatLng(key);
    return { lat: latLng.lat, lng: latLng.lng };
  }

  /**
   * 生成覆蓋指定地圖範圍的 S2 網格
   */
  /**
   * 獲取所有相鄰的 Cell ID
   */
  function getNeighborCellIds(cellId: string): string[] {
    const key = S2.idToKey(cellId);
    const neighbors = S2.S2Cell.FromHilbertQuadKey(key).getNeighbors();
    return neighbors.map((n: any) => {
      // getNeighbors returns { face, ij, level }, need to convert back to cell to get key
      const neighborCell = S2.S2Cell.FromFaceIJ(n.face, n.ij, n.level);
      return S2.keyToId(neighborCell.toHilbertQuadkey());
    });
  }

  /**
   * 判斷 Cell 是否與地圖邊界相交
   */
  function isCellIntersectingBounds(cellBounds: [LatLng, LatLng, LatLng, LatLng], mapBounds: MapBounds): boolean {
    const { north, south, east, west } = mapBounds;
    
    // 簡單的 AABB 碰撞檢測 (足以應對大多數情況)
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    cellBounds.forEach(p => {
      minLat = Math.min(minLat, p.lat);
      maxLat = Math.max(maxLat, p.lat);
      minLng = Math.min(minLng, p.lng);
      maxLng = Math.max(maxLng, p.lng);
    });

    return !(minLat > north || maxLat < south || minLng > east || maxLng < west);
  }

  /**
   * 生成覆蓋指定地圖範圍的 S2 網格
   * 使用 BFS 從中心向外擴展，確保連續覆蓋
   */
  function generateGridForBounds(bounds: MapBounds, level: number = 17, mapZoom: number = 17): S2CellData[] {
    isCalculating.value = true;
    const result: S2CellData[] = [];
    const processed = new Set<string>();
    const queue: string[] = [];

    // 動態調整 maxCells 基於縮放層級
    // Zoom 17+: 螢幕範圍小，cell 數量少
    // Zoom 16: 螢幕範圍大，需要更多 cell
    // Zoom 15: 螢幕範圍更大，需要非常多 cell
    let maxLimit = 3000;
    if (mapZoom >= 18) maxLimit = 1500;      // Zoom 18+: 範圍很小，1500 綽綽有餘
    else if (mapZoom === 17) maxLimit = 3500; // Zoom 17: 一般需要 1000-2000，設 3500 確保大螢幕邊角覆蓋
    else if (mapZoom === 16) maxLimit = 7000; // Zoom 16: 範圍是 17 的 4 倍，需要約 5000-7000
    else if (mapZoom <= 15) maxLimit = 10000; // Zoom 15: 範圍極大，設 10000 作為硬上限

    const SAFETY_MAX_CELLS = maxLimit;

    try {
      const { north, south, east, west } = bounds;
      
      // 1. 找到中心點的 Cell 作為種子
      const centerLat = (north + south) / 2;
      const centerLng = (west + east) / 2;
      const seedCellId = getCellIdFromLatLng(centerLat, centerLng);
      
      queue.push(seedCellId);
      processed.add(seedCellId);
      
      console.log(`[S2Grid] Generating grid from seed ${seedCellId} for bounds: ${south.toFixed(5)}N-${north.toFixed(5)}N`);

      // 2. BFS 擴展
      while (queue.length > 0) {
        if (result.length >= SAFETY_MAX_CELLS) break;
        
        const currentId = queue.shift()!;
        const cellVertices = getCellVertices(currentId);
        
        // 檢查是否在視窗內
        if (!isCellIntersectingBounds(cellVertices, bounds)) {
          // 如果不在視窗內，不加入結果，但它的鄰居可能在視窗內，
          // 不過為了避免無限擴展，我們只對 "邊緣" 進行鄰居搜索
          // 這裡簡單處理：只要處理過就不回頭，但如果完全偏離就不加鄰居
          // 更好的做法：如果與 bounds 相交或包含，才加鄰居
          continue; 
        }

        // 加入結果
        result.push({
          cellId: currentId,
          bounds: cellVertices,
          center: getCellCenter(currentId),
          decorTypes: new Set(),
          tags: [],
          poiCount: 0,
          priority: 'none',
        });

        // 查找鄰居
        const neighbors = getNeighborCellIds(currentId);
        for (const neighborId of neighbors) {
          if (!processed.has(neighborId)) {
            processed.add(neighborId);
            
            // 預先檢查鄰居是否可能在範圍內 (優化性能)
            // 這裡直接將鄰居加入隊列，由下一次循環的 intersection check 把關
            queue.push(neighborId);
          }
        }
      }
      
      console.log(`[S2Grid] Generated ${result.length} cells`);
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

    // Generate new cells based on bounds
    const newCellsData = generateGridForBounds(bounds, config.value.level, currentZoom ?? config.value.level);
    
    // Performance Optimization: Smart Diffing
    // We want to reuse existing cell objects if they are still in the view.
    // This prevents Vue from destroying and recreating DOM elements (LPolygon),
    // which caused the "parentNode is null" crash and visual flashing.
    
    if (cells.value.length === 0) {
      cells.value = newCellsData;
      return;
    }

    // Create a map of current cells for O(1) lookup
    // Using a Map is faster than .find() for large arrays
    const currentCellsMap = new Map(cells.value.map(c => [c.cellId, c]));
    
    // Build the new array
    const finalCells: S2CellData[] = newCellsData.map(newCell => {
      // If we already have this cell, reuse the OLD object (preserving Vue identity)
      if (currentCellsMap.has(newCell.cellId)) {
        return currentCellsMap.get(newCell.cellId)!;
      }
      // Otherwise use the new one
      return newCell;
    });

    // Only update if length changed or if we have new cells
    // (In a perfect world we'd check content, but preserving identity is the main goal here)
    cells.value = finalCells;
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
    cells: cells, // Expose mutable ref for direct POI association
    isCalculating: readonly(isCalculating),
    
    // Methods
    updateConfig,
    calculateGrid,
    clearGrid,
    findCellForPoint,
    getCellIdFromLatLng,
    getCellVertices,
    getCellCenter,
    getCellColor,
    getCellStyle,
  };
}
