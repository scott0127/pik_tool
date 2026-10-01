# Motion lab 插畫素材

使用 imagegen skill 與內建 image_gen 生成，四個獨立請求。素材是原創橡果信差與道具，沒有使用皮克敏照片或官方人物。用途是 /motion-lab 的按鈕邊框互動：角色帶來物件、將物件留在邊框、離開；取消選取時角色回来取走。

## 輸出

所有最終檔案為 384 × 384 RGBA PNG，保留真正 alpha，使用 Pillow 等寬裁切與 Lanczos 縮小、PNG lossless encoding；未重新繪製、合成或修改素材內容。

| 檔案 | Bytes | 完全透明像素 |
| --- | ---: | ---: |
| public/images/motion-lab/courier-idle.png | 133665 | 66.1% |
| public/images/motion-lab/courier-walk.png | 137641 | 65.6% |
| public/images/motion-lab/courier-reach.png | 133193 | 66.2% |
| public/images/motion-lab/burger.png | 121626 | 70.8% |
| public/images/motion-lab/coffee.png | 131059 | 59.2% |
| public/images/motion-lab/flower.png | 63695 | 84.6% |

## 驗證

- 四張原始素材逐張實際看圖，三張裁切角色再檢查完整比例與留白。
- 每張 alpha 最小值為 0、最大值為 255；四角與場景周圍透明，沒有繪製假的棋盤背景。
- 角色原始 spritesheet 是 2172 × 724（每格 724 × 724）；依等寬三格裁切，腳底基準基本一致，圖片可直接替換姿勢。
- PNG 的黑色預覽背景是檢視器的透明背景，不是素材底板。
- 請以 img 的固定尺寸／contain 呈現。橡果信差三張共用相同定位框，不另外依 alpha bounds 修邊，避免姿勢切換跳動。
- 道具均是獨立素材。杯子沒有蒸氣，讓 UI 可用額外圖層表達熱氣或停止動作。

## 原始素材與生成 Prompt

### 1. 橡果信差三姿勢 spritesheet

原始檔：`C:/Users/scott/.codex/generated_images/01a0f821-2ef9-7572-ac5f-5efd6216d2a7/exec-8ff1c487-1c2a-4eea-bcf0-aec53ac810eb.png`

```text
Use case: illustration-story
Asset type: transparent character sprite sheet for a refined mobile UI animation, three animation poses of ONE original woodland courier mascot, not interface mockup.
Primary request: One genuinely transparent PNG sprite sheet with exactly THREE equally wide columns in one horizontal row, canvas 3:1. Each column contains the SAME friendly warm brown acorn courier wearing a tiny cream explorer vest and a green leaf cap, round dark eyes, two arms and two small feet. Original character, no relation to Pikmin or any official franchise. All three poses face RIGHT, same size, identical face and costume, full body, ground baseline perfectly aligned, centered within each equal column. Character height about 70% of each cell, abundant transparent separation between cells so straightforward equal-width cropping works.
Poses left to right: 1 idle, empty hands gently at side, both feet down; 2 walking to the right, empty hands, one foot extended forward and other back, clearly different walking stride; 3 reaching to the right, both EMPTY hands extended in front, feet stable. No objects carried. Keep acorn body proportion and face identical across all three.
Style: beautiful small hand-painted gouache storybook illustration with softly cut paper silhouette, premium editorial craft, subtle painterly pigments and cream paper texture INSIDE the character only, fine clean outlines, extremely readable at 50px display height, gentle expressive personality, not emoji, not generic flat vector, not 3D render.
Palette: warm hazelnut brown, creamy ivory vest, vibrant theme green #10B981 leaf with dark evergreen detail, restrained honey gold stitching.
Constraints: actual transparent alpha background, no filled background, no checkerboard drawn into the image, no text, no labels, no numerals, no borders or panels, no shadow on ground, no additional objects, no separate scenery, no watermark. All characters fully intact with generous margin.
```

### 2. 漢堡

原始檔：`C:/Users/scott/.codex/generated_images/01a0f821-2ef9-7572-ac5f-5efd6216d2a7/exec-96e28799-dda3-4dca-8c2d-8d4e4b38cb41.png`

