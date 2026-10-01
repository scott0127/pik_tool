# 地圖：林間探險手冊

手機先看地圖，再打開有完整構圖的探險手冊。營地插畫、前景植物、背包、地圖和皮克敏是獨立圖層；文字與操作是真實 HTML。主操作維持 #10B981 白字，網格紅黃綠的種類數量語意維持。

## 動畫腳本

- **打開篩選**：底部手冊入口是起點；紙頁展開，營地背景先就位，前景植物從頁緣揭開，背包和角色進入右側營地，當前可見的種類小卡依序插入。結果是可閱讀、可捲動的種類目錄。
- **選取種類**：每張小卡保留自己的真實平面飾品皮克敏；角色從卡片口袋抽出，紙袋／蒸氣／車票等對應物件出現，勾選落印，最後角色回到口袋。取消時反向收回，卡片回到未選取色調。文字與觸控區域始終固定可讀。
- **展開行囊**：閉合背包換成打開背包；地圖從包中抽出、左右紙頁攤開，指南針落到桌面。收回沿同一時間軸反向播放。
- **完成選擇／向下收起**：可見小卡先收攏，營地前景與角色回到頁緣，整冊縮回底部入口。重新打開保留篩選與目錄捲動位置。
- **點擊網格**：地點資訊像一張抽出的探險明信片，營地頁眉揭開、指南針轉到閱讀位置，可見的種類紙卡依序入場；類型照片與篩選手冊一致，紅黃綠仍表示類型數量。
- **快速中斷**：選取效果只保留最新一次；關閉停止畫面中的時間軸與觀察器，重新打開從目前資料重新呈現。減少動態偏好直接切換到結果，卸載清理 GSAP 與 IntersectionObserver。

## 素材與讀取

營地背景使用內建 imagegen 生成，風格參考既有好友頁的原創林間插畫。前景植物使用既有 meadow 素材，背包／摺疊地圖／指南針沿用獨立透明素材。種類圖片沿用 Pikipedia 原始 PNG，只載入目錄視窗附近的小卡，不預載全部 43 類。

生成提示：橫幅林間探險營地，精緻水彩／水粉加細緻墨線，暖象牙紙張、森林綠與柔和金色；左半保留乾淨的淺色空間供真實文字，右半是小木屋、林間步道與矮草；沒有文字、介面、角色、背包或指南針。參考圖僅用於畫風，新構圖適合短橫幅。

最終素材：`public/images/map-field/woodland-camp.webp`，1200 × 400，約 120 KB；使用內建 imagegen 產生，原始圖片保留在 Codex generated_images。營地插畫只作背景，角色、背包、摺疊地圖、指南針、前景與種類照片獨立呈現和編排。

### 實際生成提示詞

> Use case: illustration-story. Asset type: production background illustration for a mobile map explorer field-guide header, extra-wide landscape 3:1 composition. Input image is STYLE REFERENCE ONLY: match its refined watercolor/gouache and delicate ink woodland illustration, warm ivory paper grain, rich botanical detail and soft forest greens. Create a NEW woodland exploration campsite composition. LEFT 52% is very quiet pale ivory sky / light clearing with subtle paper texture, no objects obstructing this area, reserved for real UI heading overlay. RIGHT 48%: charming small timber field station with moss roof and a winding footpath, delicate ferns and tiny daisies along bottom edge, layered distant forest. Bottom foreground modest, beautiful carefully composed plants; top clean and calm. This will render as a short wide header so use readable simplified silhouettes and selective detail, not micro-detail noise. Flat storybook illustration, no 3D render. Warm ivory, dark forest green, pale sage, tiny muted honey accents. NO text, letters, numbers, labels, UI, people, Pikmin, characters, bag, compass, map, buttons, icons, watermark. Generate the finished asset only, not a website mockup.

## 驗證

- IAB 實際 320 × 740、393 × 852 手機布局，無水平溢出；展開行囊仍保留可捲动的種類區。
- 實際 Chrome 視覺檢查；該設定檔縮放為 75%，393px viewport override 的 CSS 寬度為 524px，精確窄屏驗證以上述 IAB 為準。
- 咖啡廳／麵包店快速切換四次後回到 39 個選取，只有一個最新種類效果。
- 減少動態模式不留下角色 transform，選取結果正確。
- 種類目錄捲到 852px 後收起重開仍在 852px，附近圖片按需載入。
- 網格資訊卡在手機呈現營地頁眉、指南針與真實種類照片。
- `pnpm run build` 通過；完整型別檢查仍有既有的 Admin/HeroSettingsModal、FooterFlipCounter、Home/HeroSection、friends.vue 錯誤，本次地圖檔案沒有型別錯誤。
- 實際截圖／動畫在 `output/map-camp-review/`。
