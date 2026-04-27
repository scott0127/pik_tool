import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * 這支腳本的目的不是重新查線上 Overpass，
 * 而是驗證「已生成的本地前端資料」是否真的包含高雄巨蛋。
 *
 * 驗證流程：
 * 1. 讀取台灣主島前端索引 index.json
 * 2. 找出包含高雄巨蛋座標的 tile
 * 3. 讀取該 tile 的本地 POI 資料
 * 4. 篩出高雄巨蛋 500 公尺內的 POI，方便人工檢查附近結果
 * 5. 驗證是否存在 name=高雄巨蛋 且 decorType=stadium 的 POI
 *
 * 驗證方法：
 * - 以高雄巨蛋的已知中心點為基準，先透過 tile bbox 定位應該讀哪個前端檔案
 * - 再用名稱 + decorType 雙條件驗證目標 POI 是否落進本地資料
 * - 額外列出 500 公尺內 POI，是為了讓人快速檢視周邊資料是否合理
 *
 * 這樣驗證合理的原因：
 * - 使用者實際讀到的是 public/data/regions/taiwan_main_island 下的前端資料，
 *   因此驗證最終輸出比只驗證中間 chunk 更準確
 * - 高雄巨蛋是這次修正的代表案例，因為它在線上 OSM 中是 relation + leisure=stadium
 * - 若這支腳本通過，代表「relation 有被抓到、已成功轉成 POI、已被合併進前端 tile」
 */
interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface POI {
  id: string;
  lat: number;
  lon: number;
  name: string;
  decorType: string;
  decorName?: string;
}

interface TileIndexEntry {
  id: string;
  bbox: BoundingBox;
  file: string;
  poiCount: number;
}

interface RegionIndex {
  regionId: string;
  regionName: string;
  bbox: BoundingBox;
  tileGridSize: number;
  tiles: TileIndexEntry[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../public/data/regions/taiwan_main_island');
const INDEX_PATH = join(DATA_DIR, 'index.json');
const TARGET = {
  name: '高雄巨蛋',
  lat: 22.6686604,
  lon: 120.3019053,
};

function isWithinBbox(lat: number, lon: number, bbox: BoundingBox) {
  return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function main() {
  if (!existsSync(INDEX_PATH)) {
    throw new Error(`找不到索引檔：${INDEX_PATH}`);
  }

  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8')) as RegionIndex;
  // 先確認高雄巨蛋座標會被前端索引路由到哪個 tile。
  const tile = index.tiles.find((entry) => isWithinBbox(TARGET.lat, TARGET.lon, entry.bbox));

  if (!tile) {
    throw new Error(`找不到包含高雄巨蛋座標的 tile`);
  }

  const tilePath = join(DATA_DIR, 'tiles', tile.file);
  if (!existsSync(tilePath)) {
    throw new Error(`找不到 tile 檔：${tilePath}`);
  }

  const tileData = JSON.parse(readFileSync(tilePath, 'utf-8')) as { bbox: BoundingBox; pois: POI[] };
  // 500 公尺不是判定條件本身，而是用來輸出一個可人工檢查的合理鄰域。
  const nearby = tileData.pois
    .map((poi) => ({
      ...poi,
      distanceMeters: distanceMeters(TARGET.lat, TARGET.lon, poi.lat, poi.lon),
    }))
    .filter((poi) => poi.distanceMeters <= 500)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  // 真正的驗證條件：高雄巨蛋必須以 stadium 類型出現在最終前端資料中。
  const arena = nearby.find((poi) => poi.name === TARGET.name && poi.decorType === 'stadium');

  console.log(`Tile: ${tile.file}`);
  console.log(`Nearby POIs within 500m: ${nearby.length}`);
  console.log(JSON.stringify(nearby.slice(0, 20), null, 2));

  if (!arena) {
    throw new Error('驗證失敗：本地資料中找不到 decorType=stadium 的高雄巨蛋');
  }

  console.log('驗證成功：本地資料已包含高雄巨蛋 stadium POI');
}

main();
