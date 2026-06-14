請將這個網站優化成一個更高質感、更有產品敘事感的互動式 mobile web 體驗。

不要把網站重新設計成完全不同的風格。請保留目前既有的 Pikmin Bloom 視覺語言，包括薄荷綠主色、柔和背景、圓角卡片、glass / soft UI 質感、可愛但乾淨的圖鑑氛圍、目前的 icon 風格、按鈕風格與整體品牌個性。

這次的設計重點不是單純加入動畫，而是使用 GSAP 和 ScrollTrigger，把頁面滾動設計成一個有邏輯的產品故事。

請使用底部導航作為整個 scroll storytelling 的主線：

首頁 → 圖鑑 → 地圖 → 好友 → 放生皮

當使用者往下滾動時，每一個主要區塊都應該對應到底部導航的一個項目。底部導航的 active 狀態要隨著目前所在區塊平滑切換，讓它像一個章節進度提示，而不是只是靜態導航。

---

## 整體故事結構

### 設計原則：不受限於現有 UI，可重新設計體驗

動畫與敘事不必完全建立在目前網站的 UI 結構之上。

除了保留品牌識別與核心功能外，可以重新設計：

* Hero 視覺
* 功能展示方式
* 卡片結構
* 資訊架構
* Scroll Story 流程
* 地圖呈現方式
* 圖鑑展示方式
* 好友互動介面
* 收藏管理介面

目標不是把現有畫面加動畫，而是打造一個更能凸顯 Pikmin Bloom 收藏體驗的互動產品展示頁。

允許新增全新的概念 UI，例如：

* Collection Galaxy（收藏星圖）
* Decor Tree（飾品成長樹）
* Bloom Journey（收藏旅程時間軸）
* Garden Network（全球好友花園網路）
* Discovery Radar（飾品探索雷達）
* Collection Vault（收藏倉庫）
* Missing Decor Compass（缺少飾品指南針）
* Pikmin Habitat Map（皮克敏棲地地圖）

但必須符合以下原則：

* 保留 Pikmin Bloom 花園感
* 保留薄荷綠與柔和色系
* 保留圓角與玻璃感設計語言
* 保留收藏圖鑑核心定位
* 不要變成科技產品網站
* 不要變成遊戲官網
* 不要變成 NFT 展示頁
* 不要變成 Dashboard 模板

新的 UI 必須服務於功能理解，而不是單純追求視覺炫技。

---

### 1. 首頁：掌握今天的收藏狀態

首頁區塊要讓使用者一進來就理解這個網站的核心用途：

這是一個幫助使用者追蹤 Pikmin Bloom 飾品收藏進度、查看缺少項目、快速掌握本月收藏狀態的工具。

可以保留目前首頁元素，也可以重新設計成更具產品感的 Hero。

例如：

方案 A（保留現有架構）

* 主標題「蒐集你的 Pikmin 飾品」
* Garden Tracker badge
* Featured Decor 卡片
* 本月缺少項目
* 收集進度圓環
* 培育清單

方案 B（重新設計）

* 中央大型 Collection Orb
* 周圍環繞已蒐集 Decor
* 缺少 Decor 以半透明形式呈現
* 收藏進度作為環形軌道
* 今日探索狀態作為浮動資訊卡

動畫方向：

* Header 穩定進場，不要過度動畫
* Hero 標題用慢半拍、柔和 reveal
* 收藏元素逐步聚集形成完整畫面
* 已蒐集項目逐步點亮
* 缺少項目保持柔和半透明
* 進度數據自然建立

首頁動畫要有高級感、乾淨、慢半拍，不要彈跳或過度可愛。

---

### 2. 圖鑑：打開完整飾品分類

圖鑑區塊要讓使用者理解：

這裡可以瀏覽完整飾品分類、查看已蒐集與未蒐集狀態。

可以不使用傳統列表式圖鑑。

可考慮：

方案 A

* 保留分類卡片

方案 B

* Decor Collection Tree
* 飾品依分類長成樹狀結構

方案 C

* Collection Galaxy
* 每個分類是一個星系節點

方案 D

* Bloom Shelf
* 像收藏展示櫃一樣排列

當滾動進入圖鑑區塊時：

* 底部導航 active 狀態從「首頁」平滑移到「圖鑑」
* 圖鑑 icon 與文字變成 active 狀態
* 收藏分類逐步展開
* 已蒐集項目保持清楚
* 未蒐集項目以柔和方式呈現
* 不要做誇張 3D 翻書效果

這一段的重點是讓使用者理解：

