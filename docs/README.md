# Comoor 專案文檔

## 📚 文檔概覽

本專案是一個靜態網頁應用程式，包含活動報名與抽卡系統，具備防刷機制、機率控制及中獎者資料收集功能。

## 實際使用（老闆請看這）

### 可抽獎頁面
- https://chicmoor.github.io/comoor/card.html
- 網址後面加上 `?dev=true` 可以縮短冷卻時間變 10 秒
- 吃 Google 試算表的機率
- 想測試中獎表單，可以把會中獎的機率設 90 %

### 純抽卡頁面
- https://chicmoor.github.io/comoor/card-simple.html
- 網址後面加上 `?dev=true` 可以縮短冷卻時間變 10 秒

## 🎯 主要功能頁面

### 1. campaign.html - 活動報名頁面（未完成，暫不使用）
- 使用者註冊參加活動
- 收集基本資料（姓名、帳號、電話、留言）
- 自包含設計（CSS/JS 皆內嵌）

### 2. card.html - 抽卡系統（含中獎機制）
- 隨機抽取卡片，顯示文字與圖片
- 機率權重系統（透過 Google 試算表管理）
- 中獎機制與聯絡表單
- 防刷系統（每小時限抽一次）
- 裝置指紋辨識

### 3. card-simple.html - 簡易抽卡系統
- 純展示用抽卡系統
- 無中獎機制、無聯絡表單
- 同樣具備防刷功能
- 適合不需獎品發放的場景

## 📖 文檔導航

### 使用案例 (Use Cases)
1. [活動報名](use-cases/01-campaign-registration.md) - campaign.html 使用流程
2. [抽卡系統（含中獎）](use-cases/02-card-drawing-with-prizes.md) - card.html 完整功能
3. [簡易抽卡系統](use-cases/03-card-drawing-simple.md) - card-simple.html 純展示版本
4. [防刷機制](use-cases/04-rate-limiting.md) - 速率限制與裝置指紋系統
5. [Google 試算表管理](use-cases/05-google-sheets-management.md) - 內容管理與機率設定
6. [中獎者資料收集](use-cases/06-winner-contact-collection.md) - 聯絡表單與資料處理

### 技術文檔
- [技術架構](technical-architecture.md) - 系統架構、類別關係、資料流程
- [部署指南](deployment-guide.md) - GitHub Pages 部署步驟與設定
- [管理員手冊](admin-guide.md) - 內容更新、除錯工具、系統管理

## 🏗️ 專案結構

```
comoor/
├── campaign.html              # 活動報名頁面
├── card.html                  # 抽卡系統（含中獎）
├── card-simple.html           # 簡易抽卡系統
├── css/
│   ├── card.css              # card.html 樣式
│   └── card-simple.css       # card-simple.html 樣式
├── js/
│   ├── card.js               # card.html 邏輯（含中獎系統）
│   └── card-simple.js        # card-simple.html 邏輯（簡化版）
├── assets/
│   └── images/               # 卡片圖片資源
├── docs/                     # 本文檔目錄
└── CLAUDE.md                 # AI 開發指引
```

## 🚀 快速開始

### 本地測試
1. 直接在瀏覽器開啟 HTML 檔案
2. 或使用簡易伺服器：
   ```bash
   python -m http.server 8000
   # 訪問 http://localhost:8000/card.html
   ```

### 開發模式
在 URL 加上 `?dev=true` 參數可啟用開發模式：
- 冷卻時間從 1 小時降為 10 秒
- 便於測試防刷機制

範例：`card.html?dev=true`

## 🔑 關鍵特性

### 防刷系統
- **裝置指紋辨識**：螢幕特徵、時區、語言、平台、Canvas、WebGL、音訊等多因子
- **三層儲存**：LocalStorage、SessionStorage、IndexedDB 備份
- **冷卻時間**：正常模式 1 小時，開發模式 10 秒
- **模糊比對**：支援部分元件變更的情況

### 機率權重系統
- Google 試算表管理文字內容與機率
- 支援動態調整，無需修改程式碼
- 10 分鐘快取機制
- 自動降級至預設文字

### 中獎機制（僅 card.html）
- 試算表 `won` 欄位設為 1 即為中獎卡片
- 中獎時文字可點擊，開啟聯絡表單
- 表單資料透過 Google Apps Script 送至試算表

## 🔧 技術棧

- **前端**：純 HTML、CSS、JavaScript（無框架）
- **資料管理**：Google Sheets API
- **表單後端**：Google Apps Script Web App
- **CORS 代理**：api.allorigins.win
- **部署**：GitHub Pages（靜態託管）

## 📊 Google 試算表整合

**試算表 ID**：`1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE`

**欄位結構**（gid=0「金句」工作表）：
- 欄位 A：文字內容
- 欄位 B：機率（數值，如 0.5）
- 欄位 C：是否中獎（0 或 1）

詳見 [Google 試算表管理](use-cases/05-google-sheets-management.md)

## 🛠️ 管理工具

在瀏覽器控制台可使用以下指令：

```javascript
// 查看速率限制狀態
window.statusRateLimit()

// 清除所有快取與速率限制
window.clearRateLimit()

// 清除試算表快取（重新載入內容）
window.clearAllCaches()

// 查看裝置指紋
window.CardRateLimit.debug.fingerprint()
```

詳見 [管理員手冊](admin-guide.md)

## 📝 版本差異對照

| 功能 | campaign.html | card.html | card-simple.html |
|------|---------------|-----------|------------------|
| 活動報名表單 | ✅ | ❌ | ❌ |
| 抽卡功能 | ❌ | ✅ | ✅ |
| 中獎機制 | ❌ | ✅ | ❌ |
| 聯絡表單 | ❌ | ✅ | ❌ |
| 防刷系統 | ❌ | ✅ | ✅ |
| Google 試算表 | ❌ | ✅ | ✅ |
| 機率權重 | ❌ | ✅ | ✅ |
| 文字可點擊 | ❌ | ✅（中獎時） | ❌ |

## 🎓 適用場景

- **campaign.html**：行銷活動、會員招募、問卷調查
- **card.html**：抽獎活動、促銷活動、會員福利（需獎品）
- **card-simple.html**：每日一句、心靈雞湯、趣味互動（無獎品）

## 📞 相關資源

- [GitHub Repository](https://github.com/YOUR_USERNAME/comoor)
- [Google 試算表](https://docs.google.com/spreadsheets/d/1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE)
- [部署指南](deployment-guide.md)

---

**最後更新**：2025-10-05
