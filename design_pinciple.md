## Existing Website Style Preservation

請不要把頁面重新設計成完全不同的風格。
這個任務不是重新發明整個視覺系統，而是在保留原本網站風格的前提下，提升 UI 質感、互動感與 scroll storytelling。

你必須先觀察並延續原網站既有的設計語言，包括：

* 原本的色彩系統
* 原本的圓角尺度
* 原本的字體氣質
* 原本的卡片樣式
* 原本的 spacing 節奏
* 原本的背景氛圍
* 原本的按鈕風格
* 原本的 icon / illustration / mockup 風格
* 原本的產品個性與品牌感

除非原本設計明顯影響可讀性、層級或質感，否則不要大幅改變既有視覺方向。

---

## Preserve First, Enhance Second

請遵守以下順序：

1. 先保留原本網頁的核心視覺風格
2. 再修正不清楚、不成熟或層級混亂的部分
3. 最後才加入 animation、GSAP interaction 與 scroll-based highlight

不要為了做動畫而破壞原本風格。
不要把原本簡潔、溫和、乾淨的網站改成過度 cyberpunk、neon、炫技或模板感的風格。

動畫應該像是原網站自然長出來的一部分，而不是另外套上去的特效。

---

## Style Lock Elements

以下元素應盡量維持原本網站風格，不要任意重做：

* Header / Navbar 的基本結構
* Logo 與品牌識別
* 主色與輔助色
* 核心 CTA 按鈕樣式
* 卡片的基礎造型
* 主要字體與文字氣質
* 網站整體情緒，例如極簡、柔和、玻璃感、可愛、專業、日系、科技感等

可以優化：

* spacing
* visual hierarchy
* alignment
* contrast
* hover feedback
* scroll transition
* section rhythm
* card depth
* button interaction
* functional spotlight

但優化時必須延續原本設計語言。

---

## Motion Must Match Existing Style

所有動畫都必須符合原本網頁的視覺個性。

如果原網站是乾淨、極簡、柔和的風格：

* 使用 subtle opacity
* 輕微 y transform
* 慢速 parallax
* 柔和 stagger
* 克制的 spotlight
* 不使用誇張旋轉、強烈 glow、大幅縮放

如果原網站是 glass / liquid / premium 風格：

* 使用細膩的 highlight shift
* 低強度光澤流動
* 輕微 3D depth
* pointer-follow reflection
* glass card 的 subtle motion
* 避免過度 blur 或高成本 filter

如果原網站是可愛、插畫或角色導向風格：

* 動畫可以更有生命力
* 但仍需保持節制
* 不要加入廉價彈跳
* 不要讓角色或裝飾元素搶走功能說明焦點

---

## Scroll Animation Should Extend the Existing UI

Scroll animation 的目標不是做一個獨立的動畫展示頁，而是讓原本網站的功能更容易被理解。

請使用原本網站中的 UI 元素作為 scroll storytelling 的素材，例如：

* 原本的產品卡片
* 原本的功能區塊
* 原本的 mockup
* 原本的按鈕
* 原本的 icon
* 原本的角色或裝飾元素
* 原本的背景視覺

不要憑空加入大量不屬於原網站風格的新元素。

Scroll animation 可以做到：

* 讓原本的功能卡片依序被 highlight
* 讓原本的產品 mockup 在滾動時切換狀態
* 讓原本的 UI 區塊被放大、標示、聚焦
* 讓原本的背景元素產生輕微 depth
* 讓原本的 CTA 在功能價值被理解後自然出現
* 讓原本的資訊層級更有節奏地呈現

---

## Original Style Review

完成後請額外 review：

* 是否保留原網站本來的視覺風格？
* 是否有任何元素被改得太突兀？
* 新增動畫是否像原網站自然延伸？
* Scroll animation 是否使用原本的 UI 元素來 highlight 功能？
* 是否加入太多不必要的新裝飾？
* 是否讓網站變得比原本更成熟，而不是變成另一個風格？
* 是否仍然能一眼看出這是同一個網站？

