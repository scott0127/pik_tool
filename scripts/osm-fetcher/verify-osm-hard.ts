import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Hard verification for generated Taiwan main-island OSM frontend data.
 *
 * Goal:
 * - Verify final frontend output, not intermediate parser chunks.
 * - Catch common LLM/parser mistakes:
 *   1. relation/way POIs not converted into frontend POIs
 *   2. tile routing by wrong lat/lon order
 *   3. bbox boundary bugs
 *   4. index poiCount mismatch
 *   5. invalid coordinates
 *   6. duplicated POI IDs across tiles
 *   7. wrong decorType mapping
 *   8. suspicious empty names/types
 *
 * Usage:
 *   npx tsx scripts/osm-fetcher/verify-osm-hard.ts
 *
 * Optional:
 *   DATA_DIR=public/data/regions/taiwan_main_island npx tsx scripts/osm-fetcher/verify-osm-hard.ts
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
  [key: string]: unknown;
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

type Severity = 'error' | 'warn';

type ExpectedPOI = {
  label: string;
  names: string[];
  lat: number;
  lon: number;
  radiusMeters: number;
  allowedDecorTypes?: string[];
  requiredDecorType?: string;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR
  ? join(process.cwd(), process.env.DATA_DIR)
  : join(__dirname, '../../public/data/regions/taiwan_main_island');

const INDEX_PATH = join(DATA_DIR, 'index.json');
const TILE_DIR = join(DATA_DIR, 'tiles');
const EPS = 1e-9;

// These fixtures intentionally mix north/south, node/way/relation-like objects, and different decor types.
// If your decorType taxonomy is different, update only allowedDecorTypes / requiredDecorType, not the coordinates.
const EXPECTED_POIS: ExpectedPOI[] = [
  {
    label: '高雄巨蛋 relation stadium case',
    names: ['高雄巨蛋', 'Kaohsiung Arena'],
    lat: 22.6686604,
    lon: 120.3019053,
    radiusMeters: 500,
    requiredDecorType: 'stadium',
  },
  {
    label: '台北101 landmark/building case',
    names: ['台北101', 'Taipei 101', 'TAIPEI 101'],
    lat: 25.033968,
    lon: 121.564468,
    radiusMeters: 500,
    allowedDecorTypes: ['landmark', 'building', 'attraction', 'tower', 'poi', 'electronics', 'department_store', 'clothing'],
  },
  {
    label: '國立故宮博物院 museum case',
    names: ['國立故宮博物院', '故宮博物院', 'National Palace Museum'],
    lat: 25.1023554,
    lon: 121.5484925,
    radiusMeters: 700,
    allowedDecorTypes: ['museum', 'attraction', 'landmark', 'poi', 'art_gallery'],
  },
  {
    label: '臺中公園 park case',
    names: ['臺中公園', '台中公園', 'Taichung Park'],
    lat: 24.14483,
    lon: 120.68390,
    radiusMeters: 700,
    allowedDecorTypes: ['park', 'garden', 'attraction', 'poi'],
  },
  {
    label: '奇美博物館 museum south-west case',
    names: ['奇美博物館', 'Chimei Museum', 'CHIMEI Museum'],
    lat: 22.934734,
    lon: 120.226875,
    radiusMeters: 700,
    allowedDecorTypes: ['museum', 'attraction', 'landmark', 'poi', 'art_gallery'],
  },
  {
    label: '花蓮車站 transport/east coast case',
    names: ['花蓮車站', '花蓮火車站', 'Hualien Station'],
    lat: 23.99285,
    lon: 121.60165,
    radiusMeters: 700,
    allowedDecorTypes: ['station', 'transport', 'railway', 'poi'],
  },
];

function fail(message: string): never {
  throw new Error(message);
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isValidBbox(bbox: BoundingBox): boolean {
  return (
    asNumber(bbox.north) !== null &&
    asNumber(bbox.south) !== null &&
    asNumber(bbox.east) !== null &&
    asNumber(bbox.west) !== null &&
    bbox.south <= bbox.north &&
    bbox.west <= bbox.east &&
    bbox.south >= -90 &&
    bbox.north <= 90 &&
    bbox.west >= -180 &&
    bbox.east <= 180
  );
}

function isWithinBbox(lat: number, lon: number, bbox: BoundingBox, eps = EPS): boolean {
  return (
    lat >= bbox.south - eps &&
    lat <= bbox.north + eps &&
    lon >= bbox.west - eps &&
    lon <= bbox.east + eps
  );
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s・．.。()（）\-_/]/g, '')
    .replace(/臺/g, '台')
    .trim();
}

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    fail(`JSON 讀取/解析失敗：${path}\n${reason}`);
  }
}

function report(issueMap: Record<Severity, string[]>, severity: Severity, message: string) {
  issueMap[severity].push(message);
}

