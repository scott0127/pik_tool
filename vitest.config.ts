import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    alias: {
      '~': resolve(__dirname, './app'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // 只算 composables 與 scripts；page/component 動輒 2000+ 行會沖爛分母
      include: ['app/composables/**', 'app/constants/**', 'scripts/osm-fetcher/**'],
      exclude: ['**/*.d.ts', '**/*.html'],
    },
  },
});
