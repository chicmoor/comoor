# 管理員手冊

## 📚 文檔概覽

本手冊提供系統管理員日常維護、內容更新、除錯工具使用等操作指引。

## 👤 目標讀者

- 系統管理員
- 內容編輯人員
- 技術支援人員

## 📝 日常維護任務

### 1. 更新卡片文字

#### 操作步驟

**步驟一：開啟試算表**

訪問：
```
https://docs.google.com/spreadsheets/d/1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE
```

**步驟二：編輯內容**

| 操作 | 說明 |
|------|------|
| **新增** | 在最後一列下方插入新列，填入文字、機率、中獎標記 |
| **修改** | 直接編輯儲存格內容 |
| **刪除** | 選擇列 → 右鍵 → 刪除列 |

**步驟三：驗證格式**

確認每列包含：
- 欄位 A：文字內容（10-20字為佳）
- 欄位 B：數值（如 0.3）
- 欄位 C：0 或 1

**步驟四：等待生效**

- 自動生效：10 分鐘內
- 立即生效：使用清除快取指令（見下方）

#### 範例操作

**新增節日特殊文字**：
```
聖誕快樂！,0.15,0
新年快樂！,0.15,0
```

**設定中獎項目**：
```
恭喜中獎！免費獲得限量商品,0.05,1
```

**調整機率**：
將熱門文字從 0.2 改為 0.3

### 2. 管理中獎機率

#### 計算中獎率

**公式**：
```
中獎率 = 中獎項目機率總和 / 所有項目機率總和
```

**範例**：
```csv
一般文字 A,0.2,0
一般文字 B,0.2,0
一般文字 C,0.2,0
一般文字 D,0.2,0
中獎文字,0.2,1
```

**中獎率** = 0.2 / (0.2+0.2+0.2+0.2+0.2) = 0.2 / 1.0 = **20%**

#### 建議設定

| 活動類型 | 建議中獎率 | 機率設定 |
|---------|-----------|---------|
| 高價獎品 | 1-5% | 0.01-0.05 |
| 一般獎品 | 5-10% | 0.05-0.1 |
| 小禮物 | 10-20% | 0.1-0.2 |
| 測試用 | 50%+ | 0.5+ |

#### 中獎率計算器（Excel 公式）

在試算表新增輔助欄位：

**欄位 D**（總機率）：
```
=SUM(B:B)
```

**欄位 E**（中獎機率總和）：
```
=SUMIF(C:C,1,B:B)
```

**欄位 F**（中獎率百分比）：
```
=E2/D2*100&"%"
```

### 3. 查看中獎者資料

#### 開啟中獎者工作表

1. 開啟試算表
2. 切換到「中獎者」工作表（或自訂名稱）

#### 欄位說明

| 欄位 | 說明 |
|------|------|
| 時間 | 提交時間（台灣時區） |
| 官網帳號 | 使用者帳號 |
| 連絡電話 | 電話號碼 |
| 收件姓名 | 收件人姓名 |
| 收件地址 | 完整地址 |
| 想說的話 | 使用者留言 |
| User Agent | 瀏覽器資訊 |

#### 匯出資料

**方法一：下載為 Excel**
- 檔案 → 下載 → Microsoft Excel (.xlsx)

**方法二：下載為 CSV**
- 檔案 → 下載 → 逗號分隔值 (.csv)

**方法三：複製到其他試算表**
- 選擇資料範圍
- 複製 (Ctrl+C)
- 貼上到目標試算表

#### 資料分析

**建立樞紐分析表**：
1. 資料 → 樞紐分析表
2. 分析中獎者分布、時段統計等

**篩選功能**：
- 按日期篩選
- 按地區篩選（地址欄位）
- 搜尋特定帳號

## 🔧 系統管理工具

### 瀏覽器控制台指令

所有指令需在瀏覽器控制台（F12）執行。

#### 基本指令

**查看速率限制狀態**：
```javascript
window.statusRateLimit()
// 輸出：
// {
//   isRateLimited: true,
//   cooldownEndTime: 1696506000000,
//   currentFingerprint: "a3f5e8d2c1...",
//   remainingTime: "45分鐘"
// }
```

