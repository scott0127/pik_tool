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
  },
});
