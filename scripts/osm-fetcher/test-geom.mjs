import { S2 } from 's2-geometry';

function isPointInPolygon(point, polygon) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon, yi = polygon[i].lat;
    const xj = polygon[j].lon, yj = polygon[j].lat;

    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
        (point.lon < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

export function getCoveredCellsL17(geometry) {
  const coveredCells = new Map();
  
  const addPoint = (lat, lon) => {
    const key = S2.latLngToKey(lat, lon, 17);
    if (!coveredCells.has(key)) {
      const center = S2.keyToLatLng(key);
      coveredCells.set(key, {lat: center.lat, lon: center.lng, key});
    }
  };

  const isClosed = geometry.length > 2 && 
    geometry[0].lat === geometry[geometry.length - 1].lat && 
    geometry[0].lon === geometry[geometry.length - 1].lon;

  if (isClosed) {
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    for (const pt of geometry) {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lon < minLon) minLon = pt.lon;
      if (pt.lon > maxLon) maxLon = pt.lon;
    }
    const STEP = 0.0002;
    for (let lat = minLat; lat <= maxLat + STEP; lat += STEP) {
      for (let lon = minLon; lon <= maxLon + STEP; lon += STEP) {
        if (isPointInPolygon({lat, lon}, geometry)) {
          addPoint(lat, lon);
        }
      }
    }
  } 

  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    addPoint(p1.lat, p1.lon);
    
    const dist = Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lon - p1.lon, 2));
    const STEP = 0.0002;
    if (dist > STEP) {
      const steps = Math.ceil(dist / STEP);
      for (let j = 1; j < steps; j++) {
        const fraction = j / steps;
        addPoint(
          p1.lat + (p2.lat - p1.lat) * fraction,
          p1.lon + (p2.lon - p1.lon) * fraction
        );
      }
    }
  }
  addPoint(geometry[geometry.length - 1].lat, geometry[geometry.length - 1].lon);

  return Array.from(coveredCells.values());
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const square = [
    {lat: 0, lon: 0},
    {lat: 0.1, lon: 0},
    {lat: 0.1, lon: 0.1},
    {lat: 0, lon: 0.1},
    {lat: 0, lon: 0}
  ];

  const cells = getCoveredCellsL17(square);
  console.log(`Square covering generated ${cells.length} cells`);
}
