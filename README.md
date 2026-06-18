# 🌱 Pikmin Bloom 飾品圖鑑收藏家

一個用於追蹤和管理 Pikmin Bloom 飾品收藏的非官方網頁工具。

[![GitHub stars](https://img.shields.io/github/stars/scott0127/pik_tool?style=social)](https://github.com/scott0127/pik_tool)

## ☕ 支持這個專案

如果你覺得這個工具對你有幫助，歡迎請我喝杯咖啡！

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-支持開發-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/scott5497)

**👉 [buymeacoffee.com/scott5497](https://buymeacoffee.com/scott5497)**

---

## ⚖️ 版權聲明與免責聲明

### 遊戲版權
本專案為**非官方粉絲工具**，與任天堂（Nintendo）或 Niantic 無任何官方關聯。

- **Pikmin Bloom** 是任天堂（Nintendo）和 Niantic, Inc. 的註冊商標
- 所有遊戲相關圖像、名稱、數據等版權歸任天堂所有
- 本專案不主張對任何遊戲內容擁有版權
- 本專案未經任天堂或 Niantic 官方認可或贊助

### 合理使用聲明
本專案中使用的所有遊戲素材（包括但不限於圖像、名稱、數據）均屬於**合理使用**（Fair Use）範疇：
- 本工具為非營利性質，目的在於提供資訊和便利性
- 使用遊戲素材僅為協助玩家管理收藏，不用於商業販售
- 所有素材均明確標註來源
- 使用範圍符合教育性和資訊性用途

### 資料來源
部分遊戲資料可能參考自以下來源：
- [Pikmin Wiki](https://www.pikminwiki.com/) / [Pikipedia](https://www.pikminwiki.com/) - 遵循 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 授權
- 從 Pikmin Bloom 遊戲本身提取的公開資料

### 本專案原創內容
本專案的**原創程式碼和網站設計**採用 **MIT License**：
- 網站架構與程式碼
- 使用者介面設計
- 數據整理與分類系統

### 免責聲明
- 本工具所提供的資訊可能不完整或包含錯誤，我們努力保持準確性但不提供任何保證
- 使用者需自行承擔使用本工具的風險
- 本專案開發者不對任何因使用本工具而產生的損失負責
- 若任天堂或 Niantic 要求移除任何內容，我們將立即配合處理

**如有任何版權疑慮，請透過 GitHub Issues 聯繫我們。**

---

## 🚀 功能特色

- 📖 完整的飾品圖鑑瀏覽
- ✅ 個人收藏追蹤
- 🗺️ 地圖位置查詢
- 📊 收集進度統計
- 🤝 好友交流功能
- 🔍 快速搜尋與篩選

## 🛠️ 技術棧

- **框架**：Nuxt 3
- **資料庫**：Supabase
- **樣式**：Tailwind CSS
- **部署**：Render Static Site / Vercel / Netlify

## 📦 安裝與開發

### 安裝依賴

```bash
# 推薦使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 開發伺服器

啟動開發伺服器於 `http://localhost:3000`：

```bash
pnpm dev
```

### 環境變數設定

複製 `.env.example` 為 `.env` 並填入你的 Supabase 憑證：

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 生產環境建置

本專案正式部署建議使用靜態輸出，避免在 512MB Web Service 上長時間運行 Nuxt/Nitro Node server：

```bash
pnpm run render:build
```

輸出目錄：

```txt
.output/public
```

Render 建議建立 Static Site，build command 使用 `pnpm run render:build`，publish directory 使用 `.output/public`。Repo 根目錄的 `render.yaml` 已提供可回溯的 Static Site Blueprint。

若只是本機預覽 Node build：

```bash
pnpm build
pnpm preview
```

Render 記憶體與部署細節請見 [`docs/operations/render-memory.md`](docs/operations/render-memory.md)。

## 📝 授權條款

### 程式碼授權
本專案的原創程式碼採用 **MIT License**。

### 遊戲素材
所有 Pikmin Bloom 相關素材版權歸任天堂所有，本專案基於合理使用原則使用這些素材。

---

## 🙏 致謝

- 感謝任天堂和 Niantic 創造了 Pikmin Bloom 這款美好的遊戲
- 感謝 [Pikipedia](https://www.pikminwiki.com/) 社群提供的詳細資料
- 感謝所有使用和支持本專案的玩家們

## 📬 聯繫方式

- GitHub Issues: [提交問題或建議](https://github.com/scott0127/pik_tool/issues)
- Buy Me a Coffee: [支持開發](https://buymeacoffee.com/scott5497)

---

**⭐ 如果這個專案對你有幫助，請給我一個星星！**
