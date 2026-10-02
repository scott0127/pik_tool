import { defineVitestConfig } from '@nuxt/test-utils/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// @nuxtjs/supabase 在 Nuxt 初始化時就會讀這兩個變數，缺了會直接丟錯
process.env.SUPABASE_URL ||= 'http://localhost:54321';
process.env.SUPABASE_KEY ||= 'test-anon-key';

// shell 裡若帶著真的憑證（別的專案、direnv、CI runner），Nuxt 初始化時
// 會拿它建出指向正式環境的 client。測試一律只能連本機。
if (!/^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(process.env.SUPABASE_URL)) {
  throw new Error(
    `[vitest] 拒絕對非本機的 Supabase 執行測試：${process.env.SUPABASE_URL}`,
  );
}

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
      // json-summary 給 CI 讀來產生摘要
      reporter: ['text', 'html', 'json-summary'],
      // 只算 app 執行時的程式碼。scripts/osm-fetcher 是 CLI 入口
      //（module scope 就呼叫 main()，import 等於跑整條 pipeline），
      // 佔分母四成又幾乎不可能覆蓋，計進來只會讓比例失真。
      // 那些檔案仍由 osmFetcherSpatial.test.ts 測試，只是不列入分母。
      include: ['app/composables/**', 'app/constants/**'],
      exclude: ['**/*.d.ts', '**/*.html'],
    },
  },
});
