/**
 * encode-s2-cells.cjs
 * 
 * 將 single/*.json 中的 S2 Cell IDs 轉換為差量編碼格式
 * 
 * 原始格式:
 *   { cells: [{ cellId: "3765..." }, { cellId: "3765..." }] }
 * 
 * 新格式:
 *   { encoding: "delta", base: "3765...", deltas: [0, 1, 5, ...] }
 * 
 * 使用方式: node scripts/encode-s2-cells.cjs
 */

const fs = require('fs');
const path = require('path');

const SINGLE_DIR = path.join(__dirname, '..', 'public', 'data', 'regions', 'taiwan_main_island', 'single');

let totalFiles = 0;
let totalCells = 0;
let totalBytesSaved = 0;

/**
 * 將 cells 陣列轉換為差量編碼
 */
function encodeCells(cells) {
    if (!cells || cells.length === 0) {
        return { encoding: 'delta', base: '0', deltas: [] };
    }

    // 提取所有 cellId 並轉為 BigInt
    const ids = cells.map(c => BigInt(c.cellId));

    // 排序以獲得更小的差值
    ids.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    // 計算差量
    const base = ids[0];
    const deltas = [];
    let prev = base;

    for (const id of ids) {
        const delta = id - prev;
        deltas.push(Number(delta)); // 差量通常很小，可用 Number
        prev = id;
    }

    return {
        encoding: 'delta',
        base: base.toString(),
        deltas: deltas
    };
}

/**
 * 驗證編碼/解碼正確性
 */
function verifyEncoding(originalCells, encoded) {
    // 解碼
    const decoded = [];
    let current = BigInt(encoded.base);

    for (const delta of encoded.deltas) {
        current += BigInt(delta);
        decoded.push(current.toString());
    }

    // 比對（需排序後比較）
    const originalSorted = originalCells.map(c => c.cellId).sort();
    const decodedSorted = decoded.sort();

    if (originalSorted.length !== decodedSorted.length) {
        return false;
    }

    for (let i = 0; i < originalSorted.length; i++) {
        if (originalSorted[i] !== decodedSorted[i]) {
            return false;
        }
    }

    return true;
}

/**
 * 處理單個 JSON 檔案
 */
function processFile(filePath) {
    const fileName = path.basename(filePath);

    // 跳過 index.json
    if (fileName === 'index.json') {
        console.log(`  [SKIP] ${fileName} - index 檔案`);
        return;
    }

    try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(originalContent, 'utf8');

        const data = JSON.parse(originalContent);

        // 已經是差量編碼格式則跳過
        if (data.encoding === 'delta') {
            console.log(`  [SKIP] ${fileName} - 已經是差量編碼格式`);
            return;
        }

        // 需要有 cells 陣列
        if (!data.cells || !Array.isArray(data.cells) || data.cells.length === 0) {
            console.log(`  [SKIP] ${fileName} - 沒有 cells 資料`);
            return;
        }

        const cellCount = data.cells.length;
        totalCells += cellCount;

        // 編碼
        const encoded = encodeCells(data.cells);

        // 驗證
        if (!verifyEncoding(data.cells, encoded)) {
            console.error(`  [ERROR] ${fileName} - 編碼驗證失敗！`);
            return;
        }

        // 建立新的資料結構
        const newData = {
            decorType: data.decorType,
            cellCount: cellCount,
            encoding: encoded.encoding,
            base: encoded.base,
            deltas: encoded.deltas
        };

        // 輸出
        const newContent = JSON.stringify(newData);
        const newSize = Buffer.byteLength(newContent, 'utf8');

        fs.writeFileSync(filePath, newContent, 'utf8');

        const bytesSaved = originalSize - newSize;
        totalBytesSaved += bytesSaved;
        totalFiles++;

        const percentage = ((bytesSaved / originalSize) * 100).toFixed(1);
        console.log(`  [OK] ${fileName} - ${cellCount} cells, 節省 ${(bytesSaved / 1024).toFixed(1)} KB (${percentage}%)`);

    } catch (err) {
        console.error(`  [ERROR] ${filePath}: ${err.message}`);
    }
}

// 主程式
console.log('=== S2 Cell 差量編碼工具 ===\n');
console.log(`目錄: ${SINGLE_DIR}\n`);

if (!fs.existsSync(SINGLE_DIR)) {
    console.error('目錄不存在！');
    process.exit(1);
}

const files = fs.readdirSync(SINGLE_DIR).filter(f => f.endsWith('.json'));
console.log(`找到 ${files.length} 個 JSON 檔案\n`);

for (const file of files) {
    processFile(path.join(SINGLE_DIR, file));
}

// 統計
console.log('\n=== 統計結果 ===');
console.log(`處理檔案數: ${totalFiles}`);
console.log(`處理 Cell 數: ${totalCells.toLocaleString()}`);
console.log(`總節省空間: ${(totalBytesSaved / 1024).toFixed(1)} KB (${(totalBytesSaved / 1024 / 1024).toFixed(2)} MB)`);
console.log('================\n');
