/**
 * 拆分 s2_l17_single.json 為各飾品類型獨立檔案
 * 用法: node scripts/split-single-cells.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'public/data/regions/taiwan_main_island/s2_l17_single.json';
const OUTPUT_DIR = 'public/data/regions/taiwan_main_island/single';

async function main() {
    console.log('📂 讀取原始檔案...');
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const data = JSON.parse(rawData);

    console.log(`📊 總格子數: ${data.cellCount}`);

    // 按 decorType 分組
    const cellsByType = new Map();

    for (const cell of data.cells) {
        const existing = cellsByType.get(cell.decorType) || [];
        existing.push(cell);
        cellsByType.set(cell.decorType, existing);
    }

    console.log(`🏷️ 共 ${cellsByType.size} 種飾品類型`);

    // 建立輸出目錄
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 寫入各類型檔案
    const indexData = [];

    for (const [decorType, cells] of cellsByType.entries()) {
        const fileName = `${decorType}.json`;
        const filePath = path.join(OUTPUT_DIR, fileName);

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
    const indexPath = path.join(OUTPUT_DIR, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify({
        regionId: data.regionId,
        level: data.level,
        generatedAt: new Date().toISOString(),
        totalCellCount: data.cellCount,
        types: indexData.sort((a, b) => b.cellCount - a.cellCount)
    }, null, 2));

    console.log(`\n📋 索引檔已建立: ${indexPath}`);
    console.log('✨ 拆分完成！');
}

main().catch(console.error);
