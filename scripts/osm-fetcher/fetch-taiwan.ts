
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { REGIONS } from './regions.js';
import type { OverpassResponse, POIData, BoundingBox } from './types';
const DECOR_RULES = [
  { id: 'restaurant', name: '餐廳', icon: '🍽️', tags: ['amenity=restaurant', 'amenity=food_court'] },
  { id: 'cafe', name: '咖啡廳', icon: '☕', tags: ['amenity=cafe'] },
  { id: 'sweetshop', name: '甜點店', icon: '🍩', tags: ['shop=pastry', 'shop=chocolate', 'shop=confectionery'] },
  { id: 'movie-theater', name: '電影院', icon: '🍿', tags: ['amenity=cinema'] },
  { id: 'pharmacy', name: '藥局', icon: '💊', tags: ['amenity=pharmacy'] },
  { id: 'zoo', name: '動物園', icon: '🦁', tags: ['tourism=zoo'] },
  { id: 'forest', name: '森林', icon: '🌲', tags: ['landuse=forest', 'natural=wood'] },
  { id: 'waterside', name: '水邊', icon: '💧', tags: ['waterway=river', 'waterway=stream', 'natural=water'] },
  { id: 'post-office', name: '郵局', icon: '📮', tags: ['amenity=post_office'] },
  { id: 'art-gallery', name: '美術館', icon: '🖼️', tags: ['tourism=museum', 'tourism=gallery'] },
  { id: 'airport', name: '機場', icon: '✈️', tags: ['aeroway=aerodrome', 'aeroway=terminal'] },
  { id: 'station', name: '車站', icon: '🚉', tags: ['railway=station', 'public_transport=station'] },
  { id: 'beach', name: '海灘', icon: '🏖️', tags: ['natural=beach'] },
  { id: 'burger', name: '漢堡店', icon: '🍔', tags: ['amenity=fast_food'] },
  { id: 'convenience-store', name: '便利商店', icon: '🏪', tags: ['shop=convenience'] },
  { id: 'supermarket', name: '超市', icon: '🛒', tags: ['shop=supermarket'] },
  { id: 'bakery', name: '麵包店', icon: '🥐', tags: ['shop=bakery'] },
  { id: 'hair-salon', name: '美髮院', icon: '✂️', tags: ['shop=hairdresser'] },
  { id: 'clothing-store', name: '服飾店', icon: '👕', tags: ['shop=clothes'] },
  { id: 'park', name: '公園', icon: '🌳', tags: ['leisure=park'] },
  { id: 'library', name: '圖書館', icon: '📚', tags: ['amenity=library'] },
  { id: 'hospital', name: '醫院', icon: '🏥', tags: ['amenity=hospital', 'amenity=clinic'] },
];
// @ts-ignore
import { S2 } from 's2-geometry';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const REQUEST_DELAY_MS = 15000;
const MAX_RETRIES = 5;

interface ChunkData {
  id: string;
  row: number;
  col: number;
  bbox: BoundingBox;
}