**查看裝置指紋**：
```javascript
window.CardRateLimit.debug.fingerprint()
// 顯示所有指紋元件的詳細資訊
```

**查看目前載入的文字**：
```javascript
console.log(texts)
// 顯示所有文字、機率、中獎標記
```

#### 快取管理

**清除所有快取**：
```javascript
window.clearAllCaches()
// 清除文字快取，下次載入會重新從 Google Sheets 取得
```

**清除速率限制**：
```javascript
window.clearRateLimit()
// 清除速率限制記錄，允許立即再次抽卡
```

#### 進階指令

**啟用除錯模式**：
```javascript
window.CardRateLimit.debug.enable()
// 顯示更詳細的控制台訊息
```

**停用除錯模式**：
```javascript
window.CardRateLimit.debug.disable()
```

**強制設定冷卻時間**（測試用）：
```javascript
// 設定 30 分鐘後可抽
window.CardRateLimit.admin.forceRateLimit(30)

// 設定 2 小時後可抽
window.CardRateLimit.admin.forceRateLimit(120)
```

**調整冷卻時間**：
```javascript
// 改為 2 小時
window.CardRateLimit.admin.setCooldown(2)

// 改為 30 分鐘
window.CardRateLimit.admin.setCooldown(0.5)
```

**測試指紋穩定性**：
```javascript
window.CardRateLimit.admin.testFingerprint()
// 產生兩次指紋並比對是否相同
```

### Dev 模式

**啟用方式**：
在 URL 加上 `?dev=true` 參數

**範例**：
```
https://your-domain.com/card.html?dev=true
```

**效果**：
- ✅ 冷卻時間從 1 小時降為 10 秒
- ✅ 控制台顯示「🔧 DEV MODE ACTIVE」
- ✅ 便於測試抽卡功能
- ⚠️ 不建議在正式環境對外公開

**使用場景**：
- 測試新文字
- 測試中獎機制
- 驗證表單功能
- Demo 展示

## 📊 監控與分析

### Google Sheets 統計

#### 抽卡文字統計

**方法一：手動統計**
- 觀察哪些文字較常被抽中
- 調整機率以平衡分布

**方法二：使用 QUERY 函數**

在新工作表建立統計：
```
=QUERY(金句!A:C, "SELECT A, B, C, COUNT(A) GROUP BY A, B, C ORDER BY COUNT(A) DESC")
```

#### 中獎者統計

**統計中獎人數**：
```
=COUNTA(中獎者!A:A)-1
// 減 1 是扣除表頭
```

**按日期統計**：
```
=COUNTIF(中獎者!A:A,">=2025-10-01")
```

**按地區統計**（假設地址包含「台北」）：
```
=COUNTIF(中獎者!E:E,"*台北*")
```

### 使用者行為分析

**最佳抽卡時段**（需 Apps Script）：
```javascript
function analyzeDrawingTime() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // 統計每小時的抽卡次數
  const hourStats = {};
  for (let i = 1; i < data.length; i++) {
    const hour = new Date(data[i][0]).getHours();
    hourStats[hour] = (hourStats[hour] || 0) + 1;
  }

  Logger.log(hourStats);
}
```

## 🚨 故障排除

### 常見問題與解決

#### 問題一：使用者反應無法抽卡

**可能原因**：
1. 在冷卻期內
2. LocalStorage 損壞
3. JavaScript 錯誤

**診斷步驟**：
1. 請使用者開啟控制台（F12）
2. 查看是否有紅色錯誤訊息
3. 執行 `window.statusRateLimit()` 查看狀態

**解決方案**：
```javascript
// 請使用者執行
window.clearRateLimit()
location.reload()
```

#### 問題二：試算表更新未生效

**可能原因**：
1. 快取未過期（10分鐘內）
2. 試算表權限問題
3. 格式錯誤

**解決方案**：
```javascript
// 管理員執行（或請使用者執行）
window.clearAllCaches()
location.reload()
```

#### 問題三：中獎表單無法送出

**可能原因**：
1. Apps Script Web App URL 錯誤
2. 試算表權限不足
3. Apps Script 逾時

