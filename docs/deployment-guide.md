# 部署指南

## 📚 文檔概覽

本文檔說明如何將 Comoor 專案部署至 GitHub Pages 或其他靜態網頁託管服務。

## 🎯 部署需求

### 必要條件

- ✅ GitHub 帳號
- ✅ Git 已安裝
- ✅ 基本的命令列操作知識

### 選擇性條件

- 自訂網域（optional）
- Google 帳號（用於試算表與 Apps Script）

## 🚀 GitHub Pages 部署（推薦）

### 步驟一：準備 Git Repository

#### 1.1 初始化本地 Repository（如尚未完成）

```bash
# 進入專案目錄
cd /path/to/comoor

# 初始化 Git
git init

# 加入所有檔案
git add .

# 建立初始 commit
git commit -m "Initial commit: Comoor card drawing system"
```

#### 1.2 建立 GitHub Repository

1. 訪問 https://github.com/new
2. Repository 名稱：`comoor`（或自訂）
3. 設定為 **Public**（GitHub Pages 免費版需要）
4. **不要**勾選「Initialize with README」
5. 點擊「Create repository」

#### 1.3 連接本地與遠端

```bash
# 加入遠端 Repository（替換 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/comoor.git

# 設定主分支名稱
git branch -M main

# 推送至 GitHub
git push -u origin main
```

### 步驟二：設定 GitHub Pages

#### 2.1 開啟 Pages 設定

1. 進入 Repository 頁面
2. 點擊 **Settings**
3. 左側選單點擊 **Pages**

#### 2.2 設定來源

- **Source**: Deploy from a branch
- **Branch**: main
- **Folder**: / (root)
- 點擊 **Save**

#### 2.3 等待部署

- GitHub 會自動開始部署（約 1-2 分鐘）
- 部署完成後會顯示網址

### 步驟三：取得網址

部署完成後，網址格式如下：

```
https://YOUR_USERNAME.github.io/comoor/
```

**各頁面網址**：
- 活動報名：`https://YOUR_USERNAME.github.io/comoor/campaign.html`
- 抽卡系統：`https://YOUR_USERNAME.github.io/comoor/card.html`
- 簡易抽卡：`https://YOUR_USERNAME.github.io/comoor/card-simple.html`

## 📂 檔案結構檢查

部署前請確認以下檔案結構：

```
comoor/
├── campaign.html          ✅ 必要
├── card.html              ✅ 必要
├── card-simple.html       ✅ 必要
├── css/
│   ├── card.css          ✅ 必要
│   └── card-simple.css   ✅ 必要
├── js/
│   ├── card.js           ✅ 必要
│   └── card-simple.js    ✅ 必要
├── assets/
│   └── images/           ✅ 必要
│       ├── S__172548136.jpg
│       ├── S__172548137.jpg
│       ├── S__172548138.jpg
│       ├── S__172548139.jpg
│       └── S__172548140.jpg
├── docs/                 ⭕ 選擇性
├── CLAUDE.md             ⭕ 選擇性
└── README.md             ⭕ 建議加入
```

**重要**：
- ✅ `css/` 和 `js/` 目錄必須存在
- ✅ 所有圖片必須在 `assets/images/`
- ✅ 路徑區分大小寫（Linux 伺服器）

## ⚙️ Google Sheets 設定

### 設定試算表權限

#### 1. 開啟試算表

訪問：
```
https://docs.google.com/spreadsheets/d/1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE
```

#### 2. 設定共用權限

1. 點擊右上角「共用」按鈕
2. 一般存取權：**任何知道連結的人**
3. 權限：**檢視者**
4. 點擊「完成」

#### 3. 驗證權限

在無痕視窗開啟試算表連結，確認可正常檢視。

### 建立自己的試算表（選擇性）

如果想使用自己的試算表：

#### 1. 複製範本

1. 開啟原試算表
2. 檔案 → 建立副本
3. 重新命名

#### 2. 取得試算表 ID

試算表 URL：
```
https://docs.google.com/spreadsheets/d/【這裡是ID】/edit
```

