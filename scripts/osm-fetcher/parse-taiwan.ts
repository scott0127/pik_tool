import fs from 'fs';
import { createHash } from 'crypto';
import { join, dirname, basename, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';
import parse from 'osm-pbf-parser';
import through from 'through2';
import { REGIONS } from './regions.js';
import type { CompressedFeature, BoundingBox } from './types';
// @ts-ignore
import { S2 } from 's2-geometry';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * parse-taiwan.fixed.ts
 *
 * 目的：從本地 taiwan-latest.osm.pbf 解析 Pikmin Bloom 地圖用資料。
 * 注意：輸出的 pois[] 是「前端可顯示/可投影到 S2 L17 的 decor instances」，
 *       不完全等於嚴格意義上的真實 OSM POI 數量。
 *
 * 修正重點：
 * - 不再硬編 pass processed = 32,000,000。
 * - 不再把 bbox 外資料 clamp 到邊界 chunk；bbox 外直接 skip 並統計。
 * - Relation 保留 member role，對 multipolygon-like relation 嘗試組 outer/inner rings。
 * - Pass 2 / Pass 3 會輸出 missing way/node 統計。
 * - 大面積 polygon 會自動調整取樣 step，避免單一 feature 爆炸式掃描。
 * - 保留前端相容輸出格式：chunk_*.json 內仍使用 { bbox, pois }。
 */

type DecorRule = {
  id: string;
  name: string;
  icon: string;
  tags: string[];
};

type Coord = { lat: number; lon: number };
type CoveredCell = { lat: number; lon: number; key: string };

type MatchedWay = {
  id: string;
  osmId: string;
  refs: string[];
  name: string;
  decorType: string;
  decorName: string;
  decorIcon: string;
};

type RelationMember = {
  id: string;
  role: string;
};

type MatchedRelation = {
  id: string;
  osmId: string;
  wayMembers: RelationMember[];
  name: string;
  decorType: string;
  decorName: string;
  decorIcon: string;
};

interface ChunkData {
  id: string;
  row: number;
  col: number;
  bbox: BoundingBox;
  features: CompressedFeature[];
}

interface ParseStats {
  rawNodes: number;
  rawWays: number;
  rawRelations: number;
  taggedNodes: number;
  taggedWays: number;
  taggedRelations: number;
  targetNodes: number;
  targetWays: number;
  targetRelations: number;
  requiredRelationWays: number;
  foundRelationWays: number;
  missingRelationWays: number;
  requiredNodeCoords: number;
  foundNodeCoords: number;
  missingNodeCoords: number;
  generatedDecorInstances: number;
  realPointPois: number;
  areaOrLineDecorInstances: number;
  skippedOutsideBbox: number;
  skippedInvalidCoords: number;
  skippedEmptyGeometry: number;
  waysWithMissingCoords: number;
  relationsWithMissingWays: number;
  relationsWithMissingCoords: number;
  relationOuterRingsBuilt: number;
  relationInnerRingsBuilt: number;
  relationOpenWaysUsedAsLines: number;
  areaSamplingCoarsened: number;
  maxFeatureCellLimitHit: number;
  poisByType: Record<string, number>;
}

const DECOR_RULES: DecorRule[] = [
  // 餐飲類
  { id: 'restaurant', name: '餐廳', icon: '🍽️', tags: ['amenity=restaurant'] },
  { id: 'cafe', name: '咖啡廳', icon: '☕', tags: ['amenity=cafe'] },
  { id: 'sweetshop', name: '甜點店', icon: '🍰', tags: ['shop=pastry', 'shop=confectionery', 'shop=chocolate'] },
  { id: 'bakery', name: '麵包店', icon: '🥐', tags: ['shop=bakery'] },
  { id: 'burger', name: '漢堡店', icon: '🍔', tags: ['amenity=fast_food'] },
  { id: 'italian', name: '義式餐廳', icon: '🍕', tags: ['cuisine=pizza', 'cuisine=italian', 'cuisine=mediterranean', 'cuisine=pasta'] },
  { id: 'ramen', name: '拉麵店', icon: '🥡', tags: ['cuisine=ramen', 'cuisine=noodle', 'cuisine=chinese', 'cuisine=udon', 'cuisine=soba'] },
  { id: 'sushi', name: '壽司店', icon: '🍣', tags: ['cuisine=sushi'] },
  { id: 'curry', name: '咖哩餐廳', icon: '🍛', tags: ['cuisine=curry', 'cuisine=indian', 'cuisine=sri_lankan'] },
  { id: 'korean', name: '韓式餐廳', icon: '🇰🇷', tags: ['cuisine=korean'] },
  { id: 'taco', name: '墨西哥餐廳', icon: '🌮', tags: ['cuisine=mexican'] },

  // 購物類
  { id: 'convenience', name: '便利商店', icon: '🏪', tags: ['shop=convenience'] },
  { id: 'supermarket', name: '超市', icon: '🛒', tags: ['shop=supermarket', 'shop=greengrocer'] },
  { id: 'cosmetics', name: '化妝品商店', icon: '💄', tags: ['shop=department_store', 'shop=cosmetics', 'shop=beauty'] },
  { id: 'clothing', name: '服飾店', icon: '👔', tags: ['shop=clothes', 'shop=shoes', 'shop=fashion'] },
  { id: 'electronics', name: '電器行', icon: '🔌', tags: ['shop=appliance', 'shop=electronics', 'shop=computer', 'shop=mobile_phone'] },
  { id: 'hardware', name: '五金行', icon: '🔧', tags: ['shop=doityourself', 'shop=hardware', 'shop=tools'] },
  { id: 'library', name: '圖書館／書店', icon: '📚', tags: ['amenity=library', 'shop=books'] },
  { id: 'stationery', name: '文具店', icon: '✏️', tags: ['shop=stationery', 'shop=craft'] },

  // 生活服務類
  { id: 'pharmacy', name: '藥局', icon: '💊', tags: ['amenity=pharmacy', 'shop=chemist', 'healthcare=pharmacy'] },
  { id: 'hair_salon', name: '美髮院', icon: '💇', tags: ['shop=hairdresser'] },
  { id: 'laundry', name: '自主洗衣店&乾洗店', icon: '🧺', tags: ['shop=laundry', 'shop=dry_cleaning'] },
  { id: 'post_office', name: '郵局', icon: '✉️', tags: ['amenity=post_office', 'amenity=post_box'] },
  { id: 'hotel', name: '飯店', icon: '🏨', tags: ['tourism=hotel', 'tourism=motel', 'tourism=hostel', 'tourism=guest_house'] },
  { id: 'university', name: '大學&學院', icon: '🎓', tags: ['amenity=university', 'amenity=college', 'building=university'] },
  { id: 'movie_theater', name: '電影院', icon: '🎬', tags: ['amenity=cinema'] },

  // 交通類
  { id: 'station', name: '車站', icon: '🚂', tags: ['railway=station', 'building=train_station', 'railway=subway_entrance', 'public_transport=station'] },
  { id: 'bus_stop', name: '公車站', icon: '🚌', tags: ['highway=bus_stop', 'amenity=bus_station', 'public_transport=platform'] },
  { id: 'airport', name: '機場', icon: '✈️', tags: ['aeroway=aerodrome', 'aeroway=terminal', 'aeroway=gate'] },
  { id: 'bridge', name: '橋樑', icon: '🌉', tags: ['bridge=yes', 'man_made=bridge'] },

  // 戶外休閒類
  { id: 'park', name: '公園', icon: '🍀', tags: ['leisure=park', 'leisure=garden', 'leisure=playground', 'landuse=village_green'] },
  { id: 'forest', name: '森林', icon: '🌲', tags: ['natural=wood', 'landuse=forest'] },
  { id: 'waterside', name: '水邊', icon: '🌊', tags: ['natural=water', 'natural=wetland', 'waterway=river', 'waterway=stream', 'waterway=canal'] },
  { id: 'beach', name: '海邊', icon: '🏖️', tags: ['natural=beach'] },
  { id: 'mountain', name: '山丘', icon: '⛰️', tags: ['natural=peak', 'natural=cliff', 'natural=bare_rock'] },
  { id: 'zoo', name: '動物園', icon: '🦁', tags: ['tourism=zoo', 'tourism=aquarium'] },
  { id: 'theme_park', name: '主題樂園', icon: '🎢', tags: ['tourism=theme_park', 'leisure=water_park'] },
  { id: 'art_gallery', name: '美術館', icon: '🎨', tags: ['tourism=museum', 'tourism=gallery', 'shop=art', 'amenity=arts_centre'] },
  { id: 'stadium', name: '體育館', icon: '🏟️', tags: ['leisure=stadium', 'leisure=sports_centre', 'building=stadium'] },
  { id: 'shrine', name: '神社', icon: '⛩️', tags: ['amenity=place_of_worship'] },
];
const DECOR_RULESET_SHA256 = createHash('sha256')
  .update(JSON.stringify(DECOR_RULES))
  .digest('hex');

const STATUS_FILE = join(__dirname, 'dashboard-local-status.json');
const REGION_ID = process.env.OSM_REGION_ID || 'taiwan_main_island';
const REGION = REGIONS[REGION_ID];
if (!REGION) throw new Error(`Unknown region: ${REGION_ID}`);

const S2_LEVEL = Number(process.env.OSM_S2_LEVEL || 17);
const BASE_SAMPLE_STEP_DEG = Number(process.env.OSM_SAMPLE_STEP_DEG || 0.0002);
const MAX_AREA_SAMPLE_POINTS = Number(process.env.OSM_MAX_AREA_SAMPLE_POINTS || 1_200_000);
// 0 means disabled. Keep disabled by default so the dataset is not silently truncated.
const MAX_CELLS_PER_FEATURE = Number(process.env.OSM_MAX_CELLS_PER_FEATURE || 0);

let dashboardStatus = {
  phase: 'Pass 1',
  pass1Processed: 0,
  pass2Processed: 0,
  pass3Processed: 0,
  foundNodes: 0,
  foundWays: 0,
  foundRelations: 0,
  requiredWays: 0,
  requiredNodes: 0,
  logs: [] as string[],
  stats: {
    totalPOIs: 0,
    generatedDecorInstances: 0,
    startTime: new Date().toISOString(),
    poisByType: {} as Record<string, number>,
  },
  isRunning: true,
};

const dashboardLogs: string[] = [];

function addLog(msg: string) {
  const ts = new Date().toLocaleTimeString('zh-TW', { hour12: false });
  const line = `[${ts}] ${msg}`;
  dashboardLogs.push(line);
  if (dashboardLogs.length > 200) dashboardLogs.shift();
  dashboardStatus.logs = dashboardLogs;
  writeStatus();
}

function writeStatus() {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(dashboardStatus), 'utf-8');
  } catch {
    // Dashboard status is best-effort only.
  }
}