function findTileByCoordinate(index: RegionIndex, lat: number, lon: number): TileIndexEntry | null {
  return index.tiles.find((tile) => isWithinBbox(lat, lon, tile.bbox)) ?? null;
}

function main() {
  const issues: Record<Severity, string[]> = { error: [], warn: [] };

  if (!existsSync(INDEX_PATH)) fail(`找不到 index.json：${INDEX_PATH}`);
  if (!existsSync(TILE_DIR)) fail(`找不到 tiles 目錄：${TILE_DIR}`);

  const index = readJson<RegionIndex>(INDEX_PATH);

  console.log('============================================================');
  console.log('Hard OSM frontend data verification');
  console.log(`DATA_DIR: ${DATA_DIR}`);
  console.log(`Region: ${index.regionId} / ${index.regionName}`);
  console.log(`Tiles in index: ${index.tiles?.length ?? 0}`);
  console.log('============================================================');

  if (!index.regionId) report(issues, 'error', 'index.regionId 是空的');
  if (!index.regionName) report(issues, 'warn', 'index.regionName 是空的');
  if (!isValidBbox(index.bbox)) report(issues, 'error', 'index.bbox 不合法');
  if (!Number.isInteger(index.tileGridSize) || index.tileGridSize <= 0) {
    report(issues, 'error', `index.tileGridSize 不合法：${index.tileGridSize}`);
  }
  if (!Array.isArray(index.tiles) || index.tiles.length === 0) {
    report(issues, 'error', 'index.tiles 是空的或不是陣列');
  }

  const tileFilesOnDisk = new Set(readdirSync(TILE_DIR).filter((name) => name.endsWith('.json')));
  const tileFilesInIndex = new Set<string>();
  const poiIdToTile = new Map<string, string>();
  const allPois: Array<POI & { tileFile: string }> = [];
  let totalPoiCountFromIndex = 0;
  let totalPoiCountFromFiles = 0;

  for (const tile of index.tiles) {
    if (!tile.id) report(issues, 'error', `有 tile.id 是空的：${JSON.stringify(tile)}`);
    if (!tile.file) report(issues, 'error', `tile ${tile.id} 的 file 是空的`);
    if (!isValidBbox(tile.bbox)) report(issues, 'error', `tile ${tile.id} bbox 不合法`);
    if (!Number.isInteger(tile.poiCount) || tile.poiCount < 0) {
      report(issues, 'error', `tile ${tile.id} poiCount 不合法：${tile.poiCount}`);
    }

    totalPoiCountFromIndex += Number.isFinite(tile.poiCount) ? tile.poiCount : 0;
    tileFilesInIndex.add(tile.file);

    const tilePath = join(TILE_DIR, tile.file);
    if (!existsSync(tilePath)) {
      report(issues, 'error', `index 指到不存在的 tile 檔：${tile.file}`);
      continue;
    }

    const tileData = readJson<{ bbox?: BoundingBox; pois?: POI[] }>(tilePath);
    if (!Array.isArray(tileData.pois)) {
      report(issues, 'error', `tile ${tile.file} 的 pois 不是陣列`);
      continue;
    }

    totalPoiCountFromFiles += tileData.pois.length;

    if (tileData.pois.length !== tile.poiCount) {
      report(
        issues,
        'error',
        `poiCount 不一致：${tile.file} index=${tile.poiCount}, file=${tileData.pois.length}`,
      );
    }

    if (tileData.bbox && isValidBbox(tileData.bbox)) {
      const sameBbox =
        Math.abs(tileData.bbox.north - tile.bbox.north) < 1e-9 &&
        Math.abs(tileData.bbox.south - tile.bbox.south) < 1e-9 &&
        Math.abs(tileData.bbox.east - tile.bbox.east) < 1e-9 &&
        Math.abs(tileData.bbox.west - tile.bbox.west) < 1e-9;
      if (!sameBbox) report(issues, 'warn', `tile bbox 與 index bbox 不完全一致：${tile.file}`);
    }

    for (const poi of tileData.pois) {
      const lat = asNumber(poi.lat);
      const lon = asNumber(poi.lon);

      if (!poi.id || typeof poi.id !== 'string') {
        report(issues, 'error', `POI id 不合法 in ${tile.file}: ${JSON.stringify(poi).slice(0, 200)}`);
        continue;
      }
      if (poiIdToTile.has(poi.id)) {
        report(issues, 'warn', `重複 POI id：${poi.id} in ${poiIdToTile.get(poi.id)} and ${tile.file}`);
      } else {
        poiIdToTile.set(poi.id, tile.file);
      }

      if (lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        report(issues, 'error', `POI 座標不合法：${poi.id} in ${tile.file}, lat=${poi.lat}, lon=${poi.lon}`);
        continue;
      }

      if (!isWithinBbox(lat, lon, index.bbox, 1e-7)) {
        report(issues, 'error', `POI 超出 region bbox：${poi.id} ${poi.name} (${lat}, ${lon}) in ${tile.file}`);
      }

      if (!isWithinBbox(lat, lon, tile.bbox, 1e-7)) {
        report(issues, 'error', `POI 被放進錯誤 tile：${poi.id} ${poi.name} (${lat}, ${lon}) in ${tile.file}`);
      }

      if (typeof poi.name !== 'string' || poi.name.trim().length === 0) {
        report(issues, 'warn', `POI name 是空的：${poi.id} in ${tile.file}`);
      }

      if (typeof poi.decorType !== 'string' || poi.decorType.trim().length === 0) {
        report(issues, 'error', `POI decorType 是空的：${poi.id} ${poi.name} in ${tile.file}`);
      }

      allPois.push({ ...poi, tileFile: tile.file });
    }
  }

  for (const file of tileFilesOnDisk) {
    if (!tileFilesInIndex.has(file)) {
      const path = join(TILE_DIR, file);
      const size = statSync(path).size;
      report(issues, size > 2 ? 'warn' : 'error', `tiles 目錄有未被 index 引用的 tile：${file}`);
    }
  }

  if (totalPoiCountFromIndex !== totalPoiCountFromFiles) {
    report(
      issues,
      'error',
      `總 POI 數不一致：index=${totalPoiCountFromIndex}, files=${totalPoiCountFromFiles}`,
    );
  }

  console.log(`Total POIs by index: ${totalPoiCountFromIndex}`);
  console.log(`Total POIs by files: ${totalPoiCountFromFiles}`);
  console.log(`Unique POI ids: ${poiIdToTile.size}`);

  console.log('============================================================');
  console.log('Fixture checks');
  console.log('============================================================');

  for (const fixture of EXPECTED_POIS) {
    const expectedTile = findTileByCoordinate(index, fixture.lat, fixture.lon);
    if (!expectedTile) {
      report(issues, 'error', `[${fixture.label}] 找不到包含 fixture 座標的 tile`);
      continue;
    }

    const normalizedNames = fixture.names.map(normalizeName);
    const candidates = allPois
      .map((poi) => ({
        ...poi,
        distanceMeters: distanceMeters(fixture.lat, fixture.lon, poi.lat, poi.lon),
      }))
      .filter((poi) => poi.distanceMeters <= fixture.radiusMeters)
      .filter((poi) => normalizedNames.some((name) => normalizeName(poi.name).includes(name) || name.includes(normalizeName(poi.name))))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const best = candidates[0];

    console.log(`\n[${fixture.label}]`);
    console.log(`Expected tile: ${expectedTile.file}`);
    console.log(`Candidates: ${candidates.length}`);
    if (best) {
      console.log(
        `Best: ${best.name} / ${best.decorType} / ${Math.round(best.distanceMeters)}m / ${best.tileFile} / ${best.id}`,
      );
    }

    if (!best) {
      report(
        issues,
        'error',
        `[${fixture.label}] ${fixture.radiusMeters}m 內找不到名稱匹配的 POI。names=${fixture.names.join('|')}`,
      );
      continue;
    }

    if (best.tileFile !== expectedTile.file) {
      report(
        issues,
        'error',
        `[${fixture.label}] POI tile 路由錯誤：expected=${expectedTile.file}, actual=${best.tileFile}`,
      );
    }

    if (fixture.requiredDecorType && best.decorType !== fixture.requiredDecorType) {
      report(
        issues,
        'error',
        `[${fixture.label}] decorType 錯誤：expected=${fixture.requiredDecorType}, actual=${best.decorType}`,
      );
    }

    if (
      fixture.allowedDecorTypes &&
      !fixture.allowedDecorTypes.includes(best.decorType)
    ) {
      report(
        issues,
        'warn',
        `[${fixture.label}] decorType 可疑：actual=${best.decorType}, allowed=${fixture.allowedDecorTypes.join('|')}`,
      );
    }
  }

  console.log('\n============================================================');
  console.log('Issues');
  console.log('============================================================');

  if (issues.warn.length) {
    console.log(`\nWarnings (${issues.warn.length}):`);
    for (const message of issues.warn.slice(0, 100)) console.log(`  ⚠️  ${message}`);
    if (issues.warn.length > 100) console.log(`  ... and ${issues.warn.length - 100} more warnings`);
  }

  if (issues.error.length) {
    console.log(`\nErrors (${issues.error.length}):`);
    for (const message of issues.error.slice(0, 100)) console.log(`  ❌ ${message}`);
    if (issues.error.length > 100) console.log(`  ... and ${issues.error.length - 100} more errors`);
    throw new Error(`Hard verification failed with ${issues.error.length} error(s)`);
  }

  console.log('\n✅ Hard verification passed');
}

main();
