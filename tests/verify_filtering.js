
const decorRules = [
    { id: 'shrine', name: '神社', icon: '⛩️', tags: ['amenity=place_of_worship'], region: 'JP' },
    { id: 'restaurant', name: '餐廳', icon: '🍽️', tags: ['amenity=restaurant'] }
];

const pois = [
    { id: '1', lat: 25.0, lon: 121.5, decorType: 'shrine' }, // Taiwan
    { id: '2', lat: 35.0, lon: 139.7, decorType: 'shrine' }, // Japan
    { id: '3', lat: 25.0, lon: 121.5, decorType: 'restaurant' } // Taiwan
];

const selectedRules = decorRules;

function filterLocalPOIs(pois, selectedRules) {
    const ruleIds = new Set(selectedRules.map(r => r.id));
    const ruleMap = new Map(selectedRules.map(r => [r.id, r]));

    return pois.filter(poi => {
        const rule = ruleMap.get(poi.decorType);
        if (rule?.region === 'JP') {
            const isTaiwan = (poi.lat >= 21 && poi.lat <= 26.5 && poi.lon >= 118 && poi.lon <= 122.5);
            if (isTaiwan) return false;
        }
        return ruleIds.has(poi.decorType);
    });
}

const result = filterLocalPOIs(pois, selectedRules);
console.log('Result:', result);
if (result.find(p => p.id === '1')) {
    console.error('FAIL: Shrine in Taiwan was not filtered');
} else {
    console.log('PASS: Shrine in Taiwan was filtered');
}