function createStats(): ParseStats {
  return {
    rawNodes: 0,
    rawWays: 0,
    rawRelations: 0,
    taggedNodes: 0,
    taggedWays: 0,
    taggedRelations: 0,
    targetNodes: 0,
    targetWays: 0,
    targetRelations: 0,
    requiredRelationWays: 0,
    foundRelationWays: 0,
    missingRelationWays: 0,
    requiredNodeCoords: 0,
    foundNodeCoords: 0,
    missingNodeCoords: 0,
    generatedDecorInstances: 0,
    realPointPois: 0,
    areaOrLineDecorInstances: 0,
    skippedOutsideBbox: 0,
    skippedInvalidCoords: 0,
    skippedEmptyGeometry: 0,
    waysWithMissingCoords: 0,
    relationsWithMissingWays: 0,
    relationsWithMissingCoords: 0,
    relationOuterRingsBuilt: 0,
    relationInnerRingsBuilt: 0,
    relationOpenWaysUsedAsLines: 0,
    areaSamplingCoarsened: 0,
    maxFeatureCellLimitHit: 0,
    poisByType: {},
  };
}

function isFiniteCoord(lat: unknown, lon: unknown): lat is number {
  return typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon);
}

function isWithinBbox(lat: number, lon: number, bbox: BoundingBox) {
  return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}

