import { existsSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { defineEventHandler, getRequestHeader, getRequestURL } from 'h3';

const TILE_PATH_RE = /^\/data\/regions\/[^/]+\/tiles\/[^/]+\.json$/;
const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const parseNonNegativeInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
};

const LOG_EVERY_REQUESTS = parseNonNegativeInt(process.env.TILE_STATS_LOG_EVERY, 25);
const LOG_EVERY_MS = parsePositiveInt(process.env.TILE_STATS_LOG_INTERVAL_MS, 5 * 60 * 1000);
const COUNTER_LIMIT = parsePositiveInt(process.env.TILE_STATS_COUNTER_LIMIT, 128);
const SIZE_CACHE_LIMIT = parsePositiveInt(process.env.TILE_STATS_SIZE_CACHE_LIMIT, 512);
const RESET_EVERY_MS = parsePositiveInt(process.env.TILE_STATS_RESET_INTERVAL_MS, 6 * 60 * 60 * 1000);
const TOP_LIMIT = 8;
const MAX_LABEL_LENGTH = 140;
const OTHER_KEY = '__other__';

type CounterMap = Map<string, number>;

interface TileTrafficState {
  since: number;
  lastLogAt: number;
  requests: number;
  estimatedBytes: number;
  paths: CounterMap;
  userAgents: CounterMap;
  referers: CounterMap;
}

const state: TileTrafficState = {
  since: Date.now(),
  lastLogAt: 0,
  requests: 0,
  estimatedBytes: 0,
  paths: new Map(),
  userAgents: new Map(),
  referers: new Map(),
};

const sizeCache = new Map<string, number>();

function incrementBounded(map: CounterMap, key: string) {
  if (map.has(key)) {
    map.set(key, (map.get(key) || 0) + 1);
    return;
  }

  if (map.size >= COUNTER_LIMIT) {
    map.set(OTHER_KEY, (map.get(OTHER_KEY) || 0) + 1);
    return;
  }

  map.set(key, 1);
}

function setSizeCache(pathname: string, size: number) {
  if (sizeCache.has(pathname)) {
    sizeCache.delete(pathname);
  }

  sizeCache.set(pathname, size);

  if (sizeCache.size > SIZE_CACHE_LIMIT) {
    const oldestKey = sizeCache.keys().next().value as string | undefined;
    if (oldestKey) sizeCache.delete(oldestKey);
  }
}

function resetState(now: number) {
  state.since = now;
  state.lastLogAt = 0;
  state.requests = 0;
  state.estimatedBytes = 0;
  state.paths.clear();
  state.userAgents.clear();
  state.referers.clear();
}

function sanitizeLabel(value: string | undefined | null, fallback: string) {
  if (!value) return fallback;
  return value.replace(/\s+/g, ' ').slice(0, MAX_LABEL_LENGTH);
}

function topEntries(map: CounterMap) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_LIMIT)
    .map(([key, count]) => ({ key, count }));
}

function publicRoots() {
  const cwd = process.cwd();
  return [
    resolve(cwd, '.output/public'),
    resolve(cwd, '../public'),
    resolve(cwd, 'public'),
  ];
}

function getTileSize(pathname: string) {
  const cached = sizeCache.get(pathname);
  if (cached !== undefined) return cached;

  const relativePath = pathname.replace(/^\/+/, '').split('/').join(sep);

  for (const root of publicRoots()) {
    const candidate = resolve(root, relativePath);
    if (!candidate.startsWith(root + sep)) continue;
    if (!existsSync(candidate)) continue;

    const size = statSync(candidate).size;
    setSizeCache(pathname, size);
    return size;
  }

  setSizeCache(pathname, 0);
  return 0;
}

function shouldLog(now: number) {
  if (state.requests === 1) return true;
  if (LOG_EVERY_REQUESTS > 0 && state.requests % LOG_EVERY_REQUESTS === 0) return true;
  return now - state.lastLogAt >= LOG_EVERY_MS;
}

function logSummary(now: number) {
  state.lastLogAt = now;

  const topTiles = topEntries(state.paths).map(({ key, count }) => ({
    path: key,
    count,
    estimatedMB: Number(((getTileSize(key) * count) / 1024 / 1024).toFixed(2)),
  }));

  console.info('[TileTrafficStats]', JSON.stringify({
    since: new Date(state.since).toISOString(),
    requests: state.requests,
    estimatedMB: Number((state.estimatedBytes / 1024 / 1024).toFixed(2)),
    uniqueTiles: state.paths.size,
    topTiles,
    topUserAgents: topEntries(state.userAgents),
    topReferers: topEntries(state.referers),
  }));
}

export default defineEventHandler((event) => {
  if (process.env.TILE_STATS_DISABLED === '1') return;

  const { pathname } = getRequestURL(event);
  if (!TILE_PATH_RE.test(pathname)) return;

  const now = Date.now();
  if (now - state.since >= RESET_EVERY_MS) {
    resetState(now);
  }

  const size = getTileSize(pathname);

  state.requests += 1;
  state.estimatedBytes += size;
  incrementBounded(state.paths, pathname);
  incrementBounded(state.userAgents, sanitizeLabel(getRequestHeader(event, 'user-agent'), 'unknown'));
  incrementBounded(state.referers, sanitizeLabel(getRequestHeader(event, 'referer'), 'direct'));

  if (shouldLog(now)) {
    logSummary(now);
  }
});
