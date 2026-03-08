/**
 * 區域 OSM 資料抓取腳本
 * 
 * 使用方式：
 *   npx tsx scripts/osm-fetcher/fetch-region-osm.ts --region taipei
 * 
 * 設計特點：
 * - 通用設計，支援任意區域（透過 regions.ts 定義）
 * - 分區查詢避免 Overpass API 超時
 * - 遵守 API 使用規範（請求間隔）
 * - 自動去重
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, getRegion } from './regions.js';
import type { BoundingBox, POIData, RegionPOIFile, OverpassResponse, OverpassElement } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============ Decor Rules（與 useDecorRules.ts 保持同步）============
const DECOR_RULES = [
  { id: 'restaurant', name: '餐廳', icon: '🍽️', tags: ['amenity=restaurant'] },
  { id: 'cafe', name: '咖啡廳', icon: '☕', tags: ['amenity=cafe'] },
  { id: 'sweetshop', name: '甜點店', icon: '🍰', tags: ['shop=pastry', 'shop=confectionery', 'shop=chocolate'] },
  { id: 'bakery', name: '麵包店', icon: '🥐', tags: ['shop=bakery'] },
  { id: 'burger', name: '漢堡店', icon: '🍔', tags: ['amenity=fast_food'] },
  { id: 'italian', name: '義式餐廳', icon: '🍕', tags: ['cuisine=pizza', 'cuisine=italian', 'cuisine=mediterranean', 'cuisine=pasta'] },
  { id: 'ramen', name: '拉麵店', icon: '🥡', tags: ['cuisine=ramen', 'cuisine=noodle', 'cuisine=chinese', 'cuisine=udon', 'cuisine=soba'] },
  { id: 'sushi', name: '壽司店', icon: '🍣', tags: ['cuisine=sushi'] },
  { id: 'curry', name: '咖哩餐廳', icon: '🍛', tags: ['cuisine=curry', 'cuisine=indian', 'cuisine=sri_lankan'] },
  { id: 'korean', name: '韓式餐廳', icon: '🇰🇷', tags: ['cuisine=korean'] },
  { id: 'taco', name: '墨西哥餐廳', icon: '🌮', tags: ['cuisine=mexican'] },
  { id: 'convenience', name: '便利商店', icon: '🏪', tags: ['shop=convenience'] },
  { id: 'supermarket', name: '超市', icon: '🛒', tags: ['shop=supermarket', 'shop=greengrocer'] },
  { id: 'cosmetics', name: '化妝品商店', icon: '💄', tags: ['shop=department_store', 'shop=cosmetics', 'shop=beauty'] },
  { id: 'clothing', name: '服飾店', icon: '👔', tags: ['shop=clothes', 'shop=shoes', 'shop=fashion'] },
  { id: 'electronics', name: '電器行', icon: '🔌', tags: ['shop=appliance', 'shop=electronics', 'shop=computer', 'shop=mobile_phone'] },
  { id: 'hardware', name: '五金行', icon: '🔧', tags: ['shop=doityourself', 'shop=hardware', 'shop=tools'] },
  { id: 'library', name: '圖書館／書店', icon: '📚', tags: ['amenity=library', 'shop=books'] },
  { id: 'pharmacy', name: '藥局', icon: '💊', tags: ['amenity=pharmacy', 'shop=chemist', 'healthcare=pharmacy'] },
  { id: 'hair_salon', name: '美髮院', icon: '💇', tags: ['shop=hairdresser'] },
  { id: 'laundry', name: '自主洗衣店&乾洗店', icon: '🧺', tags: ['shop=laundry', 'shop=dry_cleaning'] },
  { id: 'post_office', name: '郵局', icon: '✉️', tags: ['amenity=post_office', 'amenity=post_box'] },
  { id: 'hotel', name: '飯店', icon: '🏨', tags: ['tourism=hotel', 'tourism=motel', 'tourism=hostel', 'tourism=guest_house'] },
  { id: 'university', name: '大學&學院', icon: '🎓', tags: ['amenity=university', 'amenity=college', 'building=university'] },
  { id: 'station', name: '車站', icon: '🚂', tags: ['railway=station', 'building=train_station', 'railway=subway_entrance', 'public_transport=station'] },
  { id: 'bus_stop', name: '公車站', icon: '🚌', tags: ['highway=bus_stop', 'amenity=bus_station', 'public_transport=platform'] },
  { id: 'airport', name: '機場', icon: '✈️', tags: ['aeroway=aerodrome', 'aeroway=terminal', 'aeroway=gate'] },
  { id: 'bridge', name: '橋樑', icon: '🌉', tags: ['bridge=yes', 'man_made=bridge'] },
  { id: 'park', name: '公園', icon: '🍀', tags: ['leisure=park', 'leisure=garden', 'leisure=playground', 'landuse=village_green'] },
  { id: 'forest', name: '森林', icon: '🌲', tags: ['natural=wood', 'landuse=forest'] },
  { id: 'waterside', name: '水邊', icon: '🌊', tags: ['natural=water', 'natural=wetland', 'waterway=river', 'waterway=stream', 'waterway=canal'] },
  { id: 'beach', name: '海邊', icon: '🏖️', tags: ['natural=beach'] },
  { id: 'mountain', name: '山丘', icon: '⛰️', tags: ['natural=peak', 'natural=cliff', 'natural=bare_rock'] },
  { id: 'zoo', name: '動物園', icon: '🦁', tags: ['tourism=zoo', 'tourism=aquarium'] },
  { id: 'theme_park', name: '主題樂園', icon: '🎢', tags: ['tourism=theme_park', 'leisure=water_park'] },
  { id: 'art_gallery', name: '美術館', icon: '🎨', tags: ['tourism=museum', 'tourism=gallery', 'shop=art', 'amenity=arts_centre'] },
  { id: 'stadium', name: '體育館', icon: '🏟️', tags: ['leisure=stadium', 'leisure=sports_centre', 'building=stadium'] },
  { id: 'movie_theater', name: '電影院', icon: '🎬', tags: ['amenity=cinema'] },
  { id: 'shrine', name: '神社', icon: '⛩️', tags: ['amenity=place_of_worship'] },
];

// ============ API 設定 ============
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const REQUEST_DELAY_MS = 10000; // 每次請求間隔 10 秒（可用 CLI 覆寫）
const MAX_RETRIES = 3;

// ============ 工具函數 ============

/**
 * 將區域分割成網格
 */
