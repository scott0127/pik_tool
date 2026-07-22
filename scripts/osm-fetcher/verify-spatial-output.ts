import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { BoundingBox, CompressedFeature } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGION_ID = process.env.OSM_REGION_ID || 'taiwan_main_island';
const OUTPUT_DIR = process.env.OSM_OUTPUT_DIR
  || join(__dirname, `../../public/data/regions/${REGION_ID}`);
const EPSILON = 1e-10;

interface TileIndexEntry {
  id: string;
  bbox: BoundingBox;
  file: string;
  poiCount: number;
}

interface RegionIndex {
  version?: string;
  regionId: string;
  bbox: BoundingBox;
  tileGridSize: number;
  tiles: TileIndexEntry[];
  source?: unknown;
}

interface TileFile {
  bbox: BoundingBox;
  features?: CompressedFeature[];
}

interface SingleIndex {
  regionId: string;
  level: number;
  totalCellCount: number;
  types: Array<{
    decorType: string;
    cellCount: number;
    file: string;
  }>;
}

interface EncodedCells {
  decorType?: string;
  cellCount?: number;
  encoding?: string;
  base?: string;
  deltas?: Array<number | string>;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

function isFiniteBbox(bbox: BoundingBox): boolean {
  return (
    Number.isFinite(bbox.north)
    && Number.isFinite(bbox.south)
    && Number.isFinite(bbox.east)
    && Number.isFinite(bbox.west)
    && bbox.north > bbox.south
    && bbox.east > bbox.west
  );
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= EPSILON;
}

function bboxEquals(left: BoundingBox, right: BoundingBox): boolean {
  return (
    nearlyEqual(left.north, right.north)
    && nearlyEqual(left.south, right.south)
    && nearlyEqual(left.east, right.east)
    && nearlyEqual(left.west, right.west)
  );
}

function expectedTileBbox(
  regionBbox: BoundingBox,
  gridSize: number,
  row: number,
  col: number,
): BoundingBox {
  const latStep = (regionBbox.north - regionBbox.south) / gridSize;
  const lonStep = (regionBbox.east - regionBbox.west) / gridSize;
  return {
    south: regionBbox.south + row * latStep,
    north: regionBbox.south + (row + 1) * latStep,
    west: regionBbox.west + col * lonStep,
    east: regionBbox.west + (col + 1) * lonStep,
  };
}

function expectedTileId(
  lat: number,
  lon: number,
  regionBbox: BoundingBox,
  gridSize: number,
): string | null {
  if (
    lat < regionBbox.south
    || lat > regionBbox.north
    || lon < regionBbox.west
    || lon > regionBbox.east
  ) {
    return null;
  }

  const latStep = (regionBbox.north - regionBbox.south) / gridSize;
  const lonStep = (regionBbox.east - regionBbox.west) / gridSize;
  const row = Math.min(
    gridSize - 1,
    Math.max(0, Math.floor((lat - regionBbox.south) / latStep)),
  );
  const col = Math.min(
    gridSize - 1,
    Math.max(0, Math.floor((lon - regionBbox.west) / lonStep)),
  );
  return `r${row}_c${col}`;
}

function parseLosslessInteger(value: number | string, label: string): bigint {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`${label} 使用不安全的 JSON number: ${value}`);
    }
    return BigInt(value);
  }
  if (!/^-?\d+$/.test(value)) {
    throw new Error(`${label} 不是有效整數字串: ${value}`);
  }
  return BigInt(value);
}

function decodeCells(data: EncodedCells, file: string): string[] {
  if (data.encoding !== 'delta' || !data.base || !Array.isArray(data.deltas)) {
    throw new Error(`${file} 不是完成的 delta 編碼檔`);
  }

  let current = parseLosslessInteger(data.base, `${file} base`);
  return data.deltas.map((delta, index) => {
    current += parseLosslessInteger(delta, `${file} delta[${index}]`);
    return current.toString();
  });
}

