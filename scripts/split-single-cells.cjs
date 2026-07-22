/**
 * 拆分 s2_l17_single.json 為各飾品類型獨立檔案
 * 用法: node scripts/split-single-cells.js
 */

const fs = require('fs');
const path = require('path');

const REGION_DIR = path.join(__dirname, '..', 'public', 'data', 'regions', 'taiwan_main_island');
const INPUT_FILE = path.join(REGION_DIR, 's2_l17_single.json');
const OUTPUT_DIR = path.join(REGION_DIR, 'single');
const STAGING_DIR = path.join(REGION_DIR, 'single.staging');
const BACKUP_DIR = path.join(REGION_DIR, 'single.backup');

function recoverInterruptedSwap() {
    if (!fs.existsSync(BACKUP_DIR)) return;

    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.renameSync(BACKUP_DIR, OUTPUT_DIR);
    console.log('♻️ 已還原上次中斷前的純種分割資料');
}

function replaceOutputFromStaging() {
    if (fs.existsSync(BACKUP_DIR)) {
        fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.renameSync(OUTPUT_DIR, BACKUP_DIR);
    }

    try {
        fs.renameSync(STAGING_DIR, OUTPUT_DIR);
        if (fs.existsSync(BACKUP_DIR)) {
            fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
        }
    } catch (error) {
        if (fs.existsSync(OUTPUT_DIR)) {
            fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
        }
        if (fs.existsSync(BACKUP_DIR)) {
            fs.renameSync(BACKUP_DIR, OUTPUT_DIR);
        }
        throw error;
    }
}

async function main() {
    recoverInterruptedSwap();
    if (fs.existsSync(STAGING_DIR)) {
        fs.rmSync(STAGING_DIR, { recursive: true, force: true });
    }

    console.log('📂 讀取原始檔案...');
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const data = JSON.parse(rawData);
    if (!Array.isArray(data.cells)) {
        throw new Error(`輸入檔缺少 cells 陣列: ${INPUT_FILE}`);
    }
    if (data.cellCount !== data.cells.length) {
        throw new Error(`輸入格數不一致: cellCount=${data.cellCount}, cells=${data.cells.length}`);
    }

    console.log(`📊 總格子數: ${data.cellCount}`);

    // 按 decorType 分組
    const cellsByType = new Map();

    for (const cell of data.cells) {
        const existing = cellsByType.get(cell.decorType) || [];
        existing.push(cell);
        cellsByType.set(cell.decorType, existing);
    }

    console.log(`🏷️ 共 ${cellsByType.size} 種飾品類型`);

    // 先完整寫入暫存目錄，確認成功後才替換正式輸出。
    fs.mkdirSync(STAGING_DIR, { recursive: true });

    // 寫入各類型檔案
    const indexData = [];

    for (const [decorType, cells] of cellsByType.entries()) {
        const fileName = `${decorType}.json`;
        const filePath = path.join(STAGING_DIR, fileName);

        const typeData = {
            decorType,
            cellCount: cells.length,
            cells: cells.map(c => ({ cellId: c.cellId }))
        };

        fs.writeFileSync(filePath, JSON.stringify(typeData));

        const stats = fs.statSync(filePath);
        console.log(`  ✅ ${decorType}: ${cells.length} 格 (${(stats.size / 1024).toFixed(1)} KB)`);

        indexData.push({
            decorType,
            cellCount: cells.length,
            file: fileName
        });
    }

    // 寫入索引檔
    const indexPath = path.join(STAGING_DIR, 'index.json');
    const splitCellCount = indexData.reduce((sum, item) => sum + item.cellCount, 0);
    if (splitCellCount !== data.cells.length) {
        throw new Error(`拆分數量不一致: input=${data.cells.length}, output=${splitCellCount}`);
    }
    fs.writeFileSync(indexPath, JSON.stringify({
        regionId: data.regionId,
        level: data.level,
        generatedAt: new Date().toISOString(),
        totalCellCount: splitCellCount,
        types: indexData.sort((a, b) => b.cellCount - a.cellCount)
    }, null, 2));

    replaceOutputFromStaging();
    console.log(`\n📋 索引檔已建立: ${path.join(OUTPUT_DIR, 'index.json')}`);
    console.log('✨ 拆分完成！');
}

main().catch((error) => {
    if (fs.existsSync(STAGING_DIR)) {
        fs.rmSync(STAGING_DIR, { recursive: true, force: true });
    }
    if (!fs.existsSync(OUTPUT_DIR) && fs.existsSync(BACKUP_DIR)) {
        fs.renameSync(BACKUP_DIR, OUTPUT_DIR);
    }
    console.error(error);
    process.exitCode = 1;
});