function splitBboxToGrid(bbox: BoundingBox, gridSize: number): BoundingBox[] {
  const { north, south, east, west } = bbox;
  const latStep = (north - south) / gridSize;
  const lonStep = (east - west) / gridSize;
  const grids: BoundingBox[] = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      grids.push({
        south: south + i * latStep,
        north: south + (i + 1) * latStep,
        west: west + j * lonStep,
        east: west + (j + 1) * lonStep,
      });
    }
  }

  return grids;
}

/**
 * 建立 Overpass QL 查詢（單一 bbox）
 */
function buildOverpassQuery(bbox: BoundingBox): string {
  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const queries: string[] = [];

  for (const rule of DECOR_RULES) {
    for (const tag of rule.tags) {
      const [key, value] = tag.split('=');
      if (key && value) {
        queries.push(`  node["${key}"="${value}"](${bboxStr});`);
        queries.push(`  way["${key}"="${value}"](${bboxStr});`);
      }
    }
  }

  return `
[out:json][timeout:180];
(
${queries.join('\n')}
);
out center geom;
  `.trim();
}

/**
 * 延遲函數
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 取得 CLI 參數值
 */
function getArgValue(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  if (index === -1) return undefined;
  return args[index + 1];
}

// @ts-ignore
import { S2 } from 's2-geometry';