範例：
```
https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit
                                          ↑ 這就是 SHEET_ID
```

#### 3. 更新程式碼

編輯 `js/card.js` 與 `js/card-simple.js`：

```javascript
// 第 1361 行（card.js）或相應位置
const SHEET_ID = '1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE';
// 改為：
const SHEET_ID = '你的試算表ID';
```

#### 4. 重新部署

```bash
git add js/card.js js/card-simple.js
git commit -m "Update Google Sheets ID"
git push
```

## 🔧 Google Apps Script 設定（中獎表單）

### 建立 Apps Script 專案

#### 1. 開啟 Script Editor

1. 開啟試算表
2. 擴充功能 → Apps Script

#### 2. 貼上程式碼

```javascript
function doPost(e) {
  try {
    // 解析提交的資料
    const data = JSON.parse(e.parameter.data);

    // 開啟試算表（替換為你的試算表 ID）
    const ss = SpreadsheetApp.openById('你的試算表ID');

    // 選擇或建立「中獎者」工作表
    let sheet = ss.getSheetByName('中獎者');
    if (!sheet) {
      sheet = ss.insertSheet('中獎者');
      // 加入表頭
      sheet.appendRow([
        '時間',
        '官網帳號',
        '連絡電話',
        '收件姓名',
        '收件地址',
        '想說的話',
        'User Agent'
      ]);
    }

    // 寫入資料
    sheet.appendRow([
      new Date(),
      data.account,
      data.phone,
      data.recipientName,
      data.address,
      data.message,
      data.userAgent
    ]);

    // 回傳成功訊息
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '資料已儲存'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 回傳錯誤訊息
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### 3. 部署為 Web App

1. 點擊右上角「部署」→「新增部署作業」
2. 類型：Web 應用程式
3. 說明：「Comoor 中獎表單接收器」
4. 執行身分：**我**
5. 具有存取權的使用者：**所有人**
6. 點擊「部署」

#### 4. 授權

- 首次部署會要求授權
- 點擊「審查權限」
- 選擇 Google 帳號
- 點擊「前往 [專案名稱]」（進階）
- 點擊「前往 [專案名稱]（不安全）」
- 點擊「允許」

#### 5. 複製 Web App URL

部署完成後會顯示 URL，格式如：
```
https://script.google.com/macros/s/AKfycby.../exec
```

#### 6. 更新程式碼

編輯 `js/card.js`：

```javascript
// 第 1210 行或相應位置（ContactFormManager 內）
const CONTACT_SHEET_CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxJ04YQhMx3KzzUAohIOMdcSOd5c1e280FAXLcYSd9J5JzZ-DWDr5_9eBZivRdpFN3xaw/exec'
};
// 改為：
const CONTACT_SHEET_CONFIG = {
    webAppUrl: '你的 Web App URL'
};
```

#### 7. 重新部署

```bash
git add js/card.js
git commit -m "Update Google Apps Script URL"
git push
```

## 🌐 自訂網域（選擇性）

### 步驟一：設定 GitHub Pages

1. Repository → Settings → Pages
2. Custom domain 欄位輸入：`cards.yourdomain.com`
3. 勾選「Enforce HTTPS」
4. 點擊「Save」

### 步驟二：設定 DNS

在你的網域註冊商（如 Cloudflare、GoDaddy）設定：

**CNAME 記錄**：
```
Type: CNAME
Name: cards（或你想要的子網域）
Value: YOUR_USERNAME.github.io
```

### 步驟三：等待 DNS 生效

- 通常需要 10 分鐘至 24 小時
- 使用 `nslookup cards.yourdomain.com` 驗證

### 步驟四：驗證 HTTPS

- GitHub Pages 會自動申請 Let's Encrypt 憑證
- 約需 10-30 分鐘
- 完成後網址會自動轉為 HTTPS

## 🧪 部署後測試

### 測試清單

#### ✅ 基本功能
- [ ] campaign.html 正常開啟
- [ ] card.html 正常開啟
- [ ] card-simple.html 正常開啟
- [ ] 所有圖片正常載入
- [ ] CSS 樣式正確套用

#### ✅ 抽卡功能（card.html）
- [ ] 載入動畫顯示 3 秒
- [ ] 卡片與文字正常顯示
- [ ] 重新整理後顯示冷卻視窗
- [ ] Dev 模式（?dev=true）正常運作

#### ✅ Google Sheets 整合
- [ ] 文字從試算表載入（開啟控制台查看）
- [ ] 更新試算表後 10 分鐘生效
- [ ] 快取機制正常運作

#### ✅ 中獎功能（card.html）
- [ ] 中獎文字為藍色可點擊
- [ ] 點擊後開啟表單
- [ ] 表單驗證正常
- [ ] 成功送出至試算表

#### ✅ 響應式設計
- [ ] 手機版排版正常
- [ ] 平板版排版正常
- [ ] 桌面版排版正常

### 測試工具

**控制台指令**：
```javascript
// 查看載入的文字
console.log(texts)