function countRawAndTagged(item: any, stats: ParseStats) {
  const hasTags = item.tags && Object.keys(item.tags).length > 0;
  if (item.type === 'node') {
    stats.rawNodes++;
    if (hasTags) stats.taggedNodes++;
  } else if (item.type === 'way') {
    stats.rawWays++;
    if (hasTags) stats.taggedWays++;
  } else if (item.type === 'relation') {
    stats.rawRelations++;
    if (hasTags) stats.taggedRelations++;
  }
}

function getMemberId(member: any): string | null {
  const id = member?.id ?? member?.ref;
  return id === undefined || id === null ? null : String(id);
}

function tagValueMatches(actual: string | undefined, expected: string) {
  if (!actual) return false;
  if (actual === expected) return true;
  // Some OSM tags use semicolon lists: cuisine=italian;pizza.
  return actual.split(/[;,]/).map(v => v.trim()).includes(expected);
}

function matchDecorRule(tags: Record<string, string>) {
  for (const rule of DECOR_RULES) {
    for (const tag of rule.tags) {
      const [key, value] = tag.split('=');
      if (!key || value === undefined) continue;
      if (tagValueMatches(tags[key], value)) return rule;
    }
  }
  return null;
}

function getName(tags: Record<string, string>, defaultName: string) {
  return tags['name:zh-TW'] || tags['name:zh'] || tags.name || tags['name:en'] || defaultName;
}

function coordsEqual(a: Coord, b: Coord, eps = 1e-12) {
  return Math.abs(a.lat - b.lat) <= eps && Math.abs(a.lon - b.lon) <= eps;
}

function isClosedGeometry(geometry: Coord[]) {
  return geometry.length > 3 && coordsEqual(geometry[0], geometry[geometry.length - 1]);
}

function isClosedRefs(refs: string[]) {
  return refs.length > 3 && refs[0] === refs[refs.length - 1];
}

function isPointInPolygon(point: Coord, polygon: Coord[]) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lon < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

function getGeometryBounds(geometry: Coord[]) {
  let minLat = 90;
  let maxLat = -90;
  let minLon = 180;
  let maxLon = -180;
  for (const pt of geometry) {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lon < minLon) minLon = pt.lon;
    if (pt.lon > maxLon) maxLon = pt.lon;
  }
  return { minLat, maxLat, minLon, maxLon };
}

