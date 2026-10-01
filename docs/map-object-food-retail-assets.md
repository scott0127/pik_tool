# 地圖類型小物：餐飲、零售與生活服務

使用內建 imagegen 生成兩張透明 3 × 3 素材圖；burger 與 cafe 沿用已通過 motion-lab 視覺確認的漢堡與咖啡。沒有生成皮克敏，角色搬運由另一組素材處理。

## 已保存的 20 個檔案

`public/images/map-objects/{id}.png`

| ID | 物件 |
|---|---|
| restaurant | 奶油白與灰綠餐盤蓋 |
| cafe | 已有的咖啡與杯碟 |
| sweetshop | 草莓蛋糕切片 |
| bakery | 奶油可頌 |
| burger | 已有的漢堡 |
| italian | 羅勒披薩切片 |
| ramen | 蛋與蔥花拉麵 |
| sushi | 木盤壽司 |
| curry | 咖哩飯 |
| korean | 蔬菜陶鍋 |
| taco | 墨西哥塔可 |
| convenience | 牛奶瓶與三明治 |
| supermarket | 蔬果麵包購物籃 |
| cosmetics | 金色唇膏 |
| clothing | 淺藍摺好襯衫 |
| electronics | 奶油白烤麵包機 |
| hardware | 木柄鐵鎚 |
| pharmacy | 琥珀藥瓶 |
| hair_salon | 木梳與剪刀 |
| laundry | 摺好毛巾的洗衣籃 |

所有輸出都是 RGBA PNG，保留原始 alpha；尺寸約 192–428 px，適合介面 50–70 px 顯示。原圖每個 nominal grid cell 為 418 px；窄物件裁掉透明留白後自然較窄。

## 裁切與來源

- 原始餐飲 atlas：`output/map-object-art/food-atlas.png`（1254 × 1254）。
- 原始零售 atlas：`output/map-object-art/retail-atlas.png`（1254 × 1254）。
- alpha 與裁切紀錄：`output/map-object-art/food-retail-alpha-report.json`。
- 重現工具：`scripts/crop-map-object-atlases.py`，只 crop/trim 與複製已有資產，沒有重新上色、放大、繪製或改寫 alpha。以 alpha > 16 計算裁切範圍，留 8 px 邊距；原 alpha 像素保留不變。拒絕覆蓋已有檔案。
- 兩張圖皆以 `public/images/motion-lab/burger.png` 與 `coffee.png` 作風格參考。
- 透明驗證：18 個新檔案 alpha extrema 都是 `(0, 255)`，另兩張原檔直接複製。五個代表素材另外以實際像素檢視：restaurant、korean、convenience、pharmacy、hair_salon。

## 提示詞

### 餐飲 atlas

Use case: stylized-concept. Asset type: production-ready transparent object atlas for a mobile game inspired map filter UI. Input images: both references are style references only, preserve the refinement and painterly material quality, not their subjects. Create ONE large square 2048x2048 RGBA transparent atlas containing precisely NINE separate gorgeous miniature gouache object illustrations, in an exact regular 3-column by 3-row grid. Each grid cell contains exactly one centered object illustration with generous transparent padding; do not draw the grid or labels. Read left to right, top to bottom: row 1 = (1) restaurant: an elegant small ivory covered serving plate with a sage-green knob, (2) sweet shop: a single beautiful strawberry layer cake slice topped with a fresh strawberry, (3) bakery: one flaky buttery croissant; row 2 = (4) Italian restaurant: a single triangular pizza slice with basil and melted cheese, (5) ramen shop: a small ivory ramen bowl with curled noodles, half egg and scallions, (6) sushi shop: a small wooden tray with two neatly crafted sushi pieces; row 3 = (7) curry restaurant: a small ivory plate with separated fluffy rice and golden brown curry, (8) Korean restaurant: a small terracotta hotpot filled with bright vegetables and stew, (9) Mexican restaurant: one folded crunchy taco filled with lettuce, tomatoes and meat. Each subject must be fully contained inside its own cell, with ALL shadows and fine edges isolated from all other cells. Match the warm hand-painted children's storybook gouache look of the references: richly detailed yet legible at tiny UI size, creamy highlights, natural soft volume, tactile paper brush texture inside objects, carefully drawn contours, delicious warm golds, deep sage accents. Front three-quarter view consistent across every item, level baseline, not dramatic perspective. No lettering, no text, no numbers, no characters, no faces, no logos, no emoji look, no geometric flat vector art, no background, no borders, no decorative sparkles or steam crossing cell boundaries. True transparent background with preserved alpha; absolutely no painted checkerboard, no opaque paper rectangle. Every cell should be at least 384px wide. Production atlas, refined standalone cutouts.

### 零售與服務 atlas

Use case: stylized-concept. Asset type: production-ready transparent object atlas for mobile UI category button animations. Input images are style references only. Create ONE large square 2048x2048 RGBA transparent atlas of EXACTLY NINE separate exquisite miniature gouache object illustrations, perfectly organized in an exact 3-column, 3-row grid with transparent gutters. There is no grid drawing or lettering. Read left to right, top to bottom: row 1 = (1) convenience store: a small vintage cream glass milk bottle with sage cap beside a tiny neatly wrapped sandwich, ONE compact grouped cutout, (2) supermarket: a small wicker shopping basket of tomatoes, leafy greens and a French loaf, (3) cosmetics: one elegant cherry-pink lipstick in a brushed gold case with its matching cap tilted beside it; row 2 = (4) clothing shop: one freshly folded warm sky-blue collared shirt, (5) electronics shop: a small classic ivory toaster with sage knobs and one toasted slice peeking out, (6) hardware store: a single beautiful metal hammer with smooth honey-colored wooden handle; row 3 = (7) pharmacy: one amber apothecary bottle with ivory label and small sage cross, cap fitted, absolutely NO text on the label, (8) hair salon: one pair of elegant silver hairdressing scissors crossed with a honey-colored wooden comb, ONE compact grouped cutout, (9) laundry: a low wicker laundry basket holding a tidy stack of cream, sage and pale blue folded towels. Each object is a polished warm hand-painted storybook gouache miniature with rich painterly texture inside the object, carefully shaped edges, elegant soft highlights and gentle dimensionality. Consistent front three-quarter view, level baseline, readable silhouettes at 60px UI display. Materials and brushwork should match the provided burger and coffee illustrations exactly. Natural soft earth colors, cream and deep sage accents, fine warm gold details, one tasteful blush accent for lipstick and one sky-blue accent for shirt. Objects occupy only about 65% of each cell width/height. Keep all alpha pixels fully isolated in their own cells with wide generous clear gutters and outer margins. Every grid cell should be at least 384px wide. No characters, no faces, no extra decorative particles, no emojis, no vector style, no logos, no text, no numbering, no scene, no opaque background, no painted checkerboard. True transparent RGBA background. Each object must be totally visible and independently crop-ready, no touching or overlapping neighboring cells.
