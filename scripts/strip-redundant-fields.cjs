/**
 * strip-redundant-fields.cjs
 * 
 * 移除瓦片及純種格 JSON 檔案中的冗餘 decorName 和 decorIcon 欄位
 * 這些欄位可以從 decorType 透過 decorRules 對照表取得
 * 
 * 使用方式：
 *   node scripts/strip-redundant-fields.cjs
 */

const fs = require('fs');
const path = require('path');

// 要處理的目錄
const REGIONS_DIR = path.join(__dirname, '..', 'public', 'data', 'regions');

// 統計資料
let totalFiles = 0;
let totalPOIs = 0;
let totalBytesSaved = 0;

/**
 * 處理單個 JSON 檔案
 */
function processFile(filePath) {
    try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(originalContent, 'utf8');

        const data = JSON.parse(originalContent);

        if (!data.pois || !Array.isArray(data.pois)) {
            console.log(`  [SKIP] ${filePath} - 沒有 pois 陣列`);
            return;
        }

        // 移除每個 POI 的 decorName 和 decorIcon
        data.pois = data.pois.map(poi => {
            const { decorName, decorIcon, ...rest } = poi;
            return rest;
        });

        totalPOIs += data.pois.length;

        // 輸出壓縮的 JSON（無縮排）
        const newContent = JSON.stringify(data);
        const newSize = Buffer.byteLength(newContent, 'utf8');

        fs.writeFileSync(filePath, newContent, 'utf8');

        const bytesSaved = originalSize - newSize;
        totalBytesSaved += bytesSaved;
        totalFiles++;

        const percentage = ((bytesSaved / originalSize) * 100).toFixed(1);
        console.log(`  [OK] ${path.basename(filePath)} - 節省 ${(bytesSaved / 1024).toFixed(1)} KB (${percentage}%)`);

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
        console.log(`  [SKIP] ${targetDir} - 目錄不存在`);
        return;
    }

    const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

    console.log(`\n處理 ${targetDir} (${files.length} 個檔案)`);

    for (const file of files) {
        processFile(path.join(targetDir, file));
    }
}

// 主程式
console.log('=== JSON 冗餘欄位移除工具 ===\n');
console.log(`區域資料目錄: ${REGIONS_DIR}\n`);

// 取得所有區域
const regions = fs.readdirSync(REGIONS_DIR).filter(f => {
    const stat = fs.statSync(path.join(REGIONS_DIR, f));
    return stat.isDirectory();
});

console.log(`找到 ${regions.length} 個區域: ${regions.join(', ')}`);

for (const region of regions) {
    console.log(`\n======== 區域: ${region} ========`);

    const regionPath = path.join(REGIONS_DIR, region);

    // 處理瓦片檔案
    processDirectory(regionPath, 'tiles');

    // 處理純種格檔案
    processDirectory(regionPath, 'single');
}

// 輸出統計
console.log('\n=== 統計結果 ===');
console.log(`處理檔案數: ${totalFiles}`);
console.log(`處理 POI 數: ${totalPOIs.toLocaleString()}`);
console.log(`總節省空間: ${(totalBytesSaved / 1024 / 1024).toFixed(2)} MB`);
console.log('================\n');