function getCoveredCellsL17(geometry: Coord[], regionBbox: BoundingBox, stats: ParseStats): CoveredCell[] {
  if (geometry.length === 0) return [];

  const coveredCells = new Map<string, CoveredCell>();

  const addPoint = (lat: number, lon: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    if (!isWithinBbox(lat, lon, regionBbox)) return;

    const key = S2.latLngToKey(lat, lon, S2_LEVEL);
    if (coveredCells.has(key)) return;

    if (MAX_CELLS_PER_FEATURE > 0 && coveredCells.size >= MAX_CELLS_PER_FEATURE) {
      stats.maxFeatureCellLimitHit++;
      return;
    }

    const center = S2.keyToLatLng(key);
    if (!isWithinBbox(center.lat, center.lng, regionBbox)) return;
    coveredCells.set(key, { lat: center.lat, lon: center.lng, key });
  };

  const closed = isClosedGeometry(geometry);
  if (closed) {
    const { minLat, maxLat, minLon, maxLon } = getGeometryBounds(geometry);
    const latRange = Math.max(0, maxLat - minLat);
    const lonRange = Math.max(0, maxLon - minLon);
    let step = BASE_SAMPLE_STEP_DEG;
    const estimatedSamples = ((latRange / step) + 1) * ((lonRange / step) + 1);

    if (estimatedSamples > MAX_AREA_SAMPLE_POINTS) {
      step = Math.sqrt((latRange * lonRange) / MAX_AREA_SAMPLE_POINTS);
      step = Math.max(step, BASE_SAMPLE_STEP_DEG);
      stats.areaSamplingCoarsened++;
    }

    for (let lat = minLat; lat <= maxLat + step; lat += step) {
      for (let lon = minLon; lon <= maxLon + step; lon += step) {
        if (isPointInPolygon({ lat, lon }, geometry)) addPoint(lat, lon);
      }
    }
  }

  // Always include boundaries / open line samples. This matters for roads, rivers, bridges,
  // and multipolygon fragments that cannot be safely closed.
  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    addPoint(p1.lat, p1.lon);

    const distDeg = Math.sqrt((p2.lat - p1.lat) ** 2 + (p2.lon - p1.lon) ** 2);
    if (distDeg > BASE_SAMPLE_STEP_DEG) {
      const steps = Math.ceil(distDeg / BASE_SAMPLE_STEP_DEG);
      for (let j = 1; j < steps; j++) {
        const fraction = j / steps;
        addPoint(
          p1.lat + (p2.lat - p1.lat) * fraction,
          p1.lon + (p2.lon - p1.lon) * fraction,
        );
      }
    }
  }

  const last = geometry[geometry.length - 1];
  addPoint(last.lat, last.lon);
  return Array.from(coveredCells.values());
}

function refsToGeometry(refs: string[], nodeCoords: Map<string, Coord>, stats?: ParseStats): Coord[] {
  const geometry: Coord[] = [];
  let missing = 0;
  for (const ref of refs) {
    const coord = nodeCoords.get(ref);
    if (coord) geometry.push(coord);
    else missing++;
  }
  if (stats && missing > 0) stats.relationsWithMissingCoords++;
  return geometry;
}

function centroid(geometry: Coord[]) {
  const lat = geometry.reduce((sum, p) => sum + p.lat, 0) / geometry.length;
  const lon = geometry.reduce((sum, p) => sum + p.lon, 0) / geometry.length;
  return { lat, lon };
}

function addFeaturePois(
  features: CompressedFeature[],
  sourceId: string,
  geometry: Coord[],
  props: { n: string, t: string },
  regionBbox: BoundingBox,
  stats: ParseStats,
) {
  if (geometry.length === 0) {
    stats.skippedEmptyGeometry++;
    return;
  }

  const cells = getCoveredCellsL17(geometry, regionBbox, stats);
  if (cells.length === 0) {
    const c = centroid(geometry);
    if (!isWithinBbox(c.lat, c.lon, regionBbox)) {
      stats.skippedOutsideBbox++;
      return;
    }
    features.push({
      id: sourceId,
      t: props.t,
      n: props.n,
      pts: [[Number(c.lat.toFixed(5)), Number(c.lon.toFixed(5))]]
    });
    stats.generatedDecorInstances++;
    stats.areaOrLineDecorInstances++;
    return;
  }

  features.push({
    id: sourceId,
    t: props.t,
    n: props.n,
    pts: cells.map(cell => [Number(cell.lat.toFixed(5)), Number(cell.lon.toFixed(5))])
  });
  stats.generatedDecorInstances += cells.length;
  stats.areaOrLineDecorInstances += cells.length;
}

function reverseRefs(refs: string[]) {
  return [...refs].reverse();
}

