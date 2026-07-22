/**
 * merge-taiwan.fixed.ts
 *
 * 目的：將 app/data/regions/taiwan_chunks/chunk_*.json 合併成前端實際使用的：
 * - public/data/regions/taiwan_main_island/index.json
 * - public/data/regions/taiwan_main_island/tiles/rX_cY.json
 * - public/data/regions/taiwan_main_island/s2_l17_single.json
 * - public/data/regions/taiwan_main_island/single/<decorType>.json
 *
 * 修正重點：
 * - 不再宣稱 streaming 但全部塞進記憶體；tile 輸出改用 JSONL bucket 暫存，再逐 tile 串流寫出。
 * - 不再把 bbox 外座標 clamp 到邊界 tile；bbox 外直接 skip 並統計。
 * - 直接產生前端 pure mode 會載入的 single/<decorType>.json。
 * - 輸出 mixed cell dropped 統計，避免誤以為 s2_l17_single 是完整 cell map。
 */

import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { once } from 'events';
import readline from 'readline';
import { REGIONS } from './regions.js';
import type { BoundingBox, CompressedFeature } from './types';
// @ts-ignore
import { S2 } from 's2-geometry';

const __dirname = dirname(fileURLToPath(import.meta.url));

type NullableDecor = string | null;

interface TileIndexEntry {
  id: string;
  bbox: BoundingBox;
  file: string;
  poiCount: number;
}

interface RegionIndex {
  version: string;
  regionId: string;
  regionName: string;
  generatedAt: string;
  bbox: BoundingBox;
  tileGridSize: number;
  tiles: TileIndexEntry[];
  source: SourceManifest | null;
}

interface SourceManifest {
  parserVersion: string;
  parsedAt: string;
  sourcePbf: {
    fileName: string;
    sizeBytes: number;
    lastModifiedAt: string;
  };
  decorRuleSetSha256: string;
}

interface MergeStats {
  totalParsed: number;
  totalDeduplicated: number;
  totalWrittenToTiles: number;
  duplicateSkipped: number;
  outsideBboxSkipped: number;
  invalidCoordSkipped: number;
  singleCells: number;
  mixedCellsDropped: number;
  cellCountByType: Record<string, number>;
  poiCountByType: Record<string, number>;
}

const REGION_ID = process.env.OSM_REGION_ID || 'taiwan_main_island';
const REGION = REGIONS[REGION_ID];
if (!REGION) throw new Error(`Unknown region: ${REGION_ID}`);

const S2_LEVEL = Number(process.env.OSM_S2_LEVEL || 17);
const FRONTEND_GRID = Number(process.env.OSM_FRONTEND_GRID || REGION.gridSize || 12);
const CHUNKS_DIR = process.env.OSM_CHUNKS_DIR || join(__dirname, '../../app/data/regions/taiwan_chunks');
const OUTPUT_DIR = process.env.OSM_OUTPUT_DIR || join(__dirname, `../../public/data/regions/${REGION.id}`);
const TILES_DIR = join(OUTPUT_DIR, 'tiles');
const SINGLE_DIR = join(OUTPUT_DIR, 'single');
const TMP_BUCKET_DIR = join(OUTPUT_DIR, '.tmp_tile_buckets');

function readSourceManifest(): SourceManifest | null {
  const statsPath = join(CHUNKS_DIR, 'parse-stats.json');
  if (!existsSync(statsPath)) return null;

  try {
    const stats = JSON.parse(readFileSync(statsPath, 'utf-8'));
    if (
      !stats?.version ||
      !stats?.generatedAt ||
      !stats?.sourcePbf?.fileName ||
      typeof stats?.sourcePbf?.sizeBytes !== 'number' ||
      !stats?.sourcePbf?.lastModifiedAt ||
      !stats?.decorRuleSetSha256
    ) {
      return null;
    }

    return {
      parserVersion: String(stats.version),
      parsedAt: String(stats.generatedAt),
      sourcePbf: {
        fileName: String(stats.sourcePbf.fileName),
        sizeBytes: Number(stats.sourcePbf.sizeBytes),
        lastModifiedAt: String(stats.sourcePbf.lastModifiedAt),
      },
      decorRuleSetSha256: String(stats.decorRuleSetSha256),
    };
  } catch (error) {
    console.warn(`⚠️ 無法讀取 OSM 來源追蹤資訊: ${statsPath}`, error);
    return null;
  }
}