「我可以在這裡完整檢查每一類 Pikmin 飾品。」

---

### 3. 地圖：找到缺少飾品的位置

地圖區塊是整個 scroll storytelling 最有記憶點的功能展示，也是整頁唯一可以稍微提高敘事張力的段落。

這裡可以完全重新設計，不必受限於現有地圖 UI。

推薦方向：

方案 A：Pikmin Garden Map

* 花園式探索地圖
* 柔和道路
* 探索區域
* 收藏熱點

方案 B：Discovery Radar

* 中央探索雷達
* 缺少 Decor 作為目標訊號
* 掃描後定位位置

方案 C：Habitat Explorer

* 不同 Decor 對應不同棲地
* 使用者逐步發現缺少項目來源

當滾動進入地圖區塊時：

* 底部導航 active 狀態從「圖鑑」平滑移到「地圖」
* 地圖成為視覺焦點
* 探索訊號逐步建立
* 發現缺少 Decor
* 顯示位置資訊
* 引導至「飾品地點地圖」CTA

請注意：

不要直接做成 Google Map 複製品。

要做成符合網站風格的探索體驗。

視覺語言應該是：

* 淡淡道路線
* 柔和掃描圈
* 圓潤定位 pin
* 透明 glass preview card
* 小型飾品縮圖
* 薄荷綠與柔和白色為主
* 不要使用強烈 Google Map 色彩
* 不要過度寫實
* 不要破壞原本柔和花園感

這段動畫的功能目的：

讓使用者理解「這個地圖可以幫我找到缺少飾品的位置」。

---

### 4. 好友：全球交友、分享與一起補缺

好友系統是已存在且主打全球交友的重要功能。

這一段可以重新設計成更具特色的全球交流體驗。

推薦方向：

方案 A：Garden Network

* 全球好友節點網路
* 不同國家形成花園連結

方案 B：World Bloom Map

* 世界地圖上的好友分布
* 收藏交流資訊浮現

方案 C：Friend Constellation

* 每位好友是一顆星點
* 收藏關係形成星座

當滾動進入好友區塊時：

* 底部導航 active 狀態從「地圖」平滑移到「好友」
* 好友 icon 變成 active
* 全球好友節點逐步建立
* Friend Code 卡片展開
* 收藏比較資訊出現
* 共同缺少項目被 highlight
* 社群互助資訊逐步呈現

視覺上可以營造：

* 全球好友網路
* 收藏交流
* 一起補缺
* 社群互助

但仍維持產品感與閱讀性，不要做成社群媒體風格。

這段動畫要讓使用者明確理解：

「這不只是圖鑑工具，也是全球 Pikmin Bloom 玩家交流平台。」

---

### 5. 放生皮：整理重複與管理收藏

放生皮區塊的敘事重點不是「丟掉」，而是「整理收藏」。

這裡可以重新設計成收藏管理中心，而不是單純列表。

推薦方向：

方案 A：Collection Vault

* 收藏倉庫
* 重複項目自動分類

方案 B：Garden Storage

* 花園收納區
* 收藏整理流程視覺化

方案 C：Collection Organizer

* 重複項目整理工作台
* 收藏狀態重新排列

請用溫和、非破壞性的視覺語氣呈現：

* 管理重複項目
* 整理不需要的皮克敏
* 讓收藏狀態更清楚
* 幫使用者維持乾淨的圖鑑進度

當滾動進入放生皮區塊時：

* 底部導航 active 狀態從「好友」平滑移到「放生皮」
* 放生皮 icon 變成 active
* 重複項目卡片出現
* 重複項目被輕輕移入整理區
* 收藏狀態重新排列
* 最後畫面回到乾淨穩定狀態

不要讓這段看起來像刪除或丟棄。

請讓它看起來像「溫柔整理收藏」。

---

## 底部導航動畫設計

底部導航是整個 scroll story 的核心 anchor，也是章節進度指示器。

請實作：

* active 綠色 pill 隨著目前 section 平滑移動
* icon 與 label 在 active 時變白
* inactive icon 保持灰色
* active 切換時有輕微 scale 與 y 位移
* 動畫要柔和、穩定、有產品感
* 不要使用誇張 bounce
* 不要讓 icon 動畫搶走內容焦點

建議動畫感覺：

* duration: 0.45s ~ 0.6s
* ease: power3.out
* active pill 平滑滑動
* icon scale 0.94 → 1
* label opacity 0.75 → 1

底部導航應該同時保有實際導航功能。

Scroll 中的 active 狀態則負責告訴使用者目前正在觀看哪個功能章節。

