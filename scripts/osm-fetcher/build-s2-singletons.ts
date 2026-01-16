/**
 * 建立台灣本島 S2 Level 17 單一飾品格索引
 *
 * 使用方式：
 *   npx tsx scripts/osm-fetcher/build-s2-singletons.ts --region taiwan_main_island
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// @ts-ignore - s2-geometry doesn't have TypeScript definitions
import { S2 } from 's2-geometry';

interface RegionIndex {
  regionId: string;
  regionName: string;
  bbox: { north: number; south: number; east: number; west: number };
  tileGridSize: number;
  tiles: Array<{
    id: string;
    bbox: { north: number; south: number; east: number; west: number };
    file: string;
    poiCount: number;
  }>;
}

interface TileData {
  bbox: { north: number; south: number; east: number; west: number };
  pois: Array<{
    id: string;
    lat: number;
    lon: number;
    name: string;
    decorType: string;
    decorName: string;
    decorIcon: string;
    iconUrl?: string;
  }>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function getArgValue(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  if (index === -1) return undefined;
  return args[index + 1];
}

function getCellId(lat: number, lon: number, level: number) {
  const key = S2.latLngToKey(lat, lon, level);
  return S2.keyToId(key);
}

async function main() {
  const args = process.argv.slice(2);
  const regionId = getArgValue(args, '--region') || 'taiwan_main_island';
  const level = Number(getArgValue(args, '--level')) || 17;

  const baseDir = join(__dirname, `../../public/data/regions/${regionId}`);
  const indexPath = join(baseDir, 'index.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf-8')) as RegionIndex;

  const cellTypes = new Map<string, string | null>();

  for (const tile of index.tiles) {
    const tilePath = join(baseDir, 'tiles', tile.file);
    const tileData = JSON.parse(readFileSync(tilePath, 'utf-8')) as TileData;

    for (const poi of tileData.pois) {
      const cellId = getCellId(poi.lat, poi.lon, level);
      // 檢查是否已經處理過該 cell
      if (!cellTypes.has(cellId)) {
        cellTypes.set(cellId, poi.decorType);
        continue;
      }

      const current = cellTypes.get(cellId);
      
      // 如果已經標記為混合 (null)，則跳過（保持混合狀態）
      if (current === null) {
        continue;
      }

      // 如果當前類型與新類型不同，標記為混合 (null)
      if (current !== poi.decorType) {
        cellTypes.set(cellId, null);
      }
    }
  }

  const cells = Array.from(cellTypes.entries())
    .filter(([, decorType]) => decorType)
    .map(([cellId, decorType]) => ({ cellId, decorType: decorType as string }));

  const output = {
    version: '1.0.0',
    regionId,
    level,
    generatedAt: new Date().toISOString(),
    cellCount: cells.length,
    cells,
  };

  const outputPath = join(baseDir, `s2_l${level}_single.json`);
  writeFileSync(outputPath, JSON.stringify(output), 'utf-8');

  console.log(`✅ 完成單一飾品格索引: ${cells.length} 個 cells`);
  console.log(`📁 輸出檔案: ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
