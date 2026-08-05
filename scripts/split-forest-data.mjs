import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourcePath = resolve('public/data/regions/taiwan_main_island/single/forest.json');
const outputDirectory = resolve('public/data/regions/taiwan_main_island/single');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));

if (source.encoding !== 'delta' || !Array.isArray(source.deltas) || typeof source.base !== 'string') {
  throw new Error('forest.json must use the expected delta-encoded format.');
}

const splitAt = Math.ceil(source.deltas.length / 2);
const firstDeltas = source.deltas.slice(0, splitAt);
const secondDeltas = source.deltas.slice(splitAt);

let secondBase = BigInt(source.base);
for (const delta of firstDeltas) {
  secondBase += BigInt(delta);
}

const firstPart = {
  ...source,
  cellCount: firstDeltas.length,
  deltas: firstDeltas,
};

const secondPart = {
  ...source,
  cellCount: secondDeltas.length,
  base: secondBase.toString(),
  deltas: secondDeltas,
};

await Promise.all([
  writeFile(resolve(outputDirectory, 'forest-1.json'), JSON.stringify(firstPart)),
  writeFile(resolve(outputDirectory, 'forest-2.json'), JSON.stringify(secondPart)),
]);
