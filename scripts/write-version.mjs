import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

mkdirSync('public', { recursive: true });

let version;

try {
  version = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  version = new Date().toISOString();
}

writeFileSync(
  'public/version.json',
  JSON.stringify({ version }, null, 2) + '\n',
);

console.log(`[version] wrote public/version.json: ${version}`);
