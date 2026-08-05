import { cp, mkdir } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

// Cloudflare Pages exposes CF_PAGES=1 and its Nuxt preset writes to dist.
const sourceDirectory = resolve(process.env.CF_PAGES ? 'dist' : '.output/public');
const outputDirectory = resolve('.output/pages-public');
const excludedAsset = 'data/regions/taiwan_main_island/single/forest.json';

await mkdir(outputDirectory, { recursive: true });
await cp(sourceDirectory, outputDirectory, {
  recursive: true,
  filter: sourcePath => {
    const relativePath = relative(sourceDirectory, sourcePath).split(sep).join('/');
    return relativePath !== excludedAsset;
  },
});
