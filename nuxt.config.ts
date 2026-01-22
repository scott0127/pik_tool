// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@nuxt/icon', '@nuxtjs/i18n'],
  
  // Icon 配置：全部使用 Iconify API（避免掃描本地套件）
  icon: {
    serverBundle: 'remote', // 強制使用遠端 API，不掃描本地檔案
  },
  
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  supabase: {
    redirect: false, // Auth is managed by AuthStore
    redirectOptions: {
      login: '/auth',
      callback: '/auth/callback',
      exclude: ['/', '/collection', '/progress', '/friends', '/map', '/auth', '/auth/callback', '/auth/reset-password', '/auth/update-password'],
    },
    // 使用 implicit flow 避免 PKCE code_verifier 問題
    clientOptions: {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
      },
    },
  },

  i18n: {
    locales: [
      { code: 'zh', language: 'zh-TW', file: 'zh.json', name: '繁體中文' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix', // 不改變 URL 結構
    langDir: 'locales',
    detectBrowserLanguage: false
  },

  routeRules: {
    // Data files: check for updates every time (Network First / ETag)
    '/data/**': { headers: { 'cache-control': 'public, max-age=0, must-revalidate' } },
    // Cache images for 1 day
    '/og-image.png': { headers: { 'cache-control': 'public, max-age=86400' } },
    // Cache other static assets
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
  
  app: {
    head: {
      title: 'Pikmin Bloom 飾品圖鑑',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Pikmin Bloom 飾品蒐集追蹤器 - 追蹤你的皮克敏飾品收藏進度 (非營利・CC BY-SA 4.0)' },
        { name: 'theme-color', content: '#059669' },
        
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Pikmin Bloom 飾品蒐集追蹤器 - 追蹤你的皮克敏飾品收藏進度 (非營利・CC BY-SA 4.0)' },
        { property: 'og:title', content: 'Pikmin Bloom 飾品蒐集追蹤器 - 追蹤你的皮克敏飾品收藏進度 (非營利・CC BY-SA 4.0)' },
        { property: 'og:description', content: 'Pikmin Bloom 飾品蒐集追蹤器 - 追蹤你的皮克敏飾品收藏進度 (非營利・CC BY-SA 4.0)' },
        { property: 'og:image', content: '/og-image.png' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Pikmin Bloom 飾品蒐集追蹤器 - 追蹤你的皮克敏飾品收藏進度 (非營利・CC BY-SA 4.0)' },
        { name: 'twitter:description', content: 'Pikmin Bloom 飾品蒐集追蹤器 - 追蹤你的皮克敏飾品收藏進度 (非營利・CC BY-SA 4.0)' },
        { name: 'twitter:image', content: '/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  // Nitro 配置：啟用靜態資源壓縮 (Gzip + Brotli)
  // Build 時會自動產生 .gz 和 .br 壓縮版本，節省 60-80% 帶寬
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },
})

