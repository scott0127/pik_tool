/**
 * 台灣本島 OSM 資料一鍵抓取管線
 *
 * 自動執行七步驟：
 *   1. 清除舊資料 (chunks + progress)
 *   2. 抓取全台灣 OSM POI 資料 (fetch-taiwan.ts)
 *   3. 合併至前端目錄 (merge-taiwan.ts)
 *   4. 重建 S2 單一飾品格索引 (build-s2-singletons.ts)
 *   5. 拆分 S2 單一飾品格索引為前端實際使用的小檔
 *   6. 對拆分檔做差量編碼，並移除 public 內的大型中繼檔
 *   7. 驗證高雄巨蛋 POI (verify-kaohsiung-arena.ts)
 *
 * 使用方式：
 *   npx tsx scripts/osm-fetcher/pipeline-taiwan.ts
 *
 * 可選參數：
 *   --limit N       每次最多抓取 N 個 chunk（方便分批執行）
 *   --skip-clean    跳過清除步驟（斷點續傳模式）
 *   --skip-fetch    跳過抓取步驟（僅重新合併與驗證）
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getArgValue(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  if (index === -1) return undefined;
  return args[index + 1];
}

function hasFlag(args: string[], key: string): boolean {
  return args.includes(key);
}

function runStep(stepNum: number, name: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 步驟 ${stepNum}/7: ${name}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`> ${command}\n`);

    const startTime = Date.now();

    const child = spawn(command, {
      shell: true,
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

async function main() {
  const args = process.argv.slice(2);
  const limit = getArgValue(args, '--limit');
  const skipClean = hasFlag(args, '--skip-clean');
  const skipFetch = hasFlag(args, '--skip-fetch');

  const chunksDir = join(__dirname, '../../app/data/regions/taiwan_chunks');
  const progressFile = join(chunksDir, 'progress.json');

  console.log(`\n🚀 台灣本島 OSM 資料管線啟動`);
  console.log(`⏰ 開始時間: ${new Date().toLocaleString('zh-TW')}`);
  if (limit) console.log(`📊 限制模式: 最多 ${limit} 個 chunk`);
  if (skipClean) console.log(`⏭️  跳過清除步驟`);
  if (skipFetch) console.log(`⏭️  跳過抓取步驟`);

  const startTime = Date.now();

  // ============ 步驟 1：清除舊資料 ============
  if (!skipClean && !skipFetch) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 步驟 1/5: 清除舊資料`);
    console.log(`${'='.repeat(60)}\n`);

    if (existsSync(chunksDir)) {
      const files = readdirSync(chunksDir);
      let removedCount = 0;
      for (const file of files) {
        if (file.startsWith('chunk_') || file === 'progress.json') {
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
    console.log(`\n⏭️  步驟 1 已跳過（${skipClean ? '--skip-clean' : '--skip-fetch'} 模式）`);
  }

  // ============ 步驟 2：抓取 OSM 資料 ============
  if (!skipFetch) {
    const limitArg = limit ? ` --limit ${limit}` : '';
    await runStep(2, '抓取台灣 OSM 資料', `npx tsx scripts/osm-fetcher/fetch-taiwan.ts${limitArg}`);

    // 如果有 limit，檢查是否全部完成
    if (limit && existsSync(progressFile)) {
      const progress = JSON.parse(readFileSync(progressFile, 'utf-8'));
      const totalChunks = 15 * 15; // 225
      if (progress.completed.length < totalChunks) {
        console.log(`\n⚠️  注意：僅完成 ${progress.completed.length}/${totalChunks} 個 chunk`);
        console.log(`   請再次執行管線以繼續抓取剩餘 chunk（使用 --skip-clean 保留進度）`);
        console.log(`   npx tsx scripts/osm-fetcher/pipeline-taiwan.ts --skip-clean${limit ? ` --limit ${limit}` : ''}`);

        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        console.log(`\n⏱️  本次管線耗時: ${elapsed} 分鐘`);
        return;
      }
    }
  } else {
    console.log(`\n⏭️  步驟 2 已跳過（--skip-fetch 模式）`);
  }

  // ============ 步驟 3：合併至前端目錄 ============
  await runStep(3, '合併資料至前端 Tiles', 'npx tsx scripts/osm-fetcher/merge-taiwan.ts');

  // ============ 步驟 4：重建 S2 索引 ============
  await runStep(4, '重建 S2 單一飾品格索引', 'npx tsx scripts/osm-fetcher/build-s2-singletons.ts');

  // ============ 步驟 5：拆分 S2 索引 ============
  await runStep(5, '拆分 S2 單一飾品格索引', 'node scripts/split-single-cells.cjs');

  // ============ 步驟 6：差量編碼並移除大型中繼檔 ============
  await runStep(6, '壓縮 S2 單一飾品格小檔', 'node scripts/encode-s2-cells.cjs');

  const singleIndexFile = join(__dirname, '../../public/data/regions/taiwan_main_island/s2_l17_single.json');
  if (existsSync(singleIndexFile)) {
    unlinkSync(singleIndexFile);
    console.log(`🧹 已移除 public 中不給前端直接讀取的大型中繼檔: ${singleIndexFile}`);
  }

  // ============ 步驟 7：驗證 ============
  try {
    await runStep(7, '驗證高雄巨蛋 POI', 'npx tsx scripts/osm-fetcher/verify-kaohsiung-arena.ts');
  } catch {
    console.log(`⚠️  驗證未通過，但管線已完成。請手動檢查資料。`);
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
