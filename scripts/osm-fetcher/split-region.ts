/**
 * 將大型區域資料切成分片（tiles）以降低前端記憶體壓力
 *
 * 使用方式：
 *   npx tsx scripts/osm-fetcher/split-region.ts --region taiwan_main_island --grid 16
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface POIData {
  id: string;
  lat: number;
  lon: number;
  name: string;
  decorType: string;
  decorName: string;
  decorIcon: string;
  iconUrl?: string;
}

interface RegionPOIFile {
  version: string;
  regionId: string;
  regionName: string;
  bbox: BoundingBox;
  generatedAt: string;
  poiCount: number;
  pois: POIData[];
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

function getArgValue(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  if (index === -1) return undefined;
  return args[index + 1];
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

async function main() {
  const args = process.argv.slice(2);
  const regionId = getArgValue(args, '--region') || 'taiwan_main_island';
  const gridSize = Number(getArgValue(args, '--grid')) || 16;
  const inputArg = getArgValue(args, '--input');

  const inputPath = inputArg
    ? inputArg
    : join(__dirname, `../../public/data/regions/${regionId}.json`);
  if (!existsSync(inputPath)) {
    console.error(`❌ 找不到輸入檔案: ${inputPath}`);
    process.exit(1);
  }

  const raw = readFileSync(inputPath, 'utf-8');
  const data: RegionPOIFile = JSON.parse(raw);

  const tiles = splitBboxToGrid(data.bbox, gridSize);
  const tileBuckets: POIData[][] = Array.from({ length: tiles.length }, () => []);

  for (const poi of data.pois) {
    const { row, col } = getTileIndex(poi.lat, poi.lon, data.bbox, gridSize);
    const index = row * gridSize + col;
    tileBuckets[index].push(poi);
  }

  const outputDir = join(__dirname, `../../public/data/regions/${regionId}`);
  const tilesDir = join(outputDir, 'tiles');
  if (!existsSync(tilesDir)) {
    mkdirSync(tilesDir, { recursive: true });
  }

  const indexEntries: TileIndexEntry[] = [];

  for (let i = 0; i < tiles.length; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const tileId = `r${row}_c${col}`;
    const fileName = `${tileId}.json`;
    const tileData = {
      bbox: tiles[i],
      pois: tileBuckets[i],
    };

    writeFileSync(join(tilesDir, fileName), JSON.stringify(tileData), 'utf-8');

    indexEntries.push({
      id: tileId,
      bbox: tiles[i],
      file: fileName,
      poiCount: tileBuckets[i].length,
    });
  }

  const index: RegionIndex = {
    regionId: data.regionId,
    regionName: data.regionName,
    bbox: data.bbox,
    tileGridSize: gridSize,
    tiles: indexEntries,
  };

  writeFileSync(join(outputDir, 'index.json'), JSON.stringify(index), 'utf-8');

  console.log(`✅ 完成切片: ${indexEntries.length} 個 tiles`);
  console.log(`📁 索引檔案: ${join(outputDir, 'index.json')}`);
  console.log(`📁 tiles 目錄: ${tilesDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