```text
Use case: illustration-story
Asset type: one standalone transparent small decorative prop for a mobile UI woodland courier animation.
Primary request: A single beautifully hand-painted little gourmet hamburger, fully intact, centered, three-quarter front view. Golden brioche bun with a few tiny sesame seeds, crisp ruffled green lettuce, dark rich beef patty, slim slice of cream-yellow cheese, a restrained tomato red sliver. Compact proportions and a clear readable silhouette; no plate, no wrapping, no character.
Style/medium: refined storybook gouache on warm paper, softly cut paper silhouette, fine painterly pigment variation and delicate natural highlights, the same premium woodland fairytale illustration feel as an acorn courier wearing a cream explorer vest and a green leaf cap. Not photorealistic, not a flat generic vector icon, not emoji, not plastic 3D render. Intended to display at 35 to 50 px wide in an interface, so food layers must read clearly.
Composition: square canvas, burger occupies 65 percent of canvas width, generous transparent negative space all around, object not clipped.
Color palette: honey gold, warm cream, rich hazelnut brown, green #10B981 in lettuce with dark evergreen detail, a small muted tomato accent only.
Constraints: genuine transparent alpha background; no drawn checkerboard; no background, no ground, no ground shadow, no lettering, no watermark, no decorative frame. Only one hamburger.
```

### 3. 陶瓷咖啡杯

原始檔：`C:/Users/scott/.codex/generated_images/01a0f821-2ef9-7572-ac5f-5efd6216d2a7/exec-831f9e4a-598b-4a2d-ad5f-696a45a06a24.png`

```text
Use case: illustration-story
Asset type: standalone transparent coffee cup and saucer prop for a refined mobile UI woodland courier animation.
Primary request: One small warm ivory ceramic coffee cup filled with visible light caramel coffee and a gentle cream swirl, on a matching ivory saucer. A slender forest-green glaze stripe and extremely restrained muted gold edge around the saucer and cup rim. Handle on the right. A little artisan handmade look with soft ceramic highlights, compact elegant rounded shape. View from a slightly elevated front three-quarter angle so the coffee surface is visible. Only cup and saucer, no spoon, no napkin, no beans, no steam drawn in the asset; steam will be separately animated in the interface.
Style/medium: beautiful hand-painted storybook gouache, refined fairytale editorial craft, softly cut paper silhouette, subtle painterly pigments and warm cream texture INSIDE the ceramic only. Match an original warm brown acorn courier in cream explorer vest and green leaf cap. Highly readable at 40 to 50px display size. Not emoji, not generic vector icon, not photorealistic, not 3D rendered plastic.
Composition: square transparent canvas, object centered, occupies about 65 percent width, abundant transparent margin, cup and saucer fully intact, no cropped handles.
Palette: warm creamy ivory, caramel brown coffee, forest green and theme green #10B981 glazing, a quiet honey gold accent.
Constraints: actual transparent alpha background, no filled background, no drawn checkerboard, no ground, no ground shadow, no text, no logos, no watermark, no frame, no extra objects.
```

### 4. 單枝粉杏花

原始檔：`C:/Users/scott/.codex/generated_images/01a0f821-2ef9-7572-ac5f-5efd6216d2a7/exec-7377921f-4514-493d-8652-ac67626db729.png`

```text
Use case: illustration-story
Asset type: one standalone transparent botanical prop for a refined mobile UI border interaction.
Primary request: One charming single peach-pink woodland blossom on a complete slender green stem with two small elegant leaves, fully visible from petal tip to stem tip. A single softly cupped five-petal blossom with an apricot heart and a few tiny golden stamens. The stem is gently curved, subtle organic asymmetry, clean silhouette. No bunch, no bouquet, no pot, no seed packet, no separate petals.
Style/medium: beautifully hand-painted fairytale storybook gouache, refined warm paper craft, soft cut paper silhouette, small natural pigment variation and fine delicate outlines, texture inside the flower only. Match a warm brown acorn courier in cream explorer vest and leaf cap and small gouache food props. Designed to stay identifiable at 45px in a mobile interface. Not emoji, not generic vector, not photorealistic, not shiny plastic 3D.
Composition: square transparent canvas with the single flower angled slightly from lower left stem end toward upper right blossom, complete intact object centered. Occupy about 70 percent canvas height. Generous transparent negative space on every side.
Palette: muted peach-pink and apricot petals, a little warm honey gold at the flower center, theme green #10B981 leaves with a restrained forest green stem.
Constraints: actual transparent alpha background, no filled background or checkerboard painted into the image, no scenery, no ground, no ground shadow, no text, no border, no watermark, no additional objects.
```