function stitchClosedRingsFromWays(segments: string[][]) {
  const pending = segments
    .filter(seg => seg.length > 1)
    .map(seg => [...seg]);
  const rings: string[][] = [];
  const open: string[][] = [];

  while (pending.length > 0) {
    let current = pending.shift()!;
    let changed = true;

    while (changed && !isClosedRefs(current)) {
      changed = false;
      for (let i = 0; i < pending.length; i++) {
        const seg = pending[i];
        const curFirst = current[0];
        const curLast = current[current.length - 1];
        const segFirst = seg[0];
        const segLast = seg[seg.length - 1];

        if (curLast === segFirst) {
          current = current.concat(seg.slice(1));
        } else if (curLast === segLast) {
          current = current.concat(reverseRefs(seg).slice(1));
        } else if (curFirst === segLast) {
          current = seg.slice(0, -1).concat(current);
        } else if (curFirst === segFirst) {
          current = reverseRefs(seg).slice(0, -1).concat(current);
        } else {
          continue;
        }

        pending.splice(i, 1);
        changed = true;
        break;
      }
    }

    if (isClosedRefs(current)) rings.push(current);
    else open.push(current);
  }

  return { rings, open };
}

async function parsePbf(pbfPath: string, regionBbox: BoundingBox, stats: ParseStats): Promise<CompressedFeature[]> {
  addLog('🔄 Pass 1: 掃描 PBF，找出目標 Node, Way 與 Relation...');
  console.log('Pass 1: 找出目標 Node, Way, Relation...');
  dashboardStatus.phase = 'Pass 1';
  writeStatus();

  const matchedNodes: CompressedFeature[] = [];
  const matchedWays: MatchedWay[] = [];
  const matchedRelations: MatchedRelation[] = [];
  const requiredWayIds = new Set<string>();
  const requiredNodeIds = new Set<string>();
  let pass1FinalCount = 0;

  await new Promise<void>((resolve, reject) => {
    let count = 0;
    fs.createReadStream(pbfPath)
      .pipe(parse())
      .pipe(through.obj((items, _enc, next) => {
        for (const item of items) {
          count++;
          pass1FinalCount = count;
          countRawAndTagged(item, stats);

          if (count % 50_000 === 0) {
            dashboardStatus.pass1Processed = count;
            dashboardStatus.foundNodes = matchedNodes.length;
            dashboardStatus.foundWays = matchedWays.length;
            dashboardStatus.foundRelations = matchedRelations.length;
            writeStatus();
          }
          if (count % 2_000_000 === 0) console.log(`  [Pass 1] 處理了 ${count.toLocaleString()} 個元素...`);

          if (!item.tags || Object.keys(item.tags).length === 0) continue;
          const rule = matchDecorRule(item.tags);
          if (!rule) continue;

          const name = getName(item.tags, `未命名${rule.name}`);
          const props = {
            name,
            decorType: rule.id, decorName: rule.name, decorIcon: rule.icon,
          };

          if (item.type === 'node') {
            stats.targetNodes++;
            if (!isFiniteCoord(item.lat, item.lon)) {
              stats.skippedInvalidCoords++;
              continue;
            }
            if (!isWithinBbox(item.lat, item.lon, regionBbox)) {
              stats.skippedOutsideBbox++;
              continue;
            }
            matchedNodes.push({ id: `node-${item.id}`, t: props.decorType, n: props.name, pts: [[Number(item.lat.toFixed(5)), Number(item.lon.toFixed(5))]] });
            stats.generatedDecorInstances++;
            stats.realPointPois++;
          } else if (item.type === 'way' && Array.isArray(item.refs) && item.refs.length > 0) {
            stats.targetWays++;
            const refs = item.refs.map(String);
            matchedWays.push({ id: `way-${item.id}`, osmId: String(item.id), refs, ...props });
            for (const ref of refs) requiredNodeIds.add(ref);
          } else if (item.type === 'relation' && Array.isArray(item.members)) {
            const wayMembers = item.members
              .filter((m: any) => m.type === 'way')
              .map((m: any) => {
                const id = getMemberId(m);
                return id ? { id, role: String(m.role || '') } : null;
              })
              .filter((m: RelationMember | null): m is RelationMember => Boolean(m));

            if (wayMembers.length > 0) {
              stats.targetRelations++;
              matchedRelations.push({ id: `relation-${item.id}`, osmId: String(item.id), wayMembers, ...props });
              for (const member of wayMembers) requiredWayIds.add(member.id);
            }
          }
        }
        next();
      }))
      .on('finish', resolve)
      .on('error', reject);
  });

  dashboardStatus.pass1Processed = pass1FinalCount;
  dashboardStatus.foundNodes = matchedNodes.length;
  dashboardStatus.foundWays = matchedWays.length;
  dashboardStatus.foundRelations = matchedRelations.length;
  dashboardStatus.requiredWays = requiredWayIds.size;
  dashboardStatus.requiredNodes = requiredNodeIds.size;
  dashboardStatus.phase = 'Pass 2';
  writeStatus();

  stats.requiredRelationWays = requiredWayIds.size;
  stats.requiredNodeCoords = requiredNodeIds.size;

  addLog(`✅ Pass 1 完成。target Nodes: ${matchedNodes.length}, target Ways: ${matchedWays.length}, target Relations: ${matchedRelations.length}`);
  console.log(`Pass 1 完成。Relation 需要查 Way 數量: ${requiredWayIds.size.toLocaleString()}`);

  addLog('🔄 Pass 2: 查詢 Relation 所需的 Way...');
  console.log('Pass 2: 查詢 Relation 的 Way...');

  const relationWayRefs = new Map<string, string[]>();
  let pass2FinalCount = 0;

  await new Promise<void>((resolve, reject) => {
    if (requiredWayIds.size === 0) return resolve();
    let count = 0;
    const pbfStream = fs.createReadStream(pbfPath).pipe(parse());
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    pbfStream
      .pipe(through.obj((items, _enc, next) => {
        for (const item of items) {
          count++;
          pass2FinalCount = count;
          if (count % 50_000 === 0) {
            dashboardStatus.pass2Processed = count;
            dashboardStatus.requiredNodes = requiredNodeIds.size;
            writeStatus();
          }
          if (count % 2_000_000 === 0) console.log(`  [Pass 2] 尋找 Way 中... 已處理 ${count.toLocaleString()} 元素`);

          if (item.type === 'way' && requiredWayIds.has(String(item.id)) && Array.isArray(item.refs)) {
            const refs = item.refs.map(String);
            relationWayRefs.set(String(item.id), refs);
            for (const ref of refs) requiredNodeIds.add(ref);

            if (relationWayRefs.size === requiredWayIds.size) {
              console.log('  ✅ 已找齊所有 Relation 需要的 Way！');
              pbfStream.destroy();
              finish();
              return;
            }
          }
        }
        next();
      }))
      .on('finish', finish)
      .on('error', (err) => {
        if (resolved || err.message === 'Premature close') finish();
        else reject(err);
      });
  });

  stats.foundRelationWays = relationWayRefs.size;
  stats.missingRelationWays = Math.max(0, requiredWayIds.size - relationWayRefs.size);
  stats.requiredNodeCoords = requiredNodeIds.size;
  stats.relationsWithMissingWays = stats.missingRelationWays;

  dashboardStatus.pass2Processed = pass2FinalCount;
  dashboardStatus.requiredNodes = requiredNodeIds.size;
  dashboardStatus.phase = 'Pass 3';
  writeStatus();

  if (stats.missingRelationWays > 0) {
    console.warn(`⚠️ Missing relation ways: ${stats.missingRelationWays.toLocaleString()}`);
  }
  addLog(`✅ Pass 2 完成。擴充後需要查詢 ${requiredNodeIds.size.toLocaleString()} 個 Node 座標。`);
  console.log(`Pass 2 完成。需要查座標的 Node: ${requiredNodeIds.size.toLocaleString()}`);

  addLog('🔄 Pass 3: 查詢所有需要的 Node 座標...');
  console.log('Pass 3: 查詢 Node 座標...');

  const nodeCoords = new Map<string, Coord>();
  let pass3FinalCount = 0;

  await new Promise<void>((resolve, reject) => {
    if (requiredNodeIds.size === 0) return resolve();
    let count = 0;
    const pbfStream = fs.createReadStream(pbfPath).pipe(parse());
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    pbfStream
      .pipe(through.obj((items, _enc, next) => {
        for (const item of items) {
          count++;
          pass3FinalCount = count;
          if (count % 50_000 === 0) {
            dashboardStatus.pass3Processed = count;
            writeStatus();
          }
          if (count % 2_000_000 === 0) console.log(`  [Pass 3] 尋找座標中... 已處理 ${count.toLocaleString()} 元素`);

          if (item.type === 'node' && requiredNodeIds.has(String(item.id))) {
            if (!isFiniteCoord(item.lat, item.lon)) {
              stats.skippedInvalidCoords++;
              continue;
            }
            nodeCoords.set(String(item.id), { lat: item.lat, lon: item.lon });
            if (nodeCoords.size === requiredNodeIds.size) {
              console.log('  ✅ 已找齊所有需要的 Node 座標！');
              pbfStream.destroy();
              finish();
              return;
            }
          }
        }
        next();
      }))
      .on('finish', finish)
      .on('error', (err) => {
        if (resolved || err.message === 'Premature close') finish();
        else reject(err);
      });
  });

  stats.foundNodeCoords = nodeCoords.size;
  stats.missingNodeCoords = Math.max(0, requiredNodeIds.size - nodeCoords.size);

  dashboardStatus.pass3Processed = pass3FinalCount;
  dashboardStatus.phase = 'Generating';
  writeStatus();

  if (stats.missingNodeCoords > 0) {
    console.warn(`⚠️ Missing node coords: ${stats.missingNodeCoords.toLocaleString()}`);
  }

  addLog('✅ Pass 3 完成。開始幾何計算與分裝 decor instances...');
  console.log('Pass 3 完成。開始幾何計算與 S2 展開...');

  const features: CompressedFeature[] = [...matchedNodes];

  for (const way of matchedWays) {
    const geometry = way.refs
      .map(ref => nodeCoords.get(ref))
      .filter((coord): coord is Coord => coord !== undefined);

    if (geometry.length === 0) {
      stats.skippedEmptyGeometry++;
      continue;
    }
    if (geometry.length < way.refs.length) stats.waysWithMissingCoords++;

    addFeaturePois(
      features,
      way.id,
      geometry,
      {
        n: way.name,
        t: way.decorType,
      },
      regionBbox,
      stats,
    );
  }

  for (const rel of matchedRelations) {
    const allCells = new Map<string, CoveredCell>();
    const allCoords: Coord[] = [];

    const outerSegments = rel.wayMembers
      .filter(m => m.role !== 'inner')
      .map(m => relationWayRefs.get(m.id))
      .filter((refs): refs is string[] => Array.isArray(refs) && refs.length > 1);

    const innerSegments = rel.wayMembers
      .filter(m => m.role === 'inner')
      .map(m => relationWayRefs.get(m.id))
      .filter((refs): refs is string[] => Array.isArray(refs) && refs.length > 1);

    if (outerSegments.length === 0) {
      stats.relationsWithMissingWays++;
      continue;
    }

    const outer = stitchClosedRingsFromWays(outerSegments);
    const inner = stitchClosedRingsFromWays(innerSegments);
    stats.relationOuterRingsBuilt += outer.rings.length;
    stats.relationInnerRingsBuilt += inner.rings.length;
    stats.relationOpenWaysUsedAsLines += outer.open.length;

    for (const ringRefs of outer.rings) {
      const geometry = refsToGeometry(ringRefs, nodeCoords);
      allCoords.push(...geometry);
      const cells = getCoveredCellsL17(geometry, regionBbox, stats);
      for (const cell of cells) allCells.set(cell.key, cell);
    }

    // Remove inner rings / holes when they are available.
    for (const ringRefs of inner.rings) {
      const geometry = refsToGeometry(ringRefs, nodeCoords);
      const cells = getCoveredCellsL17(geometry, regionBbox, stats);
      for (const cell of cells) allCells.delete(cell.key);
    }

    // Open outer fragments still contribute as line-like evidence instead of being silently dropped.
    for (const openRefs of outer.open) {
      const geometry = refsToGeometry(openRefs, nodeCoords);
      allCoords.push(...geometry);
      const cells = getCoveredCellsL17(geometry, regionBbox, stats);
      for (const cell of cells) allCells.set(cell.key, cell);
    }

    if (allCoords.length === 0 && allCells.size === 0) {
      stats.skippedEmptyGeometry++;
      continue;
    }

    const props = { n: rel.name, t: rel.decorType };

    if (allCells.size === 0) {
      const c = centroid(allCoords);
      if (!isWithinBbox(c.lat, c.lon, regionBbox)) {
        stats.skippedOutsideBbox++;
        continue;
      }
      features.push({ id: rel.id, t: props.t, n: props.n, pts: [[Number(c.lat.toFixed(5)), Number(c.lon.toFixed(5))]] });
      stats.generatedDecorInstances++;
      stats.areaOrLineDecorInstances++;
    } else {
      features.push({ id: rel.id, t: props.t, n: props.n, pts: Array.from(allCells.values()).map(cell => [Number(cell.lat.toFixed(5)), Number(cell.lon.toFixed(5))]) });
      stats.generatedDecorInstances += allCells.size;
      stats.areaOrLineDecorInstances += allCells.size;
    }
  }

  return features;
}

