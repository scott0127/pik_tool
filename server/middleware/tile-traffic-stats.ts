import { existsSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { defineEventHandler, getRequestHeader, getRequestURL } from 'h3';

const TILE_PATH_RE = /^\/data\/regions\/[^/]+\/tiles\/[^/]+\.json$/;
const LOG_EVERY_REQUESTS = Number(process.env.TILE_STATS_LOG_EVERY || 25);
const LOG_EVERY_MS = Number(process.env.TILE_STATS_LOG_INTERVAL_MS || 5 * 60 * 1000);
const TOP_LIMIT = 8;
const MAX_LABEL_LENGTH = 140;

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

function increment(map: CounterMap, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
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
    sizeCache.set(pathname, size);
    return size;
  }

  sizeCache.set(pathname, 0);
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
  const size = getTileSize(pathname);

  state.requests += 1;
  state.estimatedBytes += size;
  increment(state.paths, pathname);
  increment(state.userAgents, sanitizeLabel(getRequestHeader(event, 'user-agent'), 'unknown'));
  increment(state.referers, sanitizeLabel(getRequestHeader(event, 'referer'), 'direct'));

  if (shouldLog(now)) {
    logSummary(now);
  }
});
