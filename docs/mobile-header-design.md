# 手機 Header 設計

## 排版與色調

- 保留原有 emerald／teal、淡白底、品牌深綠字，不加入新跳色。
- 品牌固定兩行：Pikmin Bloom 為第一層、飾品圖鑑與地圖為第二層，避免長標題自然換行造成不同裝置布局不一致。
- 圖示 46px、選單 48px；320px 等窄螢幕分別降為 40px 與 44px，觸控目標保留至少 44px。
- 品牌使用現有 Nunito／Noto Sans TC，並提供 PingFang TC、Microsoft JhengHei、system-ui 回退。
- 地圖頁与其他頁共用 Header，不再套另一組縮小樣式。

## 動態腳本

| 觸發 | 動作 | 結果 |
| --- | --- | --- |
| 按選單 | 按鈕輕壓；上下紙條向中心收攏、旋轉為關閉記號；同時改為綠底白字 | 明確表示導覽已展開 |
| 導覽展開 | 沿用選單面板與導覽項目的依序展開；內容可獨立滾動 | 小螢幕可讀取所有功能 |
| 關閉、Esc 或換頁 | 紙條回到長短兩線、選單收起 | 回到原本頁面 |
| 減少動態偏好 | 直接切換按鈕與導覽狀態 | 保留操作資訊 |

## 跨平台

Header 使用 env(safe-area-inset-*)，viewport-fit=cover；選单以 dvh 限高。品牌幼苗改為固定 PNG，避免 Samsung／Apple emoji 外觀差異；選單使用 CSS 線條，無字元字形依賴。

幼苗素材來源 Microsoft Fluent Emoji 的 Seedling 3D，MIT 授權。來源：https://github.com/microsoft/fluentui-emoji/tree/main/assets/Seedling 。原授權存於 public/images/brand/LICENSE-fluent-emoji.txt。

驗證區分 Chrome 手機尺寸模擬與實機測試；不將模擬結果表述為 Samsung Internet 或 iOS 實機測試。

## 驗證紀錄

- Chrome 320px + iPhone UA：iOS 安裝入口與品牌兩行完整顯示。
- Chrome 360px + Samsung UA：無橫向溢出，地圖與首頁共用相同比例。
- Chrome 393px：保留完整品牌、選單與 iOS 入口。
- 選單開合、Esc 收起與焦點還原已實際操作；生產建置成功。
- 此為 Chrome 響應式與 UA 條件模擬，尚未做實機 Safari／Samsung Internet 驗證。
