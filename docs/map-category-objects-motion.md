# 地圖種類：邊框小物互動

43 個一般種類沿用正式 `useDecorRules.ts` ID。每種類型各有一張透明物件圖；搬運角色使用皮克敏，小物不使用飾品皮克敏照片。

主要操作與已選取按鈕保持 Header 綠 `#10B981` 配白字。小物以暖金、乾燥玫瑰、灰綠、灰藍四組點綴色統一紙片質感。這些點綴不改變地圖紅黃綠的數量語意。

## 六組動畫腳本

| 家族 | 觸發與起始 | 動作順序 | 選取結果 | 取消與中斷 |
| --- | --- | --- | --- | --- |
| `courier` 皮克敏搬運 | 點選未選取種類；角色和小物在畫面外 | 皮克敏與獨立的小物圖層一同入場 → 角色前傾交接 → 小物放下 → 角色離開 | 小物留在邊框，角色已離場 | 時間軸反向：角色回來 → 拿起小物 → 帶離。中途取消直接從目前進度反向，不重新進場 |
| `cafe` 托盤上桌 | 點選未選取種類；托盤與餐點收在邊框下方 | 托盤滑入 → 餐點落下 → 微弱熱氣出現 | 餐點安穩留在托盤上；熱氣保持低幅度或停在完整造型 | 熱氣先收 → 餐點與托盤收回；快速切換從目前進度續播或倒播 |
| `orbit` 邊框行進 | 點選未選取種類；小物隱藏在邊框起點 | 小物沿短邊框移動 → 依種類轉彎、傾斜或輕彈 → 停靠 | 小物停在角落，文字和勾選符號保持清楚 | 沿原路退回；中斷時保留目前位置並倒播 |
| `pocket` 紙袋探出 | 點選未選取種類；袋口閉合，小物藏在袋內 | 袋口張開 → 小物從袋口露出 → 袋口輕合固定 | 小物部分露出，袋口成為邊框的小收納 | 袋口重新開 → 小物縮回 → 袋口合上；重複操作不建立第二個物件 |
| `book` 紙頁展開 | 點選未選取種類；封面合上，小物在內頁 | 封面打開 → 紙頁錯開 → 小物與書籤露出 | 展開的紙頁和物件留在角落 | 先收小物 → 紙頁摺回 → 封面合上；中途反向維持層次 |
| `garden` 自然展露 | 點選未選取種類；自然物件收在基座或邊框下 | 植物舒展、水波擴散、山丘升起、雨雪落下；依 `motif` 特化 | 主物件留在邊框，裝飾不持續搶奪閱讀注意力 | 裝飾先退 → 主物件收回；中斷反向，沒有殘留水波或雪片 |

## 43 種對照

PNG 原始素材保存在 `public/images/map-objects/{id}.png`；介面使用 192px 長邊的 `/images/map-objects/{id}.webp`，保留透明背景與三倍手機像素密度所需解析度。單一設定出口為 `getMapTypeObject(id)`。

| ID | 中文種類 | 家族 | motif | 小物與動作 |
| --- | --- | --- | --- | --- |
| restaurant | 餐廳 | courier | serve | 皮克敏送餐盤，放在邊框後離開 |
| cafe | 咖啡廳 | cafe | steam | 托盤與咖啡上桌，熱氣升起 |
| sweetshop | 甜點店 | courier | serve | 皮克敏輕放蛋糕 |
| bakery | 麵包店 | cafe | bake | 烤盤帶來可頌，暖氣輕散 |
| burger | 漢堡店 | courier | serve | 皮克敏送漢堡，取消再拿走 |
| italian | 義式餐廳 | orbit | serve | 披薩沿邊框滑入，輕轉定位 |
| ramen | 拉麵店 | cafe | steam | 麵碗上桌，熱氣升起 |
| sushi | 壽司店 | orbit | serve | 壽司滑到小餐墊上 |
| curry | 咖哩餐廳 | cafe | steam | 咖哩盤上桌，暖氣升起 |
| korean | 韓式餐廳 | cafe | steam | 料理鍋上桌，細緻熱氣升起 |
| taco | 墨西哥餐廳 | courier | serve | 皮克敏把塔可留在邊框 |
| convenience | 便利商店 | pocket | pack | 紙袋張開，小物露出 |
| supermarket | 超市 | courier | pack | 皮克敏放下採買小物 |
| cosmetics | 化妝品商店 | orbit | sparkle | 化妝品滑入，轉正閃出柔光 |
| clothing | 服飾店 | pocket | pack | 摺好的衣物從紙袋露出 |
| electronics | 電器行 | orbit | power | 小電器滑入，亮起通電提示 |
| hardware | 五金行 | orbit | tool | 工具輕轉後定在邊框 |
| library | 圖書館／書店 | book | page | 書本開合，紙頁與書籤展開 |
| stationery | 文具店 | pocket | write | 鉛筆從紙袋露出 |
| pharmacy | 藥局 | pocket | care | 藥品從小藥袋露出 |
| hair_salon | 美髮院 | orbit | snip | 美髮小物轉正入席 |
| laundry | 自主洗衣店&乾洗店 | orbit | wash | 洗衣小物旋轉後停穩 |
| post_office | 郵局 | pocket | mail | 信封從袋口探出 |
| hotel | 飯店 | pocket | stay | 房間鑰匙從口袋露出 |
| university | 大學&學院 | book | study | 課本紙頁展開，學院小物露出 |
| station | 車站 | orbit | ride | 列車沿邊框行進並停靠 |
| bus_stop | 公車站 | orbit | ride | 公車減速進站 |
| airport | 機場 | orbit | flight | 飛機傾斜掠過並停靠 |
| bridge | 橋樑 | orbit | cross | 橋樑紙片水平展露 |
| park | 公園 | garden | grow | 四葉草逐層舒展 |
| forest | 森林 | garden | grow | 種子落定，枝葉舒展 |
| waterside | 水邊 | garden | water | 水邊小物落定，水波擴散 |
| beach | 海邊 | garden | water | 小浪露出貝殼，水波退開 |
| mountain | 山丘 | garden | mountain | 山丘紙片前後錯層升起 |
| zoo | 動物園 | courier | discover | 皮克敏送來園區小紀念 |
| theme_park | 主題樂園 | orbit | ride | 樂園小物旋轉入席 |
| art_gallery | 美術館 | book | page | 展覽目錄打開，畫作露出 |
| stadium | 體育館 | orbit | play | 球沿邊框滾動、輕彈、停穩 |
| movie_theater | 電影院 | pocket | watch | 爆米花從紙袋探出 |
| shrine | 神社 | orbit | charm | 御守滑入並輕擺 |
| roadside | 路邊 | pocket | discover | 偶遇的小貼紙從袋口露出 |
| weather_rain | 雨天 | garden | rain | 小傘展露，雨滴和漣漪依序出現 |
| weather_snow | 下雪 | garden | snow | 雪花展開，細雪落下 |

