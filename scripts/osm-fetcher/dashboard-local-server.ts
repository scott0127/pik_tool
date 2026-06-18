import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3457;

const STATUS_FILE = join(__dirname, 'dashboard-local-status.json');
const HTML_FILE = join(__dirname, 'dashboard-local.html');
const INDEX_FILE = join(__dirname, '../../public/data/regions/taiwan_main_island/index.json');
const TILES_DIR = join(__dirname, '../../public/data/regions/taiwan_main_island/tiles');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Serve tile details
  if (req.url && req.url.startsWith('/api/tile/')) {
    const tileName = req.url.split('/').pop() || '';
    if (tileName && tileName.endsWith('.json')) {
      const tilePath = join(TILES_DIR, tileName);
      if (existsSync(tilePath)) {
        try {
          const content = readFileSync(tilePath, 'utf-8');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.writeHead(200);
          res.end(content);
          return;
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to read tile file' }));
          return;
        }
      }
    }
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Tile not found' }));
    return;
  }

  if (req.url === '/api/status') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    let statusObj: any = { isRunning: false, phase: 'Waiting', logs: ['Waiting for status file...'] };
    
    if (existsSync(STATUS_FILE)) {
      try {
        const content = readFileSync(STATUS_FILE, 'utf-8');
        statusObj = JSON.parse(content);
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to parse status file' }));
        return;
      }
    }

    // Attempt to merge tile index if available
    if (existsSync(INDEX_FILE)) {
      try {
        const indexContent = readFileSync(INDEX_FILE, 'utf-8');
        const indexObj = JSON.parse(indexContent);
        if (indexObj && indexObj.tiles) {
          if (!statusObj.stats) statusObj.stats = {};
          statusObj.stats.tiles = indexObj.tiles;
          statusObj.stats.tileGridSize = indexObj.tileGridSize;
          statusObj.stats.bbox = indexObj.bbox;
        }
      } catch (e) {
        // Soft fail on index file issues
        console.error('Failed to read or parse index.json:', e);
      }
    }

    res.writeHead(200);
    res.end(JSON.stringify(statusObj));
  } else if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (existsSync(HTML_FILE)) {
      res.writeHead(200);
      res.end(readFileSync(HTML_FILE));
    } else {
      res.writeHead(404);
      res.end('Dashboard HTML not found');
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`\n🖥️  本地解析監控面板已啟動`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 Status API: http://localhost:${PORT}/api/status\n`);
});