如果新的 motion design 讓網站看起來像完全不同的品牌，請重新調整，優先回到原本網站風格。

## Scroll Animation / Scroll Storytelling 設計要求

請不要把 scroll animation 視為「滾到某區塊就讓元素淡入、上移、縮放」的裝飾效果。
Scroll animation 必須成為產品敘事、功能展示與視覺重點引導的一部分。

滾動動畫的核心目標是：

* 讓使用者在滾動過程中逐步理解產品功能
* 用動畫 highlight 目前最重要的功能或 UI 狀態
* 把抽象功能轉化成可被看懂的視覺變化
* 透過 pin、scrub、stagger、parallax、state transition 建立「逐步揭示」的體驗
* 讓使用者感覺自己正在探索產品，而不是被動看動畫播放

---

## Scroll Animation 的設計方向

每一個 scroll animation 都必須回答：

1. 這段滾動要讓使用者注意到什麼？
2. 這段滾動要解釋哪個功能、價值或使用情境？
3. 動畫開始前，使用者看到的是什麼狀態？
4. 滾動過程中，畫面如何逐步 highlight 重點？
5. 動畫結束後，使用者應該理解什麼？
6. 這段動畫是否真的讓功能更清楚，而不是只是更花？

不要只做：

* fade in
* slide up
* scale in
* random parallax
* 卡片依序出現
* 背景裝飾物移動
* 無意義的文字 reveal

請優先做：

* 功能狀態切換
* UI mockup 隨滾動展示不同功能
* 手機、dashboard、產品畫面固定在視窗中，旁邊文字逐步解釋
* 滾動到某段時，放大、聚焦或標示該功能區域
* 非重點內容降低 opacity，讓焦點更清楚
* 透過 timeline labels 分段呈現「問題 → 功能 → 結果」
* 使用 scrub 讓使用者用滾動控制產品畫面變化
* 使用 pin 讓重要產品展示區停留足夠久
* 用 stagger 呈現資訊層級，而不是所有資訊一起出現

---

## Scroll-based Functional Spotlight

如果頁面有產品功能、工具特色、流程步驟或 UI mockup，必須設計成 scroll-based functional spotlight。

每個 spotlight section 至少包含：

* Feature name：目前 highlight 的功能名稱
* User problem：這個功能解決什麼問題
* Visual focus：畫面中哪個 UI 元素被聚焦
* Motion behavior：滾動時如何轉場、放大、切換或標示
* User takeaway：使用者滾完這段後應該記住什麼

範例結構：

```txt
Section: Smart Search

Scroll stage 1:
使用者先看到完整 dashboard，畫面保持穩定，不急著動畫。

Scroll stage 2:
搜尋框輕微放大，其他 UI 降低 opacity，視線集中到搜尋功能。

Scroll stage 3:
輸入關鍵字的過程以短 timeline 呈現，相關結果卡片依序浮現。

Scroll stage 4:
搜尋結果被分組 highlight，讓使用者理解這不是普通搜尋，而是有智慧分類。

Scroll stage 5:
畫面回到穩定狀態，旁邊出現一句清楚的功能價值文案。
```

---

## Scroll Animation 敘事模型

請使用以下模型設計 scroll animation：

### 1. Establish

先建立整體畫面，讓使用者知道自己正在看什麼。

### 2. Focus

透過 opacity、scale、mask、outline、spotlight、camera movement 或 subtle glow 聚焦重點。

### 3. Explain

搭配文字、標籤、註解、UI state change，解釋功能正在發生什麼。

### 4. Transform

讓產品畫面隨滾動產生狀態變化，例如資料被整理、任務被完成、介面從混亂變清楚。

### 5. Resolve

動畫收尾後要回到穩定、可閱讀、可理解的畫面，不要停在尷尬的 transform 狀態。

---

## GSAP ScrollTrigger 使用規範