function getArgValue(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  if (index === -1) return undefined;
  return args[index + 1];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
[out:json][timeout:300];
(
${queries.join('\n')}
);
out center geom;
  `.trim();
}

async function fetchOverpass(query: string): Promise<OverpassResponse> {
  let lastError: Error | null = null;
  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    for (const server of OVERPASS_SERVERS) {
      try {
        console.log(`  → 伺服器: ${server} (重試 ${retry + 1}/${MAX_RETRIES})`);
        const response = await fetch(server, {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' },
        });

        if (response.status === 429) {
          console.log(`    ⚠️ 429 Too Many Requests，等待 60 秒...`);
          await delay(60000);
          continue;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as OverpassResponse;
      } catch (err) {
        lastError = err as Error;
        console.log(`    ❌ 失敗: ${lastError.message}`);
      }
    }
    
    if (retry < MAX_RETRIES - 1) {
      console.log(`  ⏳ 等待 60 秒後重試所有伺服器...`);
      await delay(60000);
    }
  }

  throw lastError || new Error('所有伺服器連線失敗');
}

/** Point in Polygon Ray-Casting */
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

/** Cover Area geometry by S2 L17 Cells */
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

  if (isClosed) {
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    for (const pt of geometry) {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lon < minLon) minLon = pt.lon;
      if (pt.lon > maxLon) maxLon = pt.lon;
    }
    const STEP = 0.0002;
    for (let lat = minLat; lat <= maxLat + STEP; lat += STEP) {
      for (let lon = minLon; lon <= maxLon + STEP; lon += STEP) {
        if (isPointInPolygon({lat, lon}, geometry)) addPoint(lat, lon);
      }
    }
  } 

  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    addPoint(p1.lat, p1.lon);
    
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
  addPoint(geometry[geometry.length - 1].lat, geometry[geometry.length - 1].lon);
  return Array.from(coveredCells.values());
}

function transformToPOIs(response: OverpassResponse): POIData[] {
  const pois: POIData[] = [];
  const seenIds = new Set<string>();

  for (const element of response.elements) {
    if (!element.tags) continue;

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

    const name =
      element.tags.name ||
      element.tags['name:zh'] ||
      element.tags['name:zh-TW'] ||
      element.tags['name:en'] ||
      `未命名${matchedRule.name}`;

    if (element.geometry && element.geometry.length > 0) {
      const cells = getCoveredCellsL17(element.geometry);
      for (const cell of cells) {
        const id = `${baseId}-${cell.key}`;
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        pois.push({ id, lat: cell.lat, lon: cell.lon, name, decorType: matchedRule.id, decorName: matchedRule.name, decorIcon: matchedRule.icon });
      }
    } else {
      let lat: number | undefined;
      let lon: number | undefined;
      if (element.type === 'node') { lat = element.lat; lon = element.lon; } 
      else if (element.center) { lat = element.center.lat; lon = element.center.lon; }

      if (lat === undefined || lon === undefined) continue;
      
      const id = baseId;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      pois.push({ id, lat, lon, name, decorType: matchedRule.id, decorName: matchedRule.name, decorIcon: matchedRule.icon });
    }
  }
  return pois;
}

async function main() {
  const args = process.argv.slice(2);
  const limit = parseInt(getArgValue(args, '--limit') || '0', 10);
  
  const region = REGIONS.taiwan_main_island;
  const gridSize = 15; // 改為 15x15 = 225 區塊 (塊更大，總次數更少)

  const outputDir = join(__dirname, '../../app/data/regions/taiwan_chunks');
  const progressFile = join(outputDir, 'progress.json');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const { north, south, east, west } = region.bbox;
  const latStep = (north - south) / gridSize;
  const lonStep = (east - west) / gridSize;

  const chunks: ChunkData[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      chunks.push({
        id: `${i}_${j}`,
        row: i,
        col: j,
        bbox: {
          south: south + i * latStep,
          north: south + (i + 1) * latStep,
          west: west + j * lonStep,
          east: west + (j + 1) * lonStep,
        }
      });
    }
  }

  let progress = { completed: [] as string[] };
  if (existsSync(progressFile)) {
    progress = JSON.parse(readFileSync(progressFile, 'utf-8'));
    console.log(`📡 載入進度：已完成 ${progress.completed.length} / ${chunks.length} 區塊`);
  }

  console.log(`🗺️  開始抓取 台灣本島大尺度切片`);
  
  const pendingChunks = chunks.filter(c => !progress.completed.includes(c.id));
  console.log(`📊 剩餘區塊：${pendingChunks.length}\n`);

  let count = 0;
  for (const chunk of pendingChunks) {
    if (limit > 0 && count >= limit) {
      console.log(`⏹️ 達到限制 limit=${limit}，暫停抓取`);
      break;
    }

    console.log(`[處理區塊 ${chunk.id}] R: ${chunk.row}, C: ${chunk.col}`);
    const query = buildOverpassQuery(chunk.bbox);

    try {
      const response = await fetchOverpass(query);
      const pois = transformToPOIs(response);
      
      const chunkFile = join(outputDir, `chunk_${chunk.id}.json`);
      writeFileSync(chunkFile, JSON.stringify({ bbox: chunk.bbox, pois }, null, 2), 'utf-8');
      
      console.log(`  ✅ 取得 ${pois.length} 個 POI（包含擴展）。寫入 ${chunkFile}`);

      progress.completed.push(chunk.id);
      writeFileSync(progressFile, JSON.stringify(progress, null, 2), 'utf-8');

      count++;
      if (count < pendingChunks.length && (limit === 0 || count < limit)) {
        console.log(`  ⏳ 遵守規範，冷卻等待 ${REQUEST_DELAY_MS / 1000} 秒...\n`);
        await delay(REQUEST_DELAY_MS);
      }
    } catch (error) {
       console.error(`  ❌ 區塊 ${chunk.id} 本次嘗試最終失敗: ${error instanceof Error ? error.message : String(error)}`);
       console.log(`⚠️ 跳過此區塊並繼續處理下一個。您可以稍後再次執行腳本來補齊漏網之魚。`);
       continue;
    }
  }

  if (progress.completed.length === chunks.length) {
    console.log(`\n🎉 台灣本島所有區塊皆以抓取完畢！`);
    console.log(`下一步：執行 npx tsx scripts/osm-fetcher/merge-taiwan.ts 將資料合併並裁切至前端目錄！`);
  }
}

main().catch(err => console.error(err));