function makeChunks(regionBbox: BoundingBox, gridSize: number): ChunkData[] {
  const { north, south, east, west } = regionBbox;
  const latStep = (north - south) / gridSize;
  const lonStep = (east - west) / gridSize;
  const chunks: ChunkData[] = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      chunks.push({
        id: `${i}_${j}`,
        row: i,
        col: j,
        bbox: {
          south: south + i * latStep,
          north: south + (i + 1) * latStep,
          west: west + j * lonStep,
          east: west + (j + 1) * lonStep,
        },
        features: [],
      });
    }
  }
  return chunks;
}

function cleanChunkDir(outputDir: string) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  for (const file of fs.readdirSync(outputDir)) {
    if (file.startsWith('chunk_') && file.endsWith('.json')) {
      fs.rmSync(join(outputDir, file), { force: true });
    }
  }
}

async function main() {
  const pbfArgument = process.env.OSM_PBF_PATH || process.argv[2];
  if (!pbfArgument) {
    console.error('❌ 請提供 PBF 路徑：OSM_PBF_PATH="C:\\path\\taiwan-latest.osm.pbf" pnpm exec tsx scripts/osm-fetcher/parse-taiwan.ts');
    process.exit(1);
  }
  const pbfPath = resolvePath(pbfArgument);
  if (!fs.existsSync(pbfPath)) {
    console.error(`❌ 找不到 PBF 檔案: ${pbfPath}`);
    process.exit(1);
  }
  const pbfFileStats = fs.statSync(pbfPath);

  const region = REGION;
  const gridSize = Number(process.env.OSM_CHUNK_GRID || 15);
  const outputDir = process.env.OSM_CHUNKS_DIR || join(__dirname, '../../app/data/regions/taiwan_chunks');
  const stats = createStats();

  cleanChunkDir(outputDir);

  dashboardStatus.isRunning = true;
  dashboardStatus.phase = 'Pass 1';
  writeStatus();
  addLog(`🚀 開始本地解析 PBF 檔案：${pbfPath}`);
  addLog(`📦 Region: ${region.id}, chunk grid: ${gridSize}x${gridSize}, S2 L${S2_LEVEL}`);

  const allFeatures = await parsePbf(pbfPath, region.bbox, stats);

  addLog(`🔄 正在將 ${allFeatures.length.toLocaleString()} 個 decor instances 分裝至 ${gridSize}x${gridSize} chunk...`);

  const chunks = makeChunks(region.bbox, gridSize);
  const { north, south, east, west } = region.bbox;
  const latStep = (north - south) / gridSize;
  const lonStep = (east - west) / gridSize;
  let finalSkippedOutside = 0;
  let finalSkippedInvalid = 0;

  for (const feat of allFeatures) {
    if (feat.pts.length === 0) continue;
    

    stats.poisByType[feat.t] = (stats.poisByType[feat.t] || 0) + feat.pts.length;

    const row = Math.min(gridSize - 1, Math.max(0, Math.floor((feat.pts[0][0] - south) / latStep)));
    const col = Math.min(gridSize - 1, Math.max(0, Math.floor((feat.pts[0][1] - west) / lonStep)));
    chunks[row * gridSize + col].features.push(feat);
  }

  stats.skippedOutsideBbox += finalSkippedOutside;
  stats.skippedInvalidCoords += finalSkippedInvalid;

  dashboardStatus.stats.totalPOIs = allFeatures.length - finalSkippedOutside - finalSkippedInvalid;
  dashboardStatus.stats.generatedDecorInstances = dashboardStatus.stats.totalPOIs;
  dashboardStatus.stats.poisByType = stats.poisByType;
  dashboardStatus.stats.fullStats = stats;
  dashboardStatus.phase = 'Writing Chunks';
  writeStatus();

  addLog('💾 正在寫入 Chunk JSON...');
  for (const chunk of chunks) {
    const chunkFile = join(outputDir, `chunk_${chunk.id}.json`);
    fs.writeFileSync(chunkFile, JSON.stringify({ bbox: chunk.bbox, features: chunk.features }), 'utf-8');
  }

  const statsPath = join(outputDir, 'parse-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify({
    version: '3.0.0',
    regionId: region.id,
    generatedAt: new Date().toISOString(),
    pbfPath,
    sourcePbf: {
      fileName: basename(pbfPath),
      sizeBytes: pbfFileStats.size,
      lastModifiedAt: pbfFileStats.mtime.toISOString(),
    },
    decorRuleSetSha256: DECOR_RULESET_SHA256,
    chunkGridSize: gridSize,
    s2Level: S2_LEVEL,
    sampleStepDeg: BASE_SAMPLE_STEP_DEG,
    maxAreaSamplePoints: MAX_AREA_SAMPLE_POINTS,
    maxCellsPerFeature: MAX_CELLS_PER_FEATURE,
    stats,
  }, null, 2), 'utf-8');

  dashboardStatus.isRunning = false;
  dashboardStatus.phase = 'Done';
  addLog(`🎉 完成！輸出 ${dashboardStatus.stats.totalPOIs.toLocaleString()} 個 decor instances`);
  addLog(`📊 統計檔: ${statsPath}`);
  writeStatus();

  console.log('\n🎉 本地解析與切片完成');
  console.log(`  outputDir: ${outputDir}`);
  console.log(`  generated decor instances: ${dashboardStatus.stats.totalPOIs.toLocaleString()}`);
  console.log(`  real point POIs: ${stats.realPointPois.toLocaleString()}`);
  console.log(`  area/line decor instances: ${stats.areaOrLineDecorInstances.toLocaleString()}`);
  console.log(`  missing relation ways: ${stats.missingRelationWays.toLocaleString()}`);
  console.log(`  missing node coords: ${stats.missingNodeCoords.toLocaleString()}`);
  console.log(`  skipped outside bbox: ${stats.skippedOutsideBbox.toLocaleString()}`);
  console.log(`  stats: ${statsPath}`);
}

main().catch(err => {
  addLog(`💥 發生錯誤: ${err.message}`);
  dashboardStatus.isRunning = false;
  dashboardStatus.phase = 'Error';
  writeStatus();
  console.error(err);
  process.exit(1);
});
