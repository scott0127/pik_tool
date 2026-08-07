import { defineVitestConfig } from '@nuxt/test-utils/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// @nuxtjs/supabase 在 Nuxt 初始化時就會讀這兩個變數，缺了會直接丟錯
process.env.SUPABASE_URL ||= 'http://localhost:54321';
process.env.SUPABASE_KEY ||= 'test-anon-key';

export default defineVitestConfig({
  test: {
    globals: true,
    // 預設仍用 happy-dom；需要 Nuxt 的檔案在檔頭加 `// @vitest-environment nuxt`
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
