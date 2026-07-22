/**
 * 台灣本島 OSM 資料一鍵重建管線
 *
 * 自動執行八步驟：
 *   1. 清除舊資料 (chunks + progress)
 *   2. 解析指定的台灣 OSM PBF 資料 (parse-taiwan.ts)
 *   3. 合併至前端目錄 (merge-taiwan.ts)
 *   4. 重建 S2 單一飾品格索引 (build-s2-singletons.ts)
 *   5. 拆分 S2 單一飾品格索引為前端實際使用的小檔
 *   6. 對拆分檔做差量編碼，並移除 public 內的大型中繼檔
 *   7. 驗證區域、tile 分割與 S2 編碼 (verify-spatial-output.ts)
 *   8. 驗證高雄巨蛋 POI (verify-kaohsiung-arena.ts)
 *
 * 使用方式：
 *   pnpm exec tsx scripts/osm-fetcher/pipeline-taiwan.ts --pbf "C:\path\taiwan-latest.osm.pbf"
 *
 * 可選參數：
 *   --skip-parse    使用既有 chunks，僅重新合併、建索引與驗證
 *   --skip-fetch    --skip-parse 的舊名稱，保留相容性
 */

import { spawn } from 'child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  unlinkSync,
} from 'fs';
import { join, dirname, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const tsxCliPath = require.resolve('tsx/cli');
const TOTAL_STEPS = 8;
const REGION_OUTPUT_DIR = join(__dirname, '../../public/data/regions/taiwan_main_island');
const REGION_BACKUP_DIR = join(__dirname, '../../public/data/regions/taiwan_main_island.pipeline-backup');

function recoverInterruptedOutputTransaction() {
  if (!existsSync(REGION_BACKUP_DIR)) return;

  if (existsSync(REGION_OUTPUT_DIR)) {
    rmSync(REGION_OUTPUT_DIR, { recursive: true, force: true });
  }
  renameSync(REGION_BACKUP_DIR, REGION_OUTPUT_DIR);
  console.log('♻️ 已還原上次中斷前的正式 OSM 區域資料');
}

function beginOutputTransaction() {
  recoverInterruptedOutputTransaction();
  if (existsSync(REGION_OUTPUT_DIR)) {
    renameSync(REGION_OUTPUT_DIR, REGION_BACKUP_DIR);
  }
}

function commitOutputTransaction() {
  if (existsSync(REGION_BACKUP_DIR)) {
    rmSync(REGION_BACKUP_DIR, { recursive: true, force: true });
  }
}

function rollbackOutputTransaction() {
  if (existsSync(REGION_OUTPUT_DIR)) {
    rmSync(REGION_OUTPUT_DIR, { recursive: true, force: true });
  }
  if (existsSync(REGION_BACKUP_DIR)) {
    renameSync(REGION_BACKUP_DIR, REGION_OUTPUT_DIR);
  }
}

function getArgValue(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  if (index === -1) return undefined;
  return args[index + 1];
}

function hasFlag(args: string[], key: string): boolean {
  return args.includes(key);
}

function assertCurrentChunkProvenance(chunksDir: string) {
  const statsPath = join(chunksDir, 'parse-stats.json');
  if (!existsSync(statsPath)) {
    throw new Error(`--skip-parse 需要可追溯的 chunks，但找不到 ${statsPath}`);
  }

  const stats = JSON.parse(readFileSync(statsPath, 'utf-8')) as {
    version?: string;
    sourcePbf?: {
      fileName?: string;
      sizeBytes?: number;
      lastModifiedAt?: string;
    };
    decorRuleSetSha256?: string;
  };

  if (!stats.version?.startsWith('3.')) {
    throw new Error(`--skip-parse 不接受舊版 chunks（目前 ${stats.version || 'missing'}，需要 3.x）`);
  }
  if (
    !stats.sourcePbf?.fileName
    || typeof stats.sourcePbf.sizeBytes !== 'number'
    || !stats.sourcePbf.lastModifiedAt
    || !stats.decorRuleSetSha256
  ) {
    throw new Error('--skip-parse 的 chunks 缺少 PBF 或 parser 來源追蹤資訊，請重新解析 PBF');
  }
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args]
    .map(value => /\s/.test(value) ? JSON.stringify(value) : value)
    .join(' ');
}