// 查看速率限制狀態
window.statusRateLimit()

// 查看裝置指紋
window.CardRateLimit.debug.fingerprint()

// 清除快取測試
window.clearAllCaches()
```

**Dev 模式測試**：
```
https://YOUR_USERNAME.github.io/comoor/card.html?dev=true
```

## 🔧 故障排除

### 問題一：CSS/JS 未載入（404 錯誤）

**症狀**：頁面顯示但無樣式，控制台顯示 404

**解決方案**：
1. 檢查檔案路徑大小寫是否正確
2. 確認 `css/` 和 `js/` 目錄存在
3. 檢查 HTML 中的 href/src 路徑

### 問題二：圖片未顯示

**症狀**：卡片區域空白

**解決方案**：
1. 檢查 `assets/images/` 目錄是否存在
2. 確認所有圖片檔案已上傳
3. 檢查檔名大小寫

### 問題三：Google Sheets 資料未載入

**症狀**：使用降級文字

**解決方案**：
1. 檢查試算表權限（需為「任何知道連結的人」可檢視）
2. 檢查 CORS 代理是否正常
3. 開啟控制台查看錯誤訊息
4. 驗證試算表 ID 是否正確

### 問題四：中獎表單無法送出

**症狀**：點擊送出後顯示錯誤

**解決方案**：
1. 檢查 Apps Script Web App URL 是否正確
2. 確認 Apps Script 已授權
3. 檢查「具有存取權的使用者」設為「所有人」
4. 開啟控制台查看詳細錯誤訊息

### 問題五：速率限制異常

**症狀**：清除 LocalStorage 後仍被限制

**解決方案**：
```javascript
// 清除所有三層儲存
window.clearRateLimit()

// 或手動清除
localStorage.clear()
sessionStorage.clear()
// DevTools → Application → IndexedDB → 刪除 CardRateLimit
```

## 📊 部署檢查表

部署前最終檢查：

- [ ] 所有檔案已 commit
- [ ] 試算表權限已設定
- [ ] Apps Script 已部署（若使用中獎功能）
- [ ] 圖片已上傳至 `assets/images/`
- [ ] 檔案路徑大小寫正確
- [ ] 本地測試通過
- [ ] README.md 已更新（optional）
- [ ] .gitignore 已設定（optional）

部署後檢查：

- [ ] 所有頁面可正常訪問
- [ ] CSS/JS 正常載入
- [ ] 圖片正常顯示
- [ ] 抽卡功能正常
- [ ] Google Sheets 整合正常
- [ ] 中獎表單正常（若使用）
- [ ] 手機版正常
- [ ] HTTPS 正常（若使用自訂網域）

## 🔗 相關資源

- [GitHub Pages 官方文檔](https://docs.github.com/en/pages)
- [Google Sheets API 文檔](https://developers.google.com/sheets/api)
- [Google Apps Script 文檔](https://developers.google.com/apps-script)
- [技術架構](technical-architecture.md)
- [管理員手冊](admin-guide.md)

---

**最後更新**：2025-10-05