/**
 * 判斷一個點是否在多邊形內部 (Ray-casting algorithm)
 */
function isPointInPolygon(point: {lat: number, lon: number}, polygon: {lat: number, lon: number}[]): boolean {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon, yi = polygon[i].lat;
    const xj = polygon[j].lon, yj = polygon[j].lat;

    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
        (point.lon < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

/**
 * 給定幾何路徑或多邊形，回傳覆蓋到的所有 Level 17 S2 Cell
 */
function getCoveredCellsL17(geometry: {lat: number, lon: number}[]): {lat: number, lon: number, key: string}[] {
  const coveredCells = new Map<string, {lat: number, lon: number, key: string}>();
  
  const addPoint = (lat: number, lon: number) => {
    const key = S2.latLngToKey(lat, lon, 17);
    if (!coveredCells.has(key)) {
      const center = S2.keyToLatLng(key);
      coveredCells.set(key, {lat: center.lat, lon: center.lng, key});
    }
  };

  const isClosed = geometry.length > 2 && 
    geometry[0].lat === geometry[geometry.length - 1].lat && 
    geometry[0].lon === geometry[geometry.length - 1].lon;

  // 如果是封閉多邊形（如公園、機場），找出 BBox 內所有在多邊形內的點
  if (isClosed) {
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    for (const pt of geometry) {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lon < minLon) minLon = pt.lon;
      if (pt.lon > maxLon) maxLon = pt.lon;
    }
    // L17 cell width is roughly ~20 meters ~ 0.0002 degrees
    const STEP = 0.0002;
    for (let lat = minLat; lat <= maxLat + STEP; lat += STEP) {
      for (let lon = minLon; lon <= maxLon + STEP; lon += STEP) {
        if (isPointInPolygon({lat, lon}, geometry)) {
          addPoint(lat, lon);
        }
      }
    }
  } 

  // 無論封閉與否，都處理其邊界（或河流等線性特徵），插入適當間隔的點
  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    addPoint(p1.lat, p1.lon);
    
    // 計算兩點距離（用平面的簡易勾股定理估算）
    const dist = Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lon - p1.lon, 2));
    const STEP = 0.0002;
    if (dist > STEP) {
      const steps = Math.ceil(dist / STEP);
      for (let j = 1; j < steps; j++) {
        const fraction = j / steps;
        addPoint(
          p1.lat + (p2.lat - p1.lat) * fraction,
          p1.lon + (p2.lon - p1.lon) * fraction
        );
      }
    }
  }
  // 加入最後一個點
  addPoint(geometry[geometry.length - 1].lat, geometry[geometry.length - 1].lon);

  return Array.from(coveredCells.values());
}

/**
 * 發送 Overpass API 請求（含重試）
 */
async function fetchOverpass(query: string): Promise<OverpassResponse> {
  let lastError: Error | null = null;

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    for (const server of OVERPASS_SERVERS) {
      try {
        console.log(`  → 嘗試伺服器: ${server} (第 ${retry + 1}/${MAX_RETRIES} 次)`);
        
        const response = await fetch(server, {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' },
        });

        if (response.status === 429) {
          console.log(`    ⚠️ 429 Too Many Requests，等待後重試...`);
          await delay(30000);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json() as OverpassResponse;
      } catch (err) {
        lastError = err as Error;
        console.log(`    ❌ 失敗: ${lastError.message}`);
      }
    }
    
    if (retry < MAX_RETRIES - 1) {
      console.log(`  ⏳ 等待 ${REQUEST_DELAY_MS / 1000} 秒後重試...`);
      await delay(REQUEST_DELAY_MS);
    }
  }

  throw lastError || new Error('所有伺服器都無法連線');
}

/**
 * 轉換 Overpass 回應為 POI 資料
 */