設計 scroll animation 時，請優先使用 GSAP ScrollTrigger 建立功能敘事段落。

可以使用：

* `pin`：讓重要展示區固定，給使用者足夠時間理解功能
* `scrub`：讓產品畫面跟隨滾動逐步變化
* `timeline`：管理多階段功能展示
* `labels`：標記每個功能展示階段
* `stagger`：讓文字、標籤、卡片有節奏地出現
* `matchMedia`：desktop 使用較完整的 scroll storytelling，mobile 使用較短、更直接的動畫
* `onEnter / onLeaveBack`：控制狀態切換
* `quickTo`：用於 pointer-follow 或 micro interaction，不要濫用在大量元素上

ScrollTrigger 的動畫應該符合：

* start / end 位置自然，不要太早觸發
* pin 不要過長，避免使用者覺得頁面卡住
* scrub 不要讓文字閱讀變困難
* 每個 pinned section 都要有明確目的
* mobile 上要減少 pin 與複雜 scrub
* reduced motion 時關閉 pin-heavy 或 scrub-heavy animation

---

## Scroll Animation 的視覺聚焦方法

為了 highlight 功能，可以使用以下方法，但要保持克制：

* spotlight：重點區域清楚，其他區域微暗
* zoom-in：輕微放大功能區，不要超過必要程度
* depth：前景 UI 與背景元素有不同速度
* progressive reveal：功能細節分階段出現
* state morph：UI 從初始狀態變成完成狀態
* annotation：用細線、label、tooltip 解釋關鍵功能
* compare：滾動前後對比，呈現功能價值
* sticky device：手機或產品 mockup 固定，內容隨 scroll 切換
* dimming：非重點資訊淡出，避免視覺噪音
* CTA reveal：當功能價值被理解後，才出現 CTA

避免：

* 每個區塊都 pin
* 每個元素都 parallax
* 文字一直跟著 scrub 變形
* 過度旋轉
* 大量 blur / glow
* 整頁像展示動畫技術，而不是展示產品
* 讓使用者滾很久卻沒有得到新資訊

---

## Scroll Animation 交付要求

完成頁面後，必須提供一份 Scroll Story Map，說明每段 scroll animation 的功能目的。

格式如下：

```txt
Scroll Story Map

1. Section name:
2. Highlighted feature:
3. User problem:
4. Scroll behavior:
5. Visual focus method:
6. GSAP technique:
7. User takeaway:
8. Why this animation is necessary:
```

如果某段 scroll animation 無法清楚說明它 highlight 了哪個功能、價值或視覺重點，請移除或重做。

---

## Scroll Animation Review

完成後請額外 review：

* 這段 scroll animation 是否讓功能更容易理解？
* 使用者滾動時是否知道自己該看哪裡？
* 是否有明確的功能 spotlight？
* 是否把產品價值視覺化？
* 是否只是一般 fade in / slide up？
* pin 的時間是否太長？
* scrub 是否影響閱讀？
* mobile 是否過度複雜？
* reduced motion 是否有替代方案？
* 是否看起來像成熟產品頁，而不是動畫 demo？

如果 scroll animation 只是讓畫面變得更炫，但沒有讓功能更清楚，請主動降低動畫強度或重新設計。

---

## 最終回報新增項目

除了原本的 motion review，完成後請額外回報：

1. Scroll animation 如何 highlight 產品功能
2. 每個 pinned section 的目的
3. 每個 scrub timeline 對應的功能狀態
4. 哪些地方使用 visual spotlight
5. 哪些動畫被刪除或降低強度，原因是什麼
6. mobile 上如何簡化 scroll storytelling
7. reduced motion 下保留了哪些必要資訊
8. Scroll Storytelling 自評分數：/10
9. Functional Highlight Clarity 自評分數：/10

如果 Functional Highlight Clarity 低於 8.5，請重新設計 scroll animation，直到每段滾動都能清楚說明「它在強調什麼功能、為什麼重要、使用者看完會理解什麼」。