function main() {
  const indexPath = join(OUTPUT_DIR, 'index.json');
  const mergeStatsPath = join(OUTPUT_DIR, 'merge-stats.json');
  const singleIndexPath = join(OUTPUT_DIR, 'single', 'index.json');
  if (!existsSync(indexPath)) throw new Error(`找不到區域索引: ${indexPath}`);
  if (!existsSync(mergeStatsPath)) throw new Error(`找不到合併統計: ${mergeStatsPath}`);
  if (!existsSync(singleIndexPath)) throw new Error(`找不到純種分割索引: ${singleIndexPath}`);

  const index = readJson<RegionIndex>(indexPath);
  const mergeStats = readJson<{
    version?: string;
    regionId?: string;
    frontendGrid?: number;
    s2Level?: number;
    totalWrittenToTiles?: number;
    poiCountByType?: Record<string, number>;
    source?: unknown;
  }>(mergeStatsPath);
  const failures: string[] = [];

  if (!index.version?.startsWith('3.')) {
    failures.push(`index.json 版本必須為 3.x，目前是 ${index.version || 'missing'}`);
  }
  if (!mergeStats.version?.startsWith('3.')) {
    failures.push(`merge-stats.json 版本必須為 3.x，目前是 ${mergeStats.version || 'missing'}`);
  }
  if (!index.source || !mergeStats.source) {
    failures.push('缺少 PBF/parser 來源追蹤資訊');
  } else if (JSON.stringify(index.source) !== JSON.stringify(mergeStats.source)) {
    failures.push('index.json 與 merge-stats.json 的來源追蹤資訊不一致');
  }
  if (mergeStats.regionId !== index.regionId) {
    failures.push(
      `合併統計區域不一致: index=${index.regionId}, stats=${mergeStats.regionId || 'missing'}`,
    );
  }
  if (mergeStats.frontendGrid !== index.tileGridSize) {
    failures.push(
      `合併統計 grid 不一致: index=${index.tileGridSize}, stats=${mergeStats.frontendGrid}`,
    );
  }
  if (!isFiniteBbox(index.bbox)) {
    failures.push('區域 bbox 無效');
  }
  if (!Number.isInteger(index.tileGridSize) || index.tileGridSize <= 0) {
    failures.push(`tileGridSize 無效: ${index.tileGridSize}`);
  }

  const expectedTileCount = index.tileGridSize ** 2;
  if (index.tiles.length !== expectedTileCount) {
    failures.push(`tile 數量錯誤: expected=${expectedTileCount}, actual=${index.tiles.length}`);
  }

  let tileFeatureCount = 0;
  let pointCount = 0;
  let wrongTilePointCount = 0;
  let duplicateFeaturePointCount = 0;
  const seenTileIds = new Set<string>();
  const seenTileFiles = new Set<string>();
  const seenFeaturePoints = new Set<string>();
  const pointCountByType: Record<string, number> = {};

  for (const tile of index.tiles) {
    if (seenTileIds.has(tile.id)) {
      failures.push(`重複 tile id: ${tile.id}`);
      continue;
    }
    seenTileIds.add(tile.id);
    if (seenTileFiles.has(tile.file)) {
      failures.push(`多個 tile 共用同一檔案: ${tile.file}`);
      continue;
    }
    seenTileFiles.add(tile.file);

    const match = /^r(\d+)_c(\d+)$/.exec(tile.id);
    if (!match) {
      failures.push(`tile id 格式錯誤: ${tile.id}`);
      continue;
    }
    const row = Number(match[1]);
    const col = Number(match[2]);
    if (
      row < 0
      || row >= index.tileGridSize
      || col < 0
      || col >= index.tileGridSize
    ) {
      failures.push(`tile id 超出 grid: ${tile.id}`);
      continue;
    }

    const expectedBbox = expectedTileBbox(index.bbox, index.tileGridSize, row, col);
    if (!bboxEquals(tile.bbox, expectedBbox)) {
      failures.push(`tile bbox 有缺口或重疊: ${tile.id}`);
    }

    const tilePath = join(OUTPUT_DIR, 'tiles', tile.file);
    if (!existsSync(tilePath)) {
      failures.push(`索引指向不存在的 tile: ${tile.file}`);
      continue;
    }

    const tileData = readJson<TileFile>(tilePath);
    if (!bboxEquals(tileData.bbox, tile.bbox)) {
      failures.push(`tile 檔與索引 bbox 不一致: ${tile.id}`);
    }

    const features = tileData.features || [];
    tileFeatureCount += features.length;
    if (features.length !== tile.poiCount) {
      failures.push(`tile poiCount 不一致: ${tile.id}`);
    }

    for (const feature of features) {
      if (!Array.isArray(feature.pts) || feature.pts.length === 0) {
        failures.push(`空 feature: ${tile.id}/${feature.id}`);
        continue;
      }

      for (const point of feature.pts) {
        const lat = point[0];
        const lon = point[1];
        pointCount++;
        pointCountByType[feature.t] = (pointCountByType[feature.t] || 0) + 1;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          wrongTilePointCount++;
          continue;
        }
        if (expectedTileId(lat, lon, index.bbox, index.tileGridSize) !== tile.id) {
          wrongTilePointCount++;
        }

        const pointKey = `${feature.id}|${lat}|${lon}`;
        if (seenFeaturePoints.has(pointKey)) {
          duplicateFeaturePointCount++;
        } else {
          seenFeaturePoints.add(pointKey);
        }
      }
    }
  }

  if (tileFeatureCount !== mergeStats.totalWrittenToTiles) {
    failures.push(
      `合併統計與 tile feature 數不一致: stats=${mergeStats.totalWrittenToTiles}, actual=${tileFeatureCount}`,
    );
  }
  if (wrongTilePointCount > 0) {
    failures.push(`${wrongTilePointCount} 個點落在錯誤 tile 或區域外`);
  }
  if (duplicateFeaturePointCount > 0) {
    failures.push(`${duplicateFeaturePointCount} 個 feature point 在分割後重複`);
  }
  const countTypes = new Set([
    ...Object.keys(pointCountByType),
    ...Object.keys(mergeStats.poiCountByType || {}),
  ]);
  for (const decorType of countTypes) {
    const actual = pointCountByType[decorType] || 0;
    const recorded = mergeStats.poiCountByType?.[decorType] || 0;
    if (actual !== recorded) {
      failures.push(
        `分類點數不一致: ${decorType}, stats=${recorded}, actual=${actual}`,
      );
    }
  }

  const singleIndex = readJson<SingleIndex>(singleIndexPath);
  const seenCellTypes = new Map<string, string>();
  const indexedSingleFiles = new Set((singleIndex.types || []).map(entry => entry.file));
  let decodedCellCount = 0;
  let crossTypeDuplicateCount = 0;

  if (singleIndex.regionId !== index.regionId) {
    failures.push(
      `純種索引區域不一致: region=${index.regionId}, single=${singleIndex.regionId}`,
    );
  }
  if (!Number.isInteger(singleIndex.level) || singleIndex.level <= 0) {
    failures.push(`純種索引 S2 level 無效: ${singleIndex.level}`);
  } else if (singleIndex.level !== mergeStats.s2Level) {
    failures.push(
      `純種索引 S2 level 不一致: single=${singleIndex.level}, stats=${mergeStats.s2Level}`,
    );
  }

  const staleSingleFiles = readdirSync(join(OUTPUT_DIR, 'single'))
    .filter(file => file.endsWith('.json') && file !== 'index.json')
    .filter(file => !indexedSingleFiles.has(file));
  if (staleSingleFiles.length > 0) {
    failures.push(`純種分割目錄含未列入索引的舊檔: ${staleSingleFiles.join(', ')}`);
  }

  for (const typeEntry of singleIndex.types || []) {
    const typePath = join(OUTPUT_DIR, 'single', typeEntry.file);
    if (!existsSync(typePath)) {
      failures.push(`純種索引指向不存在的檔案: ${typeEntry.file}`);
      continue;
    }

    try {
      const encoded = readJson<EncodedCells>(typePath);
      const cellIds = decodeCells(encoded, typeEntry.file);
      if (
        encoded.decorType !== typeEntry.decorType
        || encoded.cellCount !== typeEntry.cellCount
        || cellIds.length !== typeEntry.cellCount
      ) {
        failures.push(`純種檔數量或類型不一致: ${typeEntry.file}`);
      }

      const uniqueInFile = new Set(cellIds);
      if (uniqueInFile.size !== cellIds.length) {
        failures.push(`純種檔內含重複 cell: ${typeEntry.file}`);
      }

      for (const cellId of uniqueInFile) {
        const existingType = seenCellTypes.get(cellId);
        if (existingType && existingType !== typeEntry.decorType) {
          crossTypeDuplicateCount++;
        } else {
          seenCellTypes.set(cellId, typeEntry.decorType);
        }
      }
      decodedCellCount += cellIds.length;
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (decodedCellCount !== singleIndex.totalCellCount) {
    failures.push(
      `純種分割總數不一致: index=${singleIndex.totalCellCount}, decoded=${decodedCellCount}`,
    );
  }
  if (crossTypeDuplicateCount > 0) {
    failures.push(`${crossTypeDuplicateCount} 個純種 cell 同時出現在不同分類檔`);
  }

  console.log(JSON.stringify({
    regionId: REGION_ID,
    tileGridSize: index.tileGridSize,
    tileCount: index.tiles.length,
    tileFeatureCount,
    pointCount,
    wrongTilePointCount,
    duplicateFeaturePointCount,
    pureTypeCount: singleIndex.types?.length || 0,
    decodedCellCount,
    crossTypeDuplicateCount,
  }, null, 2));

  if (failures.length > 0) {
    throw new Error(`OSM 空間輸出驗證失敗:\n- ${failures.join('\n- ')}`);
  }
}

try {
  main();
  console.log('OSM 區域、tile 分割與 S2 編碼驗證通過。');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
