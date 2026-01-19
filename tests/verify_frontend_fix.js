
// Mock useDecorRules
const decorRules = [
    { id: 'shrine', name: '神社', region: 'JP' },
    { id: 'restaurant', name: '餐廳' }, // No region
    { id: 'convenience', name: '便利商店', region: 'TW' } // Hypothetical
];

// Mock Data from JSON
const data = {
    cells: [
        { cellId: '1', decorType: 'shrine' },
        { cellId: '2', decorType: 'restaurant' },
        { cellId: '3', decorType: 'convenience' }
    ]
};

// The Logic from map.vue
const jpOnlyDecors = new Set(decorRules.filter(r => r.region === 'JP').map(r => r.id));

const filteredCells = (data.cells || [])
    .filter((cell) => !jpOnlyDecors.has(cell.decorType));

console.log('Filtered Cells:', filteredCells);

if (filteredCells.find(c => c.decorType === 'shrine')) {
    console.error('FAIL: Shrine was not filtered');
    process.exit(1);
}

if (!filteredCells.find(c => c.decorType === 'restaurant')) {
    console.error('FAIL: Restaurant was incorrectly filtered');
    process.exit(1);
}

console.log('PASS: Frontend logic works correctly');