function splitBboxToGrid(bbox: BoundingBox, gridSize: number): BoundingBox[] {
  const { north, south, east, west } = bbox;
  const latStep = (north - south) / gridSize;
  const lonStep = (east - west) / gridSize;
  const grids: BoundingBox[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      grids.push({
        south: south + row * latStep,
        north: south + (row + 1) * latStep,
        west: west + col * lonStep,
        east: west + (col + 1) * lonStep,
      });
    }
  }

  return grids;
}

function isFiniteCoord(lat: unknown, lon: unknown): lat is number {
  return typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon);
}

function isWithinBbox(lat: number, lon: number, bbox: BoundingBox) {
  return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}

function getTileIndexStrict(lat: number, lon: number, bbox: BoundingBox, gridSize: number) {
  if (!isWithinBbox(lat, lon, bbox)) return null;

  const latStep = (bbox.north - bbox.south) / gridSize;
  const lonStep = (bbox.east - bbox.west) / gridSize;
  // The clamp here only handles exact north/east border values after strict bbox validation.
  const row = Math.min(gridSize - 1, Math.max(0, Math.floor((lat - bbox.south) / latStep)));
  const col = Math.min(gridSize - 1, Math.max(0, Math.floor((lon - bbox.west) / lonStep)));
  return { row, col };
}

function getCellId(lat: number, lon: number, level: number) {
  const key = S2.latLngToKey(lat, lon, level);
  return S2.keyToId(key);
}

function resetDir(dir: string) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

async function writeAsync(stream: NodeJS.WritableStream, data: string) {
  if (!stream.write(data)) {
    await once(stream, 'drain');
  }
}

async function closeStream(stream: NodeJS.WritableStream) {
  stream.end();
  await once(stream, 'finish');
}

function updateCellType(cellTypes: Map<string, NullableDecor>, cellId: string, decorType: string) {
  if (!cellTypes.has(cellId)) {
    cellTypes.set(cellId, decorType);
    return;
  }

  const current = cellTypes.get(cellId);
  if (current !== null && current !== decorType) {
    cellTypes.set(cellId, null);
  }
}

async function writeTileFromBucket(bucketFile: string, tileFile: string, bbox: BoundingBox) {
  const out = createWriteStream(tileFile, { encoding: 'utf-8' });
  let count = 0;
  let first = true;

  await writeAsync(out, `{"bbox":${JSON.stringify(bbox)},"features":[`);

  if (existsSync(bucketFile)) {
    const rl = readline.createInterface({
      input: createReadStream(bucketFile, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      if (!first) await writeAsync(out, ',');
      await writeAsync(out, line);
      first = false;
      count++;
    }
  }

  await writeAsync(out, ']}');
  await closeStream(out);
  return count;
}

async function writeAllSingleCells(cellTypes: Map<string, NullableDecor>, outputPath: string) {
  const out = createWriteStream(outputPath, { encoding: 'utf-8' });
  let first = true;
  let count = 0;

  await writeAsync(out, `{"version":"2.0.0","regionId":${JSON.stringify(REGION.id)},"level":${S2_LEVEL},"generatedAt":${JSON.stringify(new Date().toISOString())},"cells":[`);

  for (const [cellId, decorType] of cellTypes.entries()) {
    if (!decorType) continue;
    if (!first) await writeAsync(out, ',');
    await writeAsync(out, JSON.stringify({ cellId, decorType }));
    first = false;
    count++;
  }

  await writeAsync(out, `],"cellCount":${count}}`);
  await closeStream(out);
  return count;
}

function writePerTypeSingleCells(cellTypes: Map<string, NullableDecor>, singleDir: string) {
  const grouped = new Map<string, string[]>();
  let mixed = 0;

  for (const [cellId, decorType] of cellTypes.entries()) {
    if (!decorType) {
      mixed++;
      continue;
    }
    const list = grouped.get(decorType) || [];
    list.push(cellId);
    grouped.set(decorType, list);
  }

  const indexData: { decorType: string; cellCount: number; file: string }[] = [];
  for (const [decorType, cellIds] of grouped.entries()) {
    cellIds.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0));

    const fileName = `${decorType}.json`;
    const filePath = join(singleDir, fileName);
    const data = {
      decorType,
      cellCount: cellIds.length,
      cells: cellIds.map(cellId => ({ cellId })),
    };
    writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    indexData.push({ decorType, cellCount: cellIds.length, file: fileName });
  }

  indexData.sort((a, b) => b.cellCount - a.cellCount);
  writeFileSync(join(singleDir, 'index.json'), JSON.stringify({
    version: '2.0.0',
    regionId: REGION.id,
    level: S2_LEVEL,
    generatedAt: new Date().toISOString(),
    totalCellCount: indexData.reduce((sum, item) => sum + item.cellCount, 0),
    mixedCellCountDropped: mixed,
    types: indexData,
  }, null, 2), 'utf-8');

  return { grouped, mixed };
}

