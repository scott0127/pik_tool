# 探索行囊：多圖層互動

## 素材與工具

使用內建 imagegen；透明 PNG 原圖保留在 Codex generated_images，前端使用壓縮 WebP。沒有使用 CLI 或 Python 修改圖片。

| 用途 | 專案路徑 | 大小 |
| --- | --- | --- |
| 關閉的背包 | public/images/map-field/satchel-closed.webp | 26,224 bytes |
| 打開的背包 | public/images/map-field/satchel-open.webp | 26,280 bytes |
| 三摺地圖 | public/images/map-field/fold-map.webp | 34,228 bytes |
| 指南針 | public/images/map-field/compass.webp | 9,118 bytes |

另使用既有 public/images/friends-comic/pikmin-red.png。四張新素材共約 94 KB。

## 互動

- 點「打開行囊」：背包切換開啟狀態，皮克敏從背包旁探出；地圖從袋口移出後，左右兩摺依序展開，指南針落到桌面。
- 勾選或取消飾品：指南針轉向、數量標籤更新，皮克敏回應。
- 點「收起行囊」：同一時間軸倒序播放，地圖摺起收回，背包關閉。快速反覆操作會接續目前的動畫進度。
- 手機展開時增加面板高度，清單仍可操作。
- 偏好減少動態效果時直接切換開啟／關閉狀態，停用勾選回彈。
- 元件卸載時透過 gsap.matchMedia／context 清理時間軸。

## 最終提示詞

### 關閉背包

Use case: illustration-story. Asset type: an original transparent cutout layer for a mobile map field-guide animation. Style: premium gouache and tactile cut-paper storybook illustration, crisp deliberate contours, shallow layered paper depth, warm ivory, emerald green #10b981 with deep emerald accents #047857 and restrained muted gold; attractive and readable at 100px. Actual transparent alpha background. No text, no letters, no watermark, no background scenery, no drop shadow outside the object, no characters. Entire object visible with small balanced margin. Subject: ONE closed emerald canvas exploration satchel, front view with a tiny amount of top visible, a broad rounded flap closed over the opening, tiny brass buckle, simple curved handle and short straps visible. Symmetrical compact silhouette, width around height, keep details restrained. This is a single animation state; later we will derive an open state that preserves its exact position and silhouette. Square canvas.

### 地圖

Use case: illustration-story. Asset type: an original transparent cutout layer for a mobile map field-guide animation. Style: premium gouache and tactile cut-paper storybook illustration, crisp deliberate contours, shallow layered paper depth, warm ivory, emerald green #10b981 with deep emerald accents #047857 and restrained muted gold; attractive and readable at 100px. Actual transparent alpha background. No text, no letters, no watermark, no background scenery, no drop shadow outside the object, no characters. Entire object visible with small balanced margin. Subject: ONE fully unfolded accordion paper map with THREE vertical panels, front view slightly from above; wide horizontal rectangular ivory paper with clean distinct vertical folds at exactly one third and two thirds of its width. Charming simple winding emerald path, a tiny muted-gold location dot, and faint pale-sage land shapes. No compass, no bag, no other object. The map fills a wide landscape canvas. Edges gently irregular but not crumpled; all three panels clearly visible and equally wide.

### 指南針

Use case: illustration-story. Asset type: an original transparent cutout layer for a mobile map field-guide animation. Style: premium gouache and tactile cut-paper storybook illustration, crisp deliberate contours, shallow layered paper depth, warm ivory, emerald green #10b981 with deep emerald accents #047857 and restrained muted gold; attractive and readable at 100px. Actual transparent alpha background. No text, no letters, no watermark, no background scenery, no drop shadow outside the object, no characters. Entire object visible with small balanced margin. Subject: ONE round brass pocket compass viewed directly from above, clean circular silhouette, pale ivory face with simple emerald compass needle and four restrained tick marks, small hanging loop at top. Minimal layered cut-paper relief and painterly metal rim. No bag, no map, no other object. Square canvas.

### 打開背包（參考關閉背包）

Use case: precise-object-edit. Edit target: the provided closed satchel image. Produce the OPEN state of this exact satchel for a sprite animation: unfasten the tiny front buckle, lift the broad top flap upward and backward, reveal a dark empty opening at the top of the bag. Keep its front body, bottom, side pockets, handle, textures, emerald color, lighting and perspective identical. Keep the front body and bottom at exactly the same pixel position and scale in the same 1280 square canvas, so the closed and open images can be crossfaded without the bag shifting. Only the flap and opening change. Genuine transparent alpha background, no text, no additional objects, no scene, no floor shadow.

### 地圖透明背景修正

Use case: background-extraction. Edit target: the provided three-panel paper map. Remove ALL of the brown background and vignette around the paper map and replace with actual transparent alpha. Preserve the complete map itself, its three folds, ivory paper edges, green illustration, exact placement, original 1536x1024 canvas and original dimensions. No brown or black backdrop, no scene, no floor shadow. The result will be layered above other UI objects, so every pixel outside the paper must be fully transparent.

## 原圖

- 關閉背包：C:/Users/scott/.codex/generated_images/01a0ef03-568f-72b3-93a9-c83b3f913350/exec-393e06a2-d757-4437-a0c6-92879f6007ac.png
- 指南針：C:/Users/scott/.codex/generated_images/01a0ef03-568f-72b3-93a9-c83b3f913350/exec-c8f5cce4-a490-4c12-b9f1-8eaf144a5b06.png
- 打開背包：C:/Users/scott/.codex/generated_images/01a0ef03-568f-72b3-93a9-c83b3f913350/exec-5957b046-035e-451f-b157-4057822eca5b.png
- 最終地圖：C:/Users/scott/.codex/generated_images/01a0ef03-568f-72b3-93a9-c83b3f913350/exec-e80e4c88-31c3-40f1-b3ae-373ca98277b1.png