**診斷步驟**：
1. 開啟控制台查看錯誤訊息
2. 測試 Apps Script URL 是否可訪問
3. 檢查試算表「中獎者」工作表是否存在

**解決方案**：
- 重新部署 Apps Script
- 檢查權限設定
- 檢查試算表 ID 是否正確

#### 問題四：圖片無法顯示

**可能原因**：
1. 圖片檔案遺失
2. 路徑錯誤
3. GitHub Pages 部署問題

**解決方案**：
```bash
# 檢查圖片檔案
ls assets/images/

# 確認有 5 張圖片
# 重新上傳遺失的圖片

git add assets/images/
git commit -m "Fix missing images"
git push
```

### 緊急處理流程

#### 系統完全無法使用

1. **檢查 GitHub Pages 狀態**
   - 訪問 Repository → Actions
   - 查看最新部署是否失敗

2. **還原到上一個版本**
   ```bash
   git log --oneline
   git revert HEAD
   git push
   ```

3. **通知使用者**
   - 在網頁加入維護公告
   - 社群媒體發布通知

#### 試算表損壞

1. **使用版本歷史還原**
   - 檔案 → 版本記錄
   - 選擇正常的版本
   - 點擊「還原這個版本」

2. **從備份還原**
   - 如有定期備份，使用備份檔案

## 🔒 安全性管理

### 權限管理

**試算表權限建議**：
- ✅ 檢視：任何知道連結的人
- ⚠️ 編輯：僅信任的管理員
- ⚠️ 評論：視需求開放

**GitHub Repository 權限**：
- ✅ 主要管理員：Admin
- ✅ 內容編輯：Write（可編輯試算表，不可推送程式碼）
- ⚠️ 避免過多人員擁有 Admin 權限

### 定期備份

**試算表備份**：
```
每週一次：
1. 檔案 → 建立副本
2. 重新命名為「Comoor 抽卡試算表 - 備份 20251005」
3. 儲存至 Google 雲端硬碟特定資料夾
```

**程式碼備份**：
```bash
# Git 本身就是備份，但可額外建立標籤
git tag -a v1.0 -m "Stable version 1.0"
git push --tags
```

**中獎者資料備份**：
```
每月一次：
1. 下載「中獎者」工作表為 Excel
2. 儲存至安全位置
3. 考慮加密儲存
```

### 敏感資料處理

⚠️ **不要在 Git 提交**：
- Google Apps Script Web App URL（可公開，但建議管理）
- 試算表編輯連結
- 使用者個資（應僅存於試算表，不要複製到程式碼）

## 📈 效能優化

### 快取策略調整

**目前設定**：10 分鐘

**如需調整**，編輯 `js/card.js` 與 `js/card-simple.js`：
```javascript
// 第 1500 行附近
const CACHE_DURATION = 10 * 60 * 1000; // 10 分鐘

// 改為 5 分鐘
const CACHE_DURATION = 5 * 60 * 1000;

// 改為 30 分鐘
const CACHE_DURATION = 30 * 60 * 1000;
```

**建議值**：
- 頻繁更新內容：5 分鐘
- 一般使用：10 分鐘（預設）
- 穩定內容：30 分鐘

### 圖片優化

**目前圖片大小**：未優化

**建議優化步驟**：
1. 使用 TinyPNG 或類似工具壓縮
2. 轉換為 WebP 格式（現代瀏覽器）
3. 提供多種尺寸（響應式）

## 📞 聯絡資訊

### 技術支援

遇到無法解決的問題時：

1. **查看文檔**
   - [使用案例](README.md#使用案例-use-cases)
   - [技術架構](technical-architecture.md)
   - [部署指南](deployment-guide.md)

2. **檢查控制台**
   - 開啟 DevTools（F12）
   - 查看 Console 標籤的錯誤訊息
   - 截圖錯誤訊息

3. **GitHub Issues**
   - 在 Repository 建立 Issue
   - 提供詳細的錯誤資訊

## 🔗 相關文件

- [使用案例總覽](README.md)
- [技術架構](technical-architecture.md)
- [部署指南](deployment-guide.md)
- [Google 試算表管理 (UC-05)](use-cases/05-google-sheets-management.md)

---

**最後更新**：2025-10-05
