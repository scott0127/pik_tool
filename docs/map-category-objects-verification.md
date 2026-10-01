# 種類小物互動：整合與驗證

2026-10-02

## 整合範圍

- 一般飾品地點篩選：43 個種類，各有獨立的小物素材，依用途使用六組 GSAP 時間軸。
- 純種模式：既有 35 個有台灣純種資料的類型，共用同一套物件及按鈕回饋。
- 搬運角色使用既有官方平面紅色皮克敏；角色和貨物分開移動，貨物放下後留在按鈕上緣，取消時角色返回帶走。
- 選取立即更新真正的 checkbox 與地圖篩選，動畫不延遲操作結果。保留多語名稱、地點計數及快取提示。

## 素材與手機載入

- 43 份原始 PNG 均有透明背景，沒有遺失的類型素材。
- UI 使用長邊最高 192px 的透明 WebP，足夠 54px 物件在三倍像素密度下顯示。
- 43 份素材合計由 4,648,811 bytes 降為 677,380 bytes，原始 PNG 保留。
- IntersectionObserver 只掛載滑到過的種類；初始選取、批次操作及重新展開直接呈現結果，沒有 43 隻角色同時入場。

## 視覺與互動檢查

- Codex 內建 Chromium：320 × 740、393 × 852、1280 × 800。
- 一般篩選在上述尺寸沒有橫向溢出；類型列至少 64px，手機完成按鈕維持可見。
- 點選測試涵蓋搬運、上桌、行進、紙袋、翻書、自然生長、水波與天候；快速連點後 checkbox 維持正確結果，圖片沒有遺失。
- 減少動態模擬：選取立即呈現貨物，角色不入場；取消直接呈現收回狀態。
- 清除後為 0 種、全選為 43 種；驗證後回復原本一般篩選 39 種與純種篩選的餐廳。
- 修正快速點擊時背景與文字不同步的短暫白字白底。
- 修正收起面板途中切換模式時，Vue 的離場節點未釋放而殘留的問題。

## 編譯

- Nuxt production build 通過。
- TypeScript 檢查未回報這次新增或修改元件的錯誤；全專案仍有原有的 HeroSettingsModal、FooterFlipCounter、HeroSection、friends 錯誤。

本輪外部 Chrome 連線不可用，因此視覺驗證使用使用者指定的 Codex 內建瀏覽器。沒有宣稱已在實體 Samsung、iPhone 或 Safari 上測試。

## 視覺記錄

### 按鈕表面修整（2026-10-02）

- 一般及純種篩選移除撕角、預覽雙框，改為完整圓角、細光邊、薄底座與白底綠勾。
- Codex 內建瀏覽器檢查 320 × 740、393 × 852：沒有橫向溢出，類型列保持至少 64px。
- 點選後 `::after` 為 `none`，觸控焦點不留下外框；鍵盤 `focus-visible` 仍顯示細框。
- 一般咖啡廳及純種餐廳連續取消／選取後，回復原有 39 種及純種 1 種；種類時間軸仍正常回應。
- 修正純種面板原有白字規則覆蓋勾選圖示的問題，實際勾選圖示為 #07865F。
- 紀錄：`buttons-refined-mobile.png`、`buttons-refined-pure-mobile.png`、`buttons-refined-detail.png`。

- `output/map-objects-review/mobile-320.png`
- `output/map-objects-review/mobile-393.png`
- `output/map-objects-review/pure-mobile-393.png`
- `output/map-objects-review/desktop-1280.png`
- `output/map-objects-review/pikmin-delivery.gif`
- `output/map-objects-review/webp-report.json`
