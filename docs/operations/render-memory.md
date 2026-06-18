# Render Memory Runbook

本專案是瀏覽器優先的 Nuxt app：收藏、好友、回報、管理設定都直接由瀏覽器呼叫 Supabase 或第三方 API；地圖資料也放在 `public/data/regions/**` 以靜態 JSON 供前端讀取。除非新增 `server/api/**` 或需要隱藏後端金鑰，正式站應部署成 Render Static Site，而不是 512MB Web Service。

## 決策

正式部署目標：

- Render service type: Static Site
- Build command: `pnpm run render:build`
- Publish directory: `.output/public`
- SPA fallback: rewrite `/*` to `/index.html`

這會移除長時間運行的 Nitro Node server，因此不再受 Web Service runtime 512MB 記憶體限制影響。Render 官方文件也把 static sites 定位為由 global CDN 服務前端網站，dynamic server app 才需要 Web Service。

## 目前已知風險

舊 Web Service 的記憶體風險集中在：

- Nitro/Vue SSR runtime 常駐在 Node process。
- `public/data/regions/**` 有大量 tile JSON，任何流量尖峰都會進入 Web Service。
- `server/middleware/tile-traffic-stats.ts` 曾經用 module-level `Map` 永久累積 tile path、referer、user-agent 與 size cache。

`tile-traffic-stats.ts` 已補上 bounded cache 與週期 reset，但這只是保護 Web Service；徹底做法仍是不要用 Web Service 承接靜態資料流量。

## 建議遷移步驟

1. 在 Render 建立新的 Static Site，或用 repo 根目錄的 `render.yaml` 建立 `pik-tool-static`。
2. 設定 build command：

   ```bash
   pnpm run render:build
   ```

   如果 Render 沒有自動安裝 pnpm 依賴，改用：

   ```bash
   corepack enable && pnpm install --frozen-lockfile && pnpm run render:build
   ```

3. 設定 publish directory：

   ```txt
   .output/public
   ```

4. 設定 rewrite：

   ```txt
   source: /*
   destination: /index.html
   ```

5. 部署完成後測試這些直接進入網址：

   ```txt
   /
   /collection
   /map
   /friends
   /released
   /auth
   /auth/callback
   /auth/update-password
   ```

6. 確認 Supabase Auth redirect URL 與 Site URL 改到新的 Static Site 網域。
7. 確認 custom domain 指到新的 Static Site 後，再 suspend 舊的 Web Service。

## 如果暫時不能遷移

在舊 Web Service 的 Environment 加上：

```txt
TILE_STATS_DISABLED=1
NODE_OPTIONS=--max-old-space-size=384
```

如果仍要保留 tile 統計，改用較小上限：

```txt
TILE_STATS_COUNTER_LIMIT=64
TILE_STATS_SIZE_CACHE_LIMIT=128
TILE_STATS_RESET_INTERVAL_MS=3600000
TILE_STATS_LOG_EVERY=0
```

這些設定只能降低再次超限機率，不能消除 Web Service 承接靜態資料流量的根本成本。

## 新功能檢查規則

新增功能前先判斷是否會破壞 Static Site 部署：

- 可以放在 Static Site：純前端頁面、Supabase client/RLS、公開 JSON、公開第三方 API。
- 不可以直接放在 Static Site：需要 service role key、webhook receiver、server-only token、私有 API proxy、大型背景工作。
- 若新增 `server/api/**`、`server/routes/**`、server-only middleware，必須重新評估是否需要額外 Web Service，而不是把主站退回 Node runtime。

## 快速盤查位置

- Render 部署藍圖：`render.yaml`
- Nuxt 靜態建置：`package.json` 的 `render:build`
- Prerender route 清單：`nuxt.config.ts` 的 `nitro.prerender.routes`
- 靜態地圖資料：`public/data/regions/**`
- Web Service tile 統計保護：`server/middleware/tile-traffic-stats.ts`
