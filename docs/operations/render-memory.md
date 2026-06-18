# Render Memory Runbook

本專案目前維持 Render Web Service 部署。前端大多直接呼叫 Supabase 或公開 API，但仍使用 Nuxt/Nitro Node runtime，因此 512MB free instance 需要控制常駐記憶體與高流量靜態資料的壓力。

## 目前決策

正式部署目標：

- Render service type: Web Service
- Runtime: Node
- Build command: `pnpm run build`
- Start command: `node .output/server/index.mjs`
- Blueprint: `render.yaml`

靜態站仍是可行備案，但目前不是主線。除非之後確認要切換到 Static Site，文件、Blueprint 與 Render 設定都以 Web Service 為準。

## Web Service 必要設定

Render Environment 建議保留：

```txt
NODE_VERSION=22
NODE_OPTIONS=--max-old-space-size=384
TILE_STATS_DISABLED=1
SUPABASE_URL=<your Supabase project URL>
SUPABASE_KEY=<your Supabase anon key>
```

`SUPABASE_KEY` 是 anon key，瀏覽器端使用 Supabase 必然看得到；真正要保密的是 service role key，本專案不應把 service role key 放到前端或 repo。

## 已知記憶體風險

Web Service 的記憶體風險集中在：

- Nitro/Vue SSR runtime 常駐在 Node process。
- `public/data/regions/**` 有大量 tile JSON，流量尖峰會經過 Web Service。
- `server/middleware/tile-traffic-stats.ts` 若無限制累積 path、referer、user-agent 或 size cache，會增加常駐記憶體。

目前 `tile-traffic-stats.ts` 已補上 bounded cache 與週期 reset，且 Web Service 預設用 `TILE_STATS_DISABLED=1` 關閉統計，以降低 512MB instance 再次超限的機率。

## 發生記憶體超限時

1. 先看 Render Metrics 的 memory 是否持續爬升，或只是短時間尖峰。
2. 看 Logs 是否有大量 tile/data request、Supabase auth refresh error、或重複例外。
3. 確認 Render Environment 是否仍有：

   ```txt
   TILE_STATS_DISABLED=1
   NODE_OPTIONS=--max-old-space-size=384
   ```

4. 若仍超限，先降低 tile 統計負擔：

   ```txt
   TILE_STATS_COUNTER_LIMIT=64
   TILE_STATS_SIZE_CACHE_LIMIT=128
   TILE_STATS_RESET_INTERVAL_MS=3600000
   TILE_STATS_LOG_EVERY=0
   ```

5. 若是流量造成的靜態資料壓力，再評估升級 instance、加 CDN/custom domain 快取，或重新切到 Render Static Site。

## 靜態站備案

若未來決定改回 Static Site，需要同步修改：

- `render.yaml`: `runtime: static`、`staticPublishPath: ./.output/public`
- Build command: `pnpm run render:build`
- SPA fallback: rewrite `/*` to `/index.html`
- Supabase Auth Site URL / Redirect URLs: 改到新的 Static Site 網域

不要只改 Render UI；repo 的 Blueprint 和 README 也要一起改，否則下一次重建專案時會回到錯誤部署型態。

## 快速盤查位置

- Render 部署藍圖：`render.yaml`
- Nuxt Web Service 建置：`package.json` 的 `build`
- Nuxt 靜態備案建置：`package.json` 的 `render:build`
- Prerender route 清單：`nuxt.config.ts` 的 `nitro.prerender.routes`
- 靜態地圖資料：`public/data/regions/**`
- Web Service tile 統計保護：`server/middleware/tile-traffic-stats.ts`
