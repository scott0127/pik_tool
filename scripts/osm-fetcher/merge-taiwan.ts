/**
 * 台灣本島大尺度切片合併與網格裁切 (Streaming / Bucket approach)
 *
 * 使用方式：
 *   npx tsx scripts/osm-fetcher/merge-taiwan.ts
 *
 * 重點：
 * - 避免將所有 POI (數百萬筆) 同時載入記憶體
 * - 即時將讀取的 POI 分配進前端所需的 S2 Level 16(或自訂Grid) Bucket
 * - 同步產出單格 s2_l17_single.json 來供應遊戲判斷雷達
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, getRegion } from './regions.js';
import type { BoundingBox, POIData } from './types';
// @ts-ignore
import { S2 } from 's2-geometry';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

function getTileIndex(lat: number, lon: number, bbox: BoundingBox, gridSize: number) {
  const latStep = (bbox.north - bbox.south) / gridSize;
  const lonStep = (bbox.east - bbox.west) / gridSize;
  const row = Math.min(gridSize - 1, Math.max(0, Math.floor((lat - bbox.south) / latStep)));
  const col = Math.min(gridSize - 1, Math.max(0, Math.floor((lon - bbox.west) / lonStep)));
  return { row, col };
}

function getCellId(lat: number, lon: number, level: number) {
  const key = S2.latLngToKey(lat, lon, level);
  return S2.keyToId(key);
}

async function main() {
  const region = REGIONS.taiwan_main_island;
  const CHUNKS_DIR = join(__dirname, '../../app/data/regions/taiwan_chunks');
  const OUTPUT_DIR = join(__dirname, '../../public/data/regions/taiwan_main_island');
  const TILES_DIR = join(OUTPUT_DIR, 'tiles');

  const FRONTEND_GRID = region.gridSize || 12; // 12x12 = 144 tiles
  
  if (!existsSync(TILES_DIR)) {
    mkdirSync(TILES_DIR, { recursive: true });
  }

  // 1. 初始化 Bucket
  console.log(`📦 初始化 ${FRONTEND_GRID}x${FRONTEND_GRID} 個前端載入 Bucket...`);
  const tileBboxes = splitBboxToGrid(region.bbox, FRONTEND_GRID);
  // 我們仍在記憶體中保留 buckets，但因為是以全島為主，POI若非常多，
  // 最佳解是串流寫入檔案。但為求實作單純，先嘗試直接推入陣列
  // Node.js 預設至少能扛 1.5GB 陣列 (約 500萬筆 JS Object)
  const tileBuckets: POIData[][] = Array.from({ length: tileBboxes.length }, () => []);

  const cellTypes = new Map<string, string | null>();
  const seenIds = new Set<string>();

  // 2. 爬梳所有下載好的 Chunks
  console.log(`\n讀取 chunk 檔案...`);
  if (!existsSync(CHUNKS_DIR)) {
    console.error(`❌ 找不到目錄 ${CHUNKS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(CHUNKS_DIR).filter(f => f.startsWith('chunk_') && f.endsWith('.json'));
  if (files.length === 0) {
    console.error(`❌ 沒有 chunk 檔案可供合併`);
    process.exit(1);
  }

  let totalParsed = 0;
  let totalDeduplicated = 0;

  for (const file of files) {
    const p = join(CHUNKS_DIR, file);
    const content = JSON.parse(readFileSync(p, 'utf-8'));
    const chunkPois: POIData[] = content.pois || [];

    for (const poi of chunkPois) {
      // 避免相鄰 Chunk 的邊界物件重複抓取
      if (seenIds.has(poi.id)) continue;
      seenIds.add(poi.id);

      // 分發至對應的 Tile Bucket
      const { row, col } = getTileIndex(poi.lat, poi.lon, region.bbox, FRONTEND_GRID);
      const index = row * FRONTEND_GRID + col;
      tileBuckets[index].push(poi);
      totalDeduplicated++;

      // 同步計算單格雷達 (s2_l17_single)
      const cellId = getCellId(poi.lat, poi.lon, 17);
      if (!cellTypes.has(cellId)) {
        cellTypes.set(cellId, poi.decorType);
      } else {
        const current = cellTypes.get(cellId);
        if (current !== null && current !== poi.decorType) {
          cellTypes.set(cellId, null); // 衝突變混合
        }
      }
    }
    totalParsed += chunkPois.length;
    console.log(`  讀取 ${file}: +${chunkPois.length} (累積合併去重: ${totalDeduplicated})`);
  }

  // 3. 輸出前端 Tiles (同 split-region 格式)
  console.log(`\n💾 正在寫入前端 Tile JSON...`);
  const indexEntries: TileIndexEntry[] = [];

  for (let i = 0; i < tileBboxes.length; i++) {
    const row = Math.floor(i / FRONTEND_GRID);
    const col = i % FRONTEND_GRID;
    const tileId = `r${row}_c${col}`;
    const fileName = `${tileId}.json`;
    const tileData = {
      bbox: tileBboxes[i],
      pois: tileBuckets[i],
    };

    writeFileSync(join(TILES_DIR, fileName), JSON.stringify(tileData), 'utf-8');

    indexEntries.push({
      id: tileId,
      bbox: tileBboxes[i],
      file: fileName,
      poiCount: tileBuckets[i].length,
    });
  }

  const index: RegionIndex = {
    regionId: region.id,
    regionName: region.name,
    bbox: region.bbox,
    tileGridSize: FRONTEND_GRID,
    tiles: indexEntries,
  };

  writeFileSync(join(OUTPUT_DIR, 'index.json'), JSON.stringify(index), 'utf-8');
  console.log(`✅ 寫入主索引: ${join(OUTPUT_DIR, 'index.json')}`);

  // 4. 輸出單一雷達飾品格 (同 build-s2-singletons 格式)
  console.log(`\n💾 正在寫入 S2 單一飾品格資料...`);
  const cells = Array.from(cellTypes.entries())
    .filter(([, decorType]) => decorType)
    .map(([cellId, decorType]) => ({ cellId, decorType: decorType as string }));

  const singleData = {
    version: '1.0.0',
    regionId: region.id,
    level: 17,
    generatedAt: new Date().toISOString(),
    cellCount: cells.length,
    cells,
  };

  writeFileSync(join(OUTPUT_DIR, `s2_l17_single.json`), JSON.stringify(singleData), 'utf-8');
  console.log(`✅ 完成單一飾品格索引: ${cells.length} 個 cells`);

  console.log(`\n🎉 台灣本島大尺度合併與裁切作業全數完成！`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