function transformToPOIs(response: OverpassResponse): POIData[] {
  const pois: POIData[] = [];
  const seenIds = new Set<string>();

  for (const element of response.elements) {
    if (!element.tags) continue;

    // 匹配 decor type
    let matchedRule: typeof DECOR_RULES[number] | null = null;

    for (const rule of DECOR_RULES) {
      for (const tag of rule.tags) {
        const [key, value] = tag.split('=');
        if (key && value && element.tags[key] === value) {
          matchedRule = rule;
          break;
        }
      }
      if (matchedRule) break;
    }

    if (!matchedRule) continue;

    const baseId = `${element.type}-${element.id}`;

    // 提取名稱
    const name =
      element.tags.name ||
      element.tags['name:zh'] ||
      element.tags['name:zh-TW'] ||
      element.tags['name:en'] ||
      `未命名${matchedRule.name}`;

    // 如果元素有幾何特徵或是多邊形/線段的邊界點，展開為所有涵蓋到的 S2 L17 Cell
    if (element.geometry && element.geometry.length > 0) {
      const cells = getCoveredCellsL17(element.geometry);
      for (const cell of cells) {
        const id = `${baseId}-${cell.key}`;
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        pois.push({
          id,
          lat: cell.lat,
          lon: cell.lon,
          name,
          decorType: matchedRule.id,
          decorName: matchedRule.name,
          decorIcon: matchedRule.icon,
        });
      }
    } else {
      // 若只有單點 (node)
      let lat: number | undefined;
      let lon: number | undefined;

      if (element.type === 'node') {
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      }

      if (lat === undefined || lon === undefined) continue;
      
      const id = baseId;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      pois.push({
        id,
        lat,
        lon,
        name,
        decorType: matchedRule.id,
        decorName: matchedRule.name,
        decorIcon: matchedRule.icon,
      });
    }
  }

  return pois;
}

/**
 * 檢查座標是否在指定 bbox 內
 */
function isWithinBbox(lat: number, lon: number, bbox: BoundingBox): boolean {
  return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}

/**
 * 彙整後資料校正與驗證
 */
function validateAggregate(pois: POIData[], bbox: BoundingBox) {
  const unique = new Map<string, POIData>();
  let duplicateCount = 0;
  let outOfBoundsCount = 0;
  let invalidCoordCount = 0;

  for (const poi of pois) {
    if (!Number.isFinite(poi.lat) || !Number.isFinite(poi.lon)) {
      invalidCoordCount++;
      continue;
    }

    if (!isWithinBbox(poi.lat, poi.lon, bbox)) {
      outOfBoundsCount++;
      continue;
    }

    if (unique.has(poi.id)) {
      duplicateCount++;
      continue;
    }

    unique.set(poi.id, poi);
  }

  const normalized = Array.from(unique.values()).sort((a, b) => a.id.localeCompare(b.id));

  return {
    pois: normalized,
    duplicateCount,
    outOfBoundsCount,
    invalidCoordCount,
  };
}

// ============ 主程式 ============

