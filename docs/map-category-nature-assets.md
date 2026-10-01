# 地圖類型小物素材

本次使用內建 imagegen 生成三組物件 atlas，將每格裁切、修整空白並縮為最長邊 192px。保留 RGBA alpha，沒有用程式繪製或去背。素材位於 `public/images/map-objects/`，只新增 PNG，不修改 Vue 元件。

## 正式 23 類

| 檔名 | 物件 |
| --- | --- |
| library.png | 綠色布面書、金色書籤 |
| stationery.png | 木製鉛筆 |
| post_office.png | 火漆封口信封 |
| hotel.png | 黃銅房間鑰匙 |
| university.png | 紅絲帶學位卷軸 |
| station.png | 青綠色火車 |
| bus_stop.png | 奶油黃色公車 |
| airport.png | 銀色與青綠色飛機 |
| bridge.png | 苔蘚石橋 |
| park.png | 四葉草 |
| forest.png | 橡葉與橡實 |
| waterside.png | 木製釣魚浮標 |
| beach.png | 珍珠色海螺 |
| mountain.png | 雪山琺瑯徽章 |
| zoo.png | 友善小獅子紙片 |
| theme_park.png | 青綠與黃銅摩天輪 |
| art_gallery.png | 風景畫與古典金色畫框 |
| stadium.png | 奶油與棕色皮革足球 |
| movie_theater.png | 珊瑚紅條紋爆米花紙盒 |
| shrine.png | 綠色御守與金色流蘇 |
| roadside.png | 植物圖案紀念銅幣 |
| weather_rain.png | 珊瑚紅雨傘 |
| weather_snow.png | 冰藍雪晶 |

額外保留 `daisy.png` 作為小花圖層。

`pikmin.png` 是複用本地官方平面紅皮克敏 `public/images/friends-comic/pikmin-red.png`。原先嘗試生成三姿態遭影像工具拒絕，因此沒有假造三個姿態檔；由元件對既有皮克敏圖片安排移動和交付前傾，物件保持獨立圖層。

## 原始 atlas

內建產出資料夾：`C:/Users/scott/.codex/generated_images/01a0f852-0885-7593-a2f0-bcbcbfa2c4c5/`

- 第一組：`exec-9065c3cf-6146-4a00-b63b-7ed2bcd025bf.png`
- 第二組透明修正：`exec-a9bff4dc-56cb-439d-b116-de0d5176d2e4.png`
- 第三組透明修正：`exec-f51c620d-c30d-4a43-8f0b-103261e8f1f4.png`

## 提示詞規格

三組均要求：「Use case: illustration-story. Asset type: premium mobile UI animation object atlas, transparent alpha. One refined hand-painted gouache storybook sheet with exactly four columns and two rows of independent isolated objects. Keep all subjects fully inside their own cells, with genuine alpha transparency and generous separation. Refined cream, forest green, gold and coral accents, painted paper grain, crisp detailed silhouettes that read at 45px on a phone. No emoji, vector symbols, panel background, labels, ground, shadow or watermark.」

1. 第一組依序：closed emerald cloth-bound book with gold bookmark; wooden graphite pencil with pink eraser; cream sealed envelope with red wax seal and green stamp; brass key with emerald wooden tag; rolled ivory diploma with red ribbon; turquoise locomotive facing right; cream/yellow bus facing right; silver/teal airplane miniature.
2. 第二組依序：mossy stone arched bridge; four leaf clover; oak leaf with acorn; red/cream wooden fishing float and teal line; peach spiral shell; snow mountain enamel pin; seated friendly golden lion paper cutout; teal/gold ferris wheel miniature.
3. 第三組依序：gold antique frame with green countryside painting; vintage cream/tan stitched soccer ball; coral/cream popcorn carton; forest green shrine charm with gold tassel and red cord; bronze sprout emblem coin; open coral umbrella with wooden curved handle; icy blue snow crystal; white daisy with golden center and green stem/leaf.

第二、三組第一輪帶有彩色背景，另用背景提取提示詞修正：「Remove ONLY the colored blurry background completely. Preserve all eight object shapes, colors, gouache textures, exact placement and scale. Produce real transparent alpha PNG with alpha zero around and between objects and through openings. No colored backdrop, glow or ground. Preserve four by two grid placement. Do not replace background with white or checkerboard pixels.」

## 檢查

所有 24 個物件 PNG 都含透明 alpha 0 區域與可見主體。尺寸、檔案大小及來源 atlas 格號記錄於 `output/map-objects-review/nature-alpha-report.json`。