async function main() {
  const region = REGION;
  const generatedAt = new Date().toISOString();
  const sourceManifest = readSourceManifest();
  const tileBboxes = splitBboxToGrid(region.bbox, FRONTEND_GRID);

  console.log(`📦 Region: ${region.id}`);
  console.log(`📦 Chunks dir: ${CHUNKS_DIR}`);
  console.log(`📦 Output dir: ${OUTPUT_DIR}`);
  console.log(`📦 Frontend grid: ${FRONTEND_GRID}x${FRONTEND_GRID}, S2 L${S2_LEVEL}`);

  if (!existsSync(CHUNKS_DIR)) {
    console.error(`❌ 找不到目錄 ${CHUNKS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(CHUNKS_DIR)
    .filter(f => f.startsWith('chunk_') && f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.error('❌ 沒有 chunk 檔案可供合併');
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  resetDir(TILES_DIR);
  resetDir(SINGLE_DIR);
  resetDir(TMP_BUCKET_DIR);

  const stats: MergeStats = {
    totalParsed: 0,
    totalDeduplicated: 0,
    totalWrittenToTiles: 0,
    duplicateSkipped: 0,
    outsideBboxSkipped: 0,
    invalidCoordSkipped: 0,
    singleCells: 0,
    mixedCellsDropped: 0,
    cellCountByType: {},
    poiCountByType: {},
  };

  const cellTypes = new Map<string, NullableDecor>();
  const seenIds = new Set<string>();
  const bucketStreams = tileBboxes.map((_bbox, i) =>
    createWriteStream(join(TMP_BUCKET_DIR, `bucket_${i}.jsonl`), { encoding: 'utf-8' })
  );

  console.log('\n讀取 chunk 檔案並分配到暫存 tile bucket...');

  for (const file of files) {
    const p = join(CHUNKS_DIR, file);
    const content = JSON.parse(readFileSync(p, 'utf-8')) as { features?: CompressedFeature[] };
    const chunkFeatures = Array.isArray(content.features) ? content.features : [];

    let acceptedInFile = 0;
    for (const feat of chunkFeatures) {
      stats.totalParsed++;

      if (seenIds.has(feat.id)) {
        stats.duplicateSkipped++;
        continue;
      }

      const tileBuckets = new Map<number, [number, number][]>();

      for (const pt of feat.pts) {
        const lat = pt[0];
        const lon = pt[1];

        if (!isFiniteCoord(lat, lon)) {
          stats.invalidCoordSkipped++;
          continue;
        }

        const tileIndex = getTileIndexStrict(lat, lon, region.bbox, FRONTEND_GRID);
        if (!tileIndex) {
          stats.outsideBboxSkipped++;
          continue;
        }

        const index = tileIndex.row * FRONTEND_GRID + tileIndex.col;
        let arr = tileBuckets.get(index);
        if (!arr) {
          arr = [];
          tileBuckets.set(index, arr);
        }
        arr.push(pt);
      }

      if (tileBuckets.size === 0) continue;
      seenIds.add(feat.id);

      let acceptedPointCount = 0;
      for (const [index, pts] of tileBuckets.entries()) {
        for (const [lat, lon] of pts) {
          updateCellType(cellTypes, getCellId(lat, lon, S2_LEVEL), feat.t);
          acceptedPointCount++;
        }

        const partialFeat: CompressedFeature = {
          id: feat.id,
          t: feat.t,
          n: feat.n,
          pts: pts,
        };
        await writeAsync(bucketStreams[index], JSON.stringify(partialFeat) + '\n');
      }

      stats.totalDeduplicated++;
      acceptedInFile++;
      stats.poiCountByType[feat.t] = (stats.poiCountByType[feat.t] || 0) + acceptedPointCount;
    }

    console.log(`  ${file}: +${chunkFeatures.length.toLocaleString()} parsed, +${acceptedInFile.toLocaleString()} accepted, total accepted ${stats.totalDeduplicated.toLocaleString()}`);
  }

  await Promise.all(bucketStreams.map(closeStream));

  console.log('\n💾 正在串流寫入前端 Tile JSON...');
  const indexEntries: TileIndexEntry[] = [];

  for (let i = 0; i < tileBboxes.length; i++) {
    const row = Math.floor(i / FRONTEND_GRID);
    const col = i % FRONTEND_GRID;
    const tileId = `r${row}_c${col}`;
    const fileName = `${tileId}.json`;
    const bucketFile = join(TMP_BUCKET_DIR, `bucket_${i}.jsonl`);
    const tileFile = join(TILES_DIR, fileName);
    const count = await writeTileFromBucket(bucketFile, tileFile, tileBboxes[i]);

    stats.totalWrittenToTiles += count;
    indexEntries.push({
      id: tileId,
      bbox: tileBboxes[i],
      file: fileName,
      poiCount: count,
    });
  }

  const index: RegionIndex = {
    version: '3.0.0',
    regionId: region.id,
    regionName: region.name,
    generatedAt,
    bbox: region.bbox,
    tileGridSize: FRONTEND_GRID,
    tiles: indexEntries,
    source: sourceManifest,
  };

  writeFileSync(join(OUTPUT_DIR, 'index.json'), JSON.stringify(index), 'utf-8');
  console.log(`✅ 寫入主索引: ${join(OUTPUT_DIR, 'index.json')}`);

  console.log('\n💾 正在寫入 S2 單一飾品格資料...');
  stats.singleCells = await writeAllSingleCells(cellTypes, join(OUTPUT_DIR, `s2_l${S2_LEVEL}_single.json`));
  const perType = writePerTypeSingleCells(cellTypes, SINGLE_DIR);
  stats.mixedCellsDropped = perType.mixed;

  for (const [decorType, cells] of perType.grouped.entries()) {
    stats.cellCountByType[decorType] = cells.length;
  }

  const statsPath = join(OUTPUT_DIR, 'merge-stats.json');
  writeFileSync(statsPath, JSON.stringify({
    version: '3.0.0',
    regionId: region.id,
    generatedAt,
    source: sourceManifest,
    chunksDir: CHUNKS_DIR,
    outputDir: OUTPUT_DIR,
    frontendGrid: FRONTEND_GRID,
    s2Level: S2_LEVEL,
    stats,
  }, null, 2), 'utf-8');

  rmSync(TMP_BUCKET_DIR, { recursive: true, force: true });

  console.log('\n🎉 台灣本島大尺度合併與裁切完成');
  console.log(`  parsed: ${stats.totalParsed.toLocaleString()}`);
  console.log(`  accepted/deduplicated: ${stats.totalDeduplicated.toLocaleString()}`);
  console.log(`  written to tiles: ${stats.totalWrittenToTiles.toLocaleString()}`);
  console.log(`  single cells: ${stats.singleCells.toLocaleString()}`);
  console.log(`  mixed cells dropped: ${stats.mixedCellsDropped.toLocaleString()}`);
  console.log(`  outside bbox skipped: ${stats.outsideBboxSkipped.toLocaleString()}`);
  console.log(`  duplicate skipped: ${stats.duplicateSkipped.toLocaleString()}`);
  console.log(`  stats: ${statsPath}`);
  console.log('\n下一步可選：');
  console.log('  node scripts/encode-s2-cells.cjs');
  console.log('  node scripts/optimize-tiles.cjs');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
