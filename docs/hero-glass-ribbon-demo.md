# 收藏主視覺：緞帶與浮光玻璃

獨立試作路徑：`/hero-lab`。數字是可切換的示範資料，不寫入收藏。

## 動畫腳本

- 起始：緞帶低伏成環／三片玻璃疊合，中央保持百分比可讀，地面有柔和投影。
- 觸發：點主視覺或「展開收藏」。
- 順序：物件先抬升 → 緞帶轉成立體曲面，或玻璃分層拉開 → 地面光影擴散 → 分類標籤出現。
- 互動：橫向拖動改變觀察角度與反射；點分類，緞帶表面、中央數字與周圍資訊一起切換。
- 收回：分類標籤退場 → 物件回到低伏角度／玻璃重疊 → 背景光影收斂。
- 中斷：快速連點從目前展開值接續；切換案例時回到疊合狀態再換物件。直向滑動仍能捲頁，不攔截手機的頁面手勢。
- 減少動態：切換狀態立即完成，停止閒置與捲動視差；離開畫面停止繪製，卸載清理 GSAP、事件、觀察器和 GPU 資源。

## 視覺

兩個案例共用 Header 主題綠、暖白底、柔和的金色反射。原創緞帶幾何、文字材質及分層玻璃，使用既有平面皮克敏圖片。沒有借用參考網站的模型或程式。

## Kinetic Typography 原始碼研究

已閱讀作者 repo `marioecg/codrops-kinetic-typo` 的 `js/gl/Type.js`、`js/gl/shaders.js`、`js/gl/index.js`、`js/options.js`。

- 作者將 MSDF 字體渲染到 RenderTarget，將該紋理傳入不同曲面。
- fragment shader 以時間改變 UV，重複文字沿曲面流動；不是單純轉動整個物件。
- vertex shader 可以扭轉長方體，或以正弦波改變平面頂點。
- requestAnimationFrame 持續更新 shader 的時間值。
- 我們保留原創幾何，使用 Three.js physical material 的 shader 擴充 UV 流動與展開變形，使文字同時受反射與光影影響。短標籤由高解析 CanvasTexture 產生，數字切換才重畫，無需每幀重畫文字或加入舊版字型套件。

參考：https://github.com/marioecg/codrops-kinetic-typo

## 玻璃折射原始碼研究與手機負擔

已閱讀 Jesper Vos 的 Multiside Refraction 教學內的 vertex、fragment 和 render loop 程式。

- 背景先渲染到紋理；法線改變螢幕座標採樣位置，產生折射。
- 第二個 render target 保存背面法線，與正面法線一起決定折射方向。
- Fresnel 邊緣反射讓輪廓可見，無需追蹤每一條光線。
- 本 demo 將三片玻璃共用一個背景 pass 與一個背面法線 pass，改用自己的精簡 shader；玻璃曲面、光線與收藏版面由我們設計。
- 手機繪製倍率上限 1.35、法線緩衝使用一般 RGBA 格式、降低玻璃網格分段，減少動態／離開畫面時停止持續繪製。
- 開發環境 console 每 240 個繪製影格記錄平均 frame cadence 與 CPU 提交成本，實機速度需另外確認。

參考：https://tympanus.net/codrops/2019/10/29/real-time-multiside-refraction-in-three-steps/

## 驗證（2026-10-02）

- Chrome / Codex 瀏覽器：320×740、393×852、1280×800，無水平溢出；修正 overflow:hidden 引起的內部焦點捲動裁切，改為 overflow:clip。
- 展開、收回、快速連點、分類切換、0%／18%／72%／100%、減少動態及橫向拖動均可操作。
- 此電腦手機尺寸預覽中，緞帶與玻璃穩態平均約 60fps，DPR 1；CPU render 提交成本約 0.2–0.3ms／0.6ms。這不是 Samsung 或 iPhone 實機測量，也不包含 GPU 完成時間。
- `.nuxt/tsconfig.app.json` 型別檢查：demo 檔案沒有錯誤；專案仍有 13 個既存錯誤，位於 Admin/HeroSettingsModal、FooterFlipCounter、Home/HeroSection、friends。
- 截圖：`output/hero-lab/ribbon-mobile.png`、`output/hero-lab/glass-mobile.png`。
