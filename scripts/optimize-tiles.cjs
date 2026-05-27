/**
 * optimize-tiles.cjs
 * 
 * 優化所有區域 tile/single JSON 檔案：
 *   1. 移除冗餘 decorName 和 decorIcon（client 從 decorRules 取得）
 *   2. 經緯度精度縮減至 6 位小數（~0.11m 精度，完全足夠地圖顯示）
 *   3. 移除空的 iconUrl
 * 
 * 使用方式：
 *   node scripts/optimize-tiles.cjs
 *   node scripts/optimize-tiles.cjs --dry-run    # 只看統計不寫入
 */

const fs = require('fs');
const path = require('path');

const REGIONS_DIR = path.join(__dirname, '..', 'public', 'data', 'regions');
const DRY_RUN = process.argv.includes('--dry-run');

// 統計
let totalFiles = 0;
let totalPOIs = 0;
let totalOriginalBytes = 0;
let totalNewBytes = 0;
let skippedFiles = 0;

/**
 * 四捨五入到指定小數位
 */
function roundTo(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * 處理單個 JSON 檔案
 */
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');

    const data = JSON.parse(originalContent);

    if (!data.pois || !Array.isArray(data.pois)) {
      skippedFiles++;
      return;
    }

    if (data.pois.length === 0) {
      skippedFiles++;
      return;
    }

    // 優化每個 POI
    data.pois = data.pois.map(poi => {
      const optimized = {
        id: poi.id,
        lat: roundTo(poi.lat, 6),
        lon: roundTo(poi.lon, 6),
        name: poi.name,
        decorType: poi.decorType,
      };

      // 只保留有意義的 iconUrl（某些 decorType 有自訂圖片）
      if (poi.iconUrl) {
        optimized.iconUrl = poi.iconUrl;
      }

      // decorName 和 decorIcon 被移除：client 從 decorRules 推導

      return optimized;
    });

    // 同時精簡 bbox 小數位
    if (data.bbox) {
      data.bbox.north = roundTo(data.bbox.north, 6);
      data.bbox.south = roundTo(data.bbox.south, 6);
      data.bbox.east = roundTo(data.bbox.east, 6);
      data.bbox.west = roundTo(data.bbox.west, 6);
    }

    const newContent = JSON.stringify(data);
    const newSize = Buffer.byteLength(newContent, 'utf8');

    totalOriginalBytes += originalSize;
    totalNewBytes += newSize;
    totalPOIs += data.pois.length;
    totalFiles++;

    const saved = originalSize - newSize;
    const pct = ((saved / originalSize) * 100).toFixed(1);
    const relPath = path.relative(REGIONS_DIR, filePath);

    if (saved > 1024) {
      console.log(`  [OK] ${relPath} — ${(saved / 1024).toFixed(0)} KB saved (${pct}%)`);
    }

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

  } catch (err) {
    console.error(`  [ERROR] ${filePath}: ${err.message}`);
  }
}

/**
 * 遞迴處理目錄
 */
function processDirectory(dirPath, subFolder) {
  const targetDir = path.join(dirPath, subFolder);

  if (!fs.existsSync(targetDir)) {
    return;
  }

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

  console.log(`\n📂 ${path.relative(REGIONS_DIR, targetDir)} (${files.length} 個檔案)`);

  for (const file of files) {
    processFile(path.join(targetDir, file));
  }
}

// === 主程式 ===
console.log('=== Tile JSON 優化工具 ===');
console.log(`  移除: decorName, decorIcon`);
console.log(`  經緯度: 截短至 6 位小數 (~0.11m 精度)`);
if (DRY_RUN) console.log(`  ⚠️  DRY RUN 模式，不會寫入檔案`);
console.log(`\n區域目錄: ${REGIONS_DIR}\n`);

// 取得所有區域
const regions = fs.readdirSync(REGIONS_DIR).filter(f => {
  const stat = fs.statSync(path.join(REGIONS_DIR, f));
  return stat.isDirectory();
});

console.log(`找到 ${regions.length} 個區域: ${regions.join(', ')}\n`);

for (const region of regions) {
  console.log(`\n======== 區域: ${region} ========`);
  const regionPath = path.join(REGIONS_DIR, region);

  processDirectory(regionPath, 'tiles');
  processDirectory(regionPath, 'single');
}

// 統計結果
const savedBytes = totalOriginalBytes - totalNewBytes;
const savedMB = (savedBytes / 1024 / 1024).toFixed(2);
const savedPct = totalOriginalBytes > 0 ? ((savedBytes / totalOriginalBytes) * 100).toFixed(1) : '0';

console.log('\n\n=== 📊 統計結果 ===');
console.log(`  處理檔案: ${totalFiles} (跳過 ${skippedFiles} 個空檔案)`);
console.log(`  處理 POI: ${totalPOIs.toLocaleString()}`);
console.log(`  原始大小: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`  新的大小: ${(totalNewBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`  節省空間: ${savedMB} MB (${savedPct}%)`);
if (DRY_RUN) console.log(`\n  ⚠️  DRY RUN — 以上統計為預估值，檔案未修改`);
console.log('====================\n');