function runStep(
  stepNum: number,
  name: string,
  command: string,
  args: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 步驟 ${stepNum}/${TOTAL_STEPS}: ${name}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`> ${formatCommand(command, args)}\n`);

    const startTime = Date.now();

    const child = spawn(command, args, {
      shell: false,
      stdio: 'inherit',
      cwd: join(__dirname, '../..'),
    });

    child.on('close', (code) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`\n✅ 步驟 ${stepNum} 完成 (耗時 ${elapsed} 秒)\n`);
        resolve();
      } else {
        console.error(`\n❌ 步驟 ${stepNum} 失敗 (exit code: ${code})\n`);
        reject(new Error(`步驟 ${stepNum} (${name}) 執行失敗`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

function runTsxStep(
  stepNum: number,
  name: string,
  scriptPath: string,
  args: string[] = [],
): Promise<void> {
  return runStep(stepNum, name, process.execPath, [tsxCliPath, scriptPath, ...args]);
}

async function main() {
  const args = process.argv.slice(2);
  const skipParse = hasFlag(args, '--skip-parse') || hasFlag(args, '--skip-fetch');
  const pbfArgument = getArgValue(args, '--pbf') || process.env.OSM_PBF_PATH;
  const pbfPath = pbfArgument ? resolvePath(pbfArgument) : null;

  const chunksDir = join(__dirname, '../../app/data/regions/taiwan_chunks');

  if (!skipParse && !pbfPath) {
    throw new Error('缺少 PBF 來源。請使用 --pbf "C:\\path\\taiwan-latest.osm.pbf" 或設定 OSM_PBF_PATH。');
  }
  if (!skipParse && pbfPath && !existsSync(pbfPath)) {
    throw new Error(`找不到 PBF 檔案: ${pbfPath}`);
  }
  if (skipParse) {
    assertCurrentChunkProvenance(chunksDir);
  }

  console.log(`\n🚀 台灣本島 OSM 資料管線啟動`);
  console.log(`⏰ 開始時間: ${new Date().toLocaleString('zh-TW')}`);
  if (pbfPath) console.log(`📦 PBF 來源: ${pbfPath}`);
  if (skipParse) console.log(`⏭️  使用既有 chunks，跳過 PBF 解析`);

  const startTime = Date.now();

  // ============ 步驟 1：清除舊資料 ============
  if (!skipParse) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 步驟 1/${TOTAL_STEPS}: 清除舊資料`);
    console.log(`${'='.repeat(60)}\n`);

    if (existsSync(chunksDir)) {
      const files = readdirSync(chunksDir);
      let removedCount = 0;
      for (const file of files) {
        if (
          file.startsWith('chunk_')
          || file === 'progress.json'
          || file === 'parse-stats.json'
        ) {
          unlinkSync(join(chunksDir, file));
          removedCount++;
        }
      }
      console.log(`🧹 已清除 ${removedCount} 個檔案`);
    } else {
      console.log(`📁 目錄不存在，無需清除`);
    }

    console.log(`\n✅ 步驟 1 完成\n`);
  } else {
    console.log(`\n⏭️  步驟 1 已跳過（--skip-parse 模式）`);
  }

  if (!skipParse) {
    await runTsxStep(
      2,
      '解析本地 OSM 資料',
      'scripts/osm-fetcher/parse-taiwan.ts',
      [pbfPath!],
    );
  } else {
    console.log(`\n⏭️  步驟 2 已跳過（--skip-parse 模式）`);
  }

  beginOutputTransaction();
  try {
    // ============ 步驟 3：合併至前端目錄 ============
    await runTsxStep(3, '合併資料至前端 Tiles', 'scripts/osm-fetcher/merge-taiwan.ts');

    // ============ 步驟 4：重建 S2 索引 ============
    await runTsxStep(4, '重建 S2 單一飾品格索引', 'scripts/osm-fetcher/build-s2-singletons.ts');

    // ============ 步驟 5：拆分 S2 索引 ============
    await runStep(5, '拆分 S2 單一飾品格索引', process.execPath, ['scripts/split-single-cells.cjs']);

    // ============ 步驟 6：差量編碼並移除大型中繼檔 ============
    await runStep(6, '壓縮 S2 單一飾品格小檔', process.execPath, ['scripts/encode-s2-cells.cjs']);

    const singleIndexFile = join(REGION_OUTPUT_DIR, 's2_l17_single.json');
    if (existsSync(singleIndexFile)) {
      unlinkSync(singleIndexFile);
      console.log(`🧹 已移除 public 中不給前端直接讀取的大型中繼檔: ${singleIndexFile}`);
    }

    // ============ 步驟 7-8：驗證 ============
    await runTsxStep(7, '驗證 OSM 空間輸出', 'scripts/osm-fetcher/verify-spatial-output.ts');
    await runTsxStep(8, '驗證高雄巨蛋 POI', 'scripts/osm-fetcher/verify-kaohsiung-arena.ts');
    commitOutputTransaction();
  } catch (error) {
    rollbackOutputTransaction();
    throw error;
  }

  // ============ 完成報告 ============
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 台灣本島 OSM 資料管線全部完成！`);
  console.log(`${'='.repeat(60)}`);
  console.log(`⏱️  總耗時: ${elapsed} 分鐘`);
  console.log(`📁 前端 Tiles: public/data/regions/taiwan_main_island/tiles/`);
  console.log(`📁 S2 小檔:    public/data/regions/taiwan_main_island/single/`);
  console.log(`\n下一步：執行 npm run dev 確認地圖顯示正確`);
}

main().catch((err) => {
  console.error(`\n💥 管線中斷: ${err.message}`);
  process.exit(1);
});
