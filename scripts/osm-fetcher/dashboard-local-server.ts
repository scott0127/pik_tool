import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3457;

const STATUS_FILE = join(__dirname, 'dashboard-local-status.json');
const HTML_FILE = join(__dirname, 'dashboard-local.html');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/api/status') {
    res.setHeader('Content-Type', 'application/json');
    if (existsSync(STATUS_FILE)) {
      try {
        const content = readFileSync(STATUS_FILE, 'utf-8');
        res.writeHead(200);
        res.end(content);
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to read status file' }));
      }
    } else {
      res.writeHead(200);
      res.end(JSON.stringify({ isRunning: false, phase: 'Waiting', logs: ['Waiting for status file...'] }));
    }
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