async function main() {
  // 解析命令列參數
  const args = process.argv.slice(2);
  const regionId = getArgValue(args, '--region') || 'taipei';
  const gridOverride = Number(getArgValue(args, '--grid'));
  const delayOverride = Number(getArgValue(args, '--delay'));
  const maxSplitDepth = Number(getArgValue(args, '--max-split'));

  const region = getRegion(regionId);
  if (!region) {
    console.error(`❌ 未知區域: ${regionId}`);
    console.log(`可用區域: ${Object.keys(REGIONS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🗺️  開始抓取 ${region.name} (${region.nameEn}) OSM 資料\n`);
  console.log(`📍 邊界框: ${JSON.stringify(region.bbox)}`);

  const gridSize = Number.isFinite(gridOverride) ? gridOverride : (region.gridSize || 4);
  const requestDelayMs = Number.isFinite(delayOverride) ? delayOverride : REQUEST_DELAY_MS;
  const splitDepthLimit = Number.isFinite(maxSplitDepth) ? maxSplitDepth : 2;

  const grids = splitBboxToGrid(region.bbox, gridSize);
  console.log(`📊 初始分成 ${grids.length} 個區塊 (${gridSize}×${gridSize})`);
  console.log(`⏱️  請求間隔: ${requestDelayMs} ms，最大分割深度: ${splitDepthLimit}\n`);

  const allPOIs: POIData[] = [];
  const seenIds = new Set<string>();

  const queue: Array<{ bbox: BoundingBox; depth: number }> = grids.map(bbox => ({ bbox, depth: 0 }));
  let processed = 0;

  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) break;
    const { bbox, depth } = task;
    const total = processed + queue.length + 1;
    processed += 1;

    console.log(`\n[${processed}/${total}] 查詢區塊...`);
    console.log(`  📍 範圍: S${bbox.south.toFixed(4)} N${bbox.north.toFixed(4)} W${bbox.west.toFixed(4)} E${bbox.east.toFixed(4)}`);

    try {
      const query = buildOverpassQuery(bbox);
      const response = await fetchOverpass(query);
      const pois = transformToPOIs(response);

      // 去重
      let newCount = 0;
      for (const poi of pois) {
        if (!seenIds.has(poi.id)) {
          seenIds.add(poi.id);
          allPOIs.push(poi);
          newCount++;
        }
      }

      console.log(`  ✅ 取得 ${pois.length} 個 POI，新增 ${newCount} 個（去重後總計 ${allPOIs.length}）`);
    } catch (err) {
      console.error(`  ❌ 區塊查詢失敗:`, err);
      if (depth < splitDepthLimit) {
        const subGrids = splitBboxToGrid(bbox, 2).map(sub => ({ bbox: sub, depth: depth + 1 }));
        queue.push(...subGrids);
        console.log(`  🔁 已分割為 ${subGrids.length} 個子區塊，加入隊列重試（深度 ${depth + 1}/${splitDepthLimit}）`);
      }
    }

    // 請求間隔
    if (queue.length > 0 && requestDelayMs > 0) {
      console.log(`  ⏳ 等待 ${Math.ceil(requestDelayMs / 1000)} 秒...`);
      await delay(requestDelayMs);
    }
  }

  // 彙整後資料校正（避免跨格重複與越界資料）
  const validation = validateAggregate(allPOIs, region.bbox);
  const validatedPOIs = validation.pois;

  // 輸出結果
  const outputData: RegionPOIFile = {
    version: '1.0.0',
    regionId: region.id,
    regionName: region.name,
    bbox: region.bbox,
    generatedAt: new Date().toISOString(),
    poiCount: validatedPOIs.length,
    pois: validatedPOIs,
  };

  // 確保輸出目錄存在
  const outputDir = join(__dirname, '../../app/data/regions');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, `${region.id}.json`);
  writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(`\n✅ 完成！`);
  console.log(`📁 輸出檔案: ${outputPath}`);
  console.log(`📊 彙整後 POI 數量: ${validatedPOIs.length}`);
  console.log(`🧹 去除重複: ${validation.duplicateCount}`);
  console.log(`🧭 去除越界: ${validation.outOfBoundsCount}`);
  console.log(`⚠️  去除無效座標: ${validation.invalidCoordCount}`);

  // 統計各類型數量
  const typeCounts: Record<string, number> = {};
  for (const poi of validatedPOIs) {
    typeCounts[poi.decorType] = (typeCounts[poi.decorType] || 0) + 1;
  }
  console.log(`\n📊 各類型統計:`);
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes.slice(0, 10)) {
    console.log(`   ${type}: ${count}`);
  }
  if (sortedTypes.length > 10) {
    console.log(`   ... 及其他 ${sortedTypes.length - 10} 種類型`);
  }
}

main().catch(console.error);