## 手機與狀態規則

- 點擊先更新勾選與查詢狀態，動畫接著表達選取結果，不等動畫結束才完成操作。
- 列上只呈現一個小物；動作在角落和邊框發生，不遮住種類文字、勾選或相鄰觸控區。
- 初次掛載、重新展開篩選、從儲存狀態還原：直接呈現目前選取結果，不讓所有已選種類同時進場。
- 直接點擊：只播放剛操作的種類。反覆切換時重用同一時間軸；續播或倒播，不新增複製物件、不排隊。
- 全選、清除、外部批次同步：直接切到結果。必要的整體回饋由全選／清除按鈕負責，避免 43 個種類同時演出。
- 使用者選擇減少動態：直接呈現終態，保留小物和勾選，不播放搬運、翻頁或落雨。
- 關閉或卸載：停止時間軸、清除延後工作及監聽器。重新開啟按目前選取狀態重建。
- 螢幕外物件不持續播放裝飾循環；介面以透明 WebP 和固定比例呈現，安卓與 iOS 不依賴 emoji 字型或 hover。

## 素材與實作分工

- 種類設定及動畫語意：`app/utils/mapTypeObjects.ts`。
- 20 個餐飲／購物／生活物件：`category_object_art` 素材工作。
- 23 個自然／交通／文化物件及官方平面皮克敏圖：`category_nature_art` 素材工作。
- 共用時間軸與正式篩選按鈕整合：`TypeButtonEffect.vue`，由主工作整合。

本文件記錄已選方向與對應腳本；視覺驗證結果由正式按鈕整合工作記錄。

## 純種模式篩選

### 類型按鈕表面修整（2026-10-02）

- 參考 Josh W. Comeau 的 https://www.joshwcomeau.com/animation/3d-button/ 及 Codrops 的 https://tympanus.net/codrops/2015/02/11/subtle-click-feedback-effects/ 。借用薄底座、光邊及明確觸控回饋，主綠維持 #10B981。
- 觸發：點選類型。起始：完整圓角面板、細光邊與薄底座，沒有撕角。
- 順序：保留既有 GSAP 下壓／回彈；選取底色和勾選即時切換，種類物件沿原時間軸送來。
- 結果：主綠白字、明確白色勾選座；指尖離開後不留下厚外框，鍵盤焦點使用獨立細框。
- 收回與中斷：取消沿原時間軸收回物件；快速連點沿用 overwrite 與反向時間軸，減少動態與卸載清理保持原有處理。

`PureModeSelector.vue` 同樣採用單欄 64px 以上按鈕、編號及清楚種類名稱，與一般篩選共用 `TypeButtonEffect.vue`。種類小物在上緣出現，選取和取消沿用六組動畫；已選主綠配白字即時切換，避免背景仍是白色時文字先變白。

純種列表維持原本 35 種與順序，全部 ID 都屬於上述正式 43 種。來源已核對 `public/data/regions/taiwan_main_island/single/index.json` 與 `map.vue` 的 `getSingleTypeDataUrls`：35 種各有可讀純種資料，森林讀取兩個分檔。其餘四個新餐飲種類 `sushi`、`curry`、`korean`、`taco` 尚無這組台灣純種 JSON；神社屬日本限定，路邊和天候也不在台灣純種資料中，本次不增加沒有資料的入口。

- 點擊只播放剛操作的種類，按鈕本身另有短暫下壓與彈回，快速連點會覆蓋前次動作。
- 熱門選擇、清除全部與初始狀態直接呈現小物的結果，不同時播放 35 組動畫。
- 清單使用一個 IntersectionObserver，只在曾經進入視窗的種類掛載小物。關閉時停止觀察並清理按鈕動畫，重新開啟保留清單位置。
- 減少動態偏好略過按鈕彈回；物件由共用元件直接呈現終態。
- 保留快取載入、教學、社群純點入口、社群圖層開關及拖曳收合流程。