---

## GSAP / ScrollTrigger 實作要求

請優先使用 GSAP 實作動畫。

除了基本 GSAP 功能外，也可以善用 GSAP AI Skill 或相關 AI-assisted workflow 協助產生 timeline 草稿、ScrollTrigger 配置與動畫原型，再由開發者進一步調整成符合產品需求的最終版本。

可以使用：

* GSAP timeline
* ScrollTrigger
* stagger
* scrub
* pin
* matchMedia
* quickTo
* onEnter / onLeaveBack
* gsap.context
* Flip（適合卡片重組或狀態切換）
* MotionPathPlugin（若地圖需要柔和路徑動畫）
* GSAP AI Skill 作為動畫規劃輔助工具

使用原則：

* Hero 和 section entrance 使用 timeline 管理
* scroll-based feature highlight 使用 ScrollTrigger
* 只有在需要用滾動控制產品狀態時才使用 scrub
* 只有在需要解釋重要功能時才使用 pin
* 不要每個區塊都 pin
* 不要每個元素都 parallax
* 不要只做 fade in / slide up
* 每段 scroll animation 都必須 highlight 某個功能或產品價值

ScrollTrigger 要自然：

* start / end 不要太早或太晚
* pin 不要過長
* scrub 不要影響閱讀
* mobile 上減少 pin、scrub 和 parallax
* reduced motion 時關閉複雜動畫

---

## Motion 風格要求

整體動畫風格請保持：

* premium
* smooth
* subtle
* calm but alive
* soft garden
* playful but clean
* product-focused
* 不要廉價彈跳
* 不要 cyberpunk
* 不要 neon
* 不要過度旋轉
* 不要過度發光
* 不要像動畫模板庫直接套用

動畫應該讓 UI 更有質感，而不是讓使用者注意到「這裡有動畫」。

整體節奏建議：

* 首頁安靜建立品牌感
* 圖鑑展示收藏深度
* 地圖作為主要高潮
* 好友展示全球交流特色
* 放生皮溫柔收斂
* Footer 安靜收尾

---

## Performance 要求

請優先動畫：

* transform
* opacity
* translate3d
* scale
* scaleX
* rotate，少量使用

避免動畫：

* width
* height
* top
* left
* margin
* padding
* 大量 blur
* 大量 backdrop-filter
* 大量 box-shadow
* 大量 filter 疊加

進度條請使用 scaleX，不要動畫 width。

大型卡片請使用 transform，不要改變 layout。

Scroll animation 不得造成 layout shift。

---

## Mobile / Reduced Motion

Mobile 上請簡化動畫：

* 減少 pin
* 減少 scrub
* 減少 parallax
* 縮短 duration
* 保留功能 highlight
* 優先閱讀與滑動順暢

由於目前網站本身以手機體驗為主，請特別避免過長 pin 與過度複雜的 scroll choreography。

必須支援 prefers-reduced-motion：

* 關閉 pin-heavy animation
* 關閉 scrub-heavy animation
* 關閉 parallax
* 關閉 pointer-follow
* 保留基本 opacity reveal
* 確保所有資訊不用動畫也能理解

---

## 最終交付回報

完成後請回報：

1. 這次使用的 motion direction
2. 保留了哪些原網站風格
3. 哪些 UI 元素被優化
4. 使用了哪些 GSAP 技術
5. 哪些元素有進場動畫
6. 哪些元素有 hover / interaction 動畫
7. 哪些 section 使用 scroll-based animation
8. 底部導航如何作為 scroll story 章節指示器
9. 每個 section 對應哪個 nav item
10. 地圖區塊如何 highlight「找到缺少飾品位置」
11. 好友區塊如何呈現全球交友特色
12. mobile 上如何簡化動畫
13. reduced motion 如何處理
14. 如何避免動畫過度或卡頓
15. 是否使用 GSAP AI Skill 協助規劃與哪些部分使用
16. 哪些動畫被降低強度或刪除，原因是什麼

最後請提供自評分數：

* Motion design：/10
* GSAP implementation：/10
* Interaction feel：/10
* Scroll experience：/10
* Functional highlight clarity：/10
* Bottom nav storytelling：/10
* Original style preservation：/10
* Performance：/10

如果 Functional highlight clarity 低於 8.5，請重新調整 scroll animation。

如果 Original style preservation 低於 8.5，請降低新元素比例，回到原網站風格。

如果 Performance 低於 8.5，請簡化動畫，減少 blur、shadow、filter，並優先使用 transform 與 opacity。
