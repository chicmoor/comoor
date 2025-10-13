# 使用案例 05：Google 試算表內容管理

## 📋 基本資訊

**使用案例名稱**：透過 Google 試算表管理卡片內容
**使用案例 ID**：UC-05
**頁面**：`card.html`、`card-simple.html`
**優先級**：高
**狀態**：已實作

## 🎯 概述

管理員透過 Google 試算表編輯卡片文字、調整機率權重、設定中獎項目，無需修改程式碼即可更新內容。系統每 10 分鐘自動重新載入試算表資料，支援快取機制與降級策略。

## 👥 參與者

- **主要參與者**：系統管理員
- **次要參與者**：終端使用者（受益於動態更新的內容）

## 🎬 前置條件

- 擁有 Google 試算表編輯權限
- 試算表 ID：`1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE`
- 試算表為「任何知道連結的人」可檢視

## ✅ 後置條件

### 成功情境
- 試算表內容已更新
- 系統在 10 分鐘內自動載入新內容
- 使用者看到更新後的文字與機率

### 失敗情境
- 試算表格式錯誤，系統使用降級文字
- 網路錯誤，使用舊快取或降級文字

## 📊 試算表結構

### 工作表資訊

**試算表連結**：
```
https://docs.google.com/spreadsheets/d/1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE
```

**工作表列表**：
1. **「金句」（gid=0）** - 卡片文字內容與機率
2. **「配置」（gid=2058356234）** - 系統配置參數

---

### 工作表 1：金句（gid=0）

卡片文字內容與機率設定

#### 欄位定義

| 欄位 | 名稱 | 類型 | 範例 | 說明 |
|------|------|------|------|------|
| A | text | 文字 | 今天很開心 | 顯示在卡片上的文字 |
| B | probability | 數值 | 0.3 | 權重（不必加總為 1） |
| C | won | 數值 | 0 或 1 | 是否為中獎（僅 card.html 使用） |

### 範例資料

```csv
今天很開心,0.3,0
昨天很美好,0.2,0
很期待明天,0.25,0
恭喜中獎！免費獲得產品一份,0.05,1
這兩天都是好天氣,0.2,0
```

### 試算表截圖（示意）

```
┌─────────────────────────────────┬──────────────┬─────┐
│               A                 │       B      │  C  │
├─────────────────────────────────┼──────────────┼─────┤
│ 今天很開心                      │ 0.3          │ 0   │
│ 昨天很美好                      │ 0.2          │ 0   │
│ 很期待明天                      │ 0.25         │ 0   │
│ 恭喜中獎！免費獲得產品一份      │ 0.05         │ 1   │
│ 這兩天都是好天氣                │ 0.2          │ 0   │
└─────────────────────────────────┴──────────────┴─────┘
```

---

### 工作表 2：配置（gid=2058356234）

系統配置參數設定

#### 欄位定義

| 欄位 | 名稱 | 類型 | 範例 | 說明 |
|------|------|------|------|------|
| A | 冷卻時間（分） | 數值 | 60 | 抽卡冷卻時間（分鐘） |
| B | 獎品名稱 | 文字 | 精美禮品 | 中獎時顯示的獎品名稱 |

#### 範例資料

```csv
冷卻時間（分）,獎品名稱
60,精美禮品
```

#### 試算表截圖（示意）

```
┌─────────────────┬──────────┐
│        A        │    B     │
├─────────────────┼──────────┤
│ 冷卻時間（分）  │ 獎品名稱 │
│ 60              │ 精美禮品 │
└─────────────────┴──────────┘
```

**重要提示**：
- ⚠️ **此表僅包含一列資料**（除了標題行）
- ⚠️ **修改後系統會在 10 分鐘內生效**（快取機制）
- ⚠️ **card-simple.html 僅使用冷卻時間**，不使用獎品名稱
- ⚠️ **card.html 同時使用兩個欄位**

**欄位說明**：

**冷卻時間（分）**：
- 單位：分鐘
- 範例：60（代表 1 小時），30（代表 30 分鐘）
- 應用頁面：`card.html`、`card-simple.html`
- 作用：控制使用者抽卡後需要等待多久才能再次抽卡
- 預設值：60 分鐘
- 建議範圍：5-1440 分鐘（5 分鐘至 1 天）

**獎品名稱**：
- 類型：文字
- 範例：「精美禮品」、「限量周邊」、「專屬優惠券」
- 應用頁面：僅 `card.html`（在中獎聯絡表單中顯示）
- 作用：告知中獎者贏得的獎品名稱
- 預設值：「精美禮品」
- 建議：簡短明確，5-15 字

---

## 📝 操作流程

### 工作表 1：金句操作

#### 新增文字

1. **開啟試算表**
   - 訪問試算表連結
   - 確認已登入 Google 帳號

2. **新增一列**
   - 在最後一列下方插入新列
   - 或在任意位置插入列

3. **填寫資料**
   - **欄位 A**：輸入文字內容（建議 10-20 字）
   - **欄位 B**：輸入機率權重（如 0.1）
   - **欄位 C**：輸入 0（一般）或 1（中獎）

4. **儲存**
   - Google 試算表自動儲存
   - 無需手動儲存

5. **等待生效**
   - 系統會在 10 分鐘內自動載入新內容
   - 或手動清除快取（見下方）

### 修改機率

1. **找到目標文字**
   - 在欄位 A 找到要調整的文字

2. **修改欄位 B**
   - 直接編輯數值
   - 例如：從 0.2 改為 0.5

3. **機率生效**
   - 新機率在下次快取更新後生效
   - 總權重會自動重新計算

### 設定中獎項目

1. **修改欄位 C**
   - 將一般文字的 0 改為 1
   - 該文字即成為中獎項目

2. **注意事項**
   - 中獎項目**僅在 card.html 有效**
   - card-simple.html 會忽略此欄位
   - 建議中獎機率設定較低（如 0.01-0.1）

### 刪除文字

1. **選擇列**
   - 點擊列號選擇整列

2. **刪除**
   - 右鍵 → 刪除列
   - 或使用工具列的刪除功能

3. **確認**
   - 刪除後立即生效（下次快取更新）

---

### 工作表 2：配置操作

#### 修改冷卻時間

1. **切換至配置工作表**
   - 點擊試算表底部的「配置」標籤（gid=2058356234）

2. **修改數值**
   - 找到第 2 列（資料列，非標題列）
   - 修改欄位 A 的數值
   - 例如：從 60 改為 30（30 分鐘冷卻）

3. **自動儲存**
   - Google 試算表自動儲存

4. **等待生效**
   - 系統會在 10 分鐘內自動載入新設定
   - 或手動清除快取立即生效

**常用冷卻時間範例**：
- 30 分鐘：較寬鬆，適合測試或活動期間
- 60 分鐘（預設）：標準設定
- 120 分鐘（2 小時）：較嚴格的限制
- 1440 分鐘（1 天）：每日一次

#### 修改獎品名稱

1. **切換至配置工作表**
   - 點擊試算表底部的「配置」標籤

2. **修改文字**
   - 找到第 2 列
   - 修改欄位 B 的文字
   - 例如：從「精美禮品」改為「限量周邊商品」

3. **自動儲存並生效**
   - Google 試算表自動儲存
   - 等待 10 分鐘或清除快取

4. **驗證**
   - 訪問 `card.html`
   - 抽中獎品後，查看聯絡表單中的獎品名稱欄位
   - 應顯示更新後的獎品名稱

**注意事項**：
- ⚠️ 獎品名稱僅影響 `card.html` 的中獎聯絡表單
- ⚠️ `card-simple.html` 不會使用此欄位
- ⚠️ 建議保持簡短清晰（5-15 字）

---

## ⚙️ 技術實作

### 工作表 1：金句技術實作

#### CSV 匯出 URL

系統使用以下 URL 取得 CSV 格式：
```
https://docs.google.com/spreadsheets/d/1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE/export?format=csv&gid=0
```

**參數說明**：
- `format=csv`：匯出為 CSV 格式
- `gid=0`：工作表 ID（金句工作表）

#### CORS 代理

由於瀏覽器 CORS 限制，使用代理：
```
https://api.allorigins.win/raw?url=[CSV_URL]
```

### 快取機制

```javascript
const CACHE_KEY = 'card_texts_probabilities_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 分鐘

// 讀取邏輯
if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < CACHE_DURATION) {
        // 使用快取
        texts = JSON.parse(cached);
        return;
    }
}

// 快取過期，重新載入
const response = await fetch(TEXT_PROBABILITY_SHEET_URL);
const csvData = await response.text();
texts = parseTextProbabilityCSV(csvData);

// 更新快取
localStorage.setItem(CACHE_KEY, JSON.stringify(texts));
localStorage.setItem(CACHE_KEY + '_time', Date.now().toString());
```

### CSV 解析

```javascript
function parseTextProbabilityCSV(csvData) {
    const lines = csvData.trim().split('\n');
    const textsFromSheet = [];

    for (let line of lines) {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const text = parts[0];
        const probability = parseFloat(parts[1]);
        const won = parseInt(parts[2]) || 0;

        if (text && !isNaN(probability) && probability > 0) {
            textsFromSheet.push({ text, probability, won });
        }
    }

    return textsFromSheet.length > 0 ? textsFromSheet : fallbackTexts;
}
```

### 降級策略

若試算表載入失敗，使用內建降級文字：

```javascript
const fallbackTexts = [
    { text: "今天很開心", probability: 0.2, won: 0 },
    { text: "昨天很美好", probability: 0.2, won: 0 },
    { text: "很期待明天", probability: 0.2, won: 0 },
    { text: "這兩天都是好天氣", probability: 0.2, won: 0 },
    { text: "會是一個好年的！", probability: 0.2, won: 0 }
];
```

---

### 工作表 2：配置技術實作

#### CSV 匯出 URL

系統使用以下 URL 取得 CSV 格式：
```
https://docs.google.com/spreadsheets/d/1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE/export?format=csv&gid=2058356234
```

**參數說明**：
- `format=csv`：匯出為 CSV 格式
- `gid=2058356234`：工作表 ID（配置工作表）

#### CORS 代理

同樣使用 `api.allorigins.win` 代理

#### 快取機制

```javascript
const CONFIG_CACHE_KEY = 'app_config_cache';
const CONFIG_CACHE_DURATION = 10 * 60 * 1000; // 10 分鐘

// 載入配置
async function loadConfigFromSheet() {
    // 檢查快取
    const cached = localStorage.getItem(CONFIG_CACHE_KEY);
    const cacheTime = localStorage.getItem(CONFIG_CACHE_KEY + '_time');

    if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CONFIG_CACHE_DURATION) {
            // 使用快取
            const config = JSON.parse(cached);
            appConfig.cooldownMinutes = config.cooldownMinutes;
            appConfig.prizeTitle = config.prizeTitle || '精美禮品';
            return;
        }
    }

    // 快取過期，重新載入
    const response = await fetch(CONFIG_SHEET_URL);
    const csvData = await response.text();
    const config = parseConfigCSV(csvData);

    // 更新全局配置
    appConfig.cooldownMinutes = config.cooldownMinutes;
    appConfig.prizeTitle = config.prizeTitle;

    // 儲存至快取
    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(CONFIG_CACHE_KEY + '_time', Date.now().toString());
}
```

#### CSV 解析

```javascript
function parseConfigCSV(csvData) {
    const lines = csvData.trim().split('\n');

    // 略過標題列，讀取第二列（資料列）
    if (lines.length >= 2) {
        const dataLine = lines[1];
        const parts = dataLine.split(',').map(p => p.trim().replace(/^"|"$/g, ''));

        return {
            cooldownMinutes: parseInt(parts[0]) || 60,
            prizeTitle: parts[1] || '精美禮品'
        };
    }

    // 降級至預設值
    return {
        cooldownMinutes: 60,
        prizeTitle: '精美禮品'
    };
}
```

#### 降級策略

若配置表載入失敗，使用預設值：

```javascript
const appConfig = {
    cooldownMinutes: 60,      // 預設 60 分鐘
    prizeTitle: '精美禮品'    // 預設獎品名稱
};
```

---

## 🔧 管理工具

### 清除快取（手動更新）

**方法一：控制台指令**
```javascript
// 清除所有快取
window.clearAllCaches()

// 重新載入頁面
location.reload()
```

**方法二：DevTools**
1. 開啟 DevTools（F12）
2. Application 標籤
3. Storage → Local Storage
4. 刪除 `card_texts_probabilities_cache` 鍵
5. 重新整理頁面

**方法三：直接重新整理**
- 等待 10 分鐘讓快取自動過期

### 驗證更新

**步驟**：
1. 更新試算表
2. 清除快取
3. 重新整理頁面
4. 開啟控制台
5. 查看輸出：
   ```
   ✨ Final text probabilities:
     📝 "今天很開心": 0.3 (30.0%)
     📝 "昨天很美好": 0.2 (20.0%)
     ...
   ```

## 📐 機率計算

### 權重不必加總為 1

系統會自動正規化，例如：

**試算表設定**：
```
文字 A: 3
文字 B: 2
文字 C: 5
```

**總權重** = 3 + 2 + 5 = 10

**實際機率**：
- 文字 A：3/10 = 30%
- 文字 B：2/10 = 20%
- 文字 C：5/10 = 50%

### 建議機率設定

| 類型 | 建議機率 | 說明 |
|------|---------|------|
| 一般文字 | 0.1 - 0.5 | 常見內容 |
| 中獎文字 | 0.01 - 0.1 | 稀有獎品，低機率 |
| 特殊文字 | 0.05 - 0.2 | 節日限定等 |

### 中獎機率範例

假設想要 5% 中獎率：

```csv
一般文字 1,0.19,0
一般文字 2,0.19,0
一般文字 3,0.19,0
一般文字 4,0.19,0
一般文字 5,0.19,0
恭喜中獎,0.05,1
```

**總權重** = 0.95 + 0.05 = 1.0
**中獎機率** = 0.05 / 1.0 = 5%

## 🔒 權限設定

### 試算表權限

**目前設定**：任何知道連結的人可檢視

**建議設定**：
- ✅ 檢視：任何知道連結的人
- ⚠️ 編輯：僅特定人員（管理員）

**設定方式**：
1. 開啟試算表
2. 點擊右上角「共用」
3. 「任何知道連結的人」→「檢視者」
4. 新增特定編輯者的 Email

### 安全性考量

✅ **無敏感資料**
- 試算表僅包含公開的抽卡文字
- ID 公開在程式碼中（可接受）

⚠️ **防止惡意編輯**
- 限制編輯權限給信任的管理員
- 定期備份試算表

⚠️ **版本歷史**
- Google 試算表自動保留版本歷史
- 可還原到任何時間點

## 🧪 測試案例

### TC-01: 新增文字並驗證

1. 在試算表新增一列：「測試文字,0.8,0」
2. 執行 `window.clearAllCaches()`
3. 重新整理頁面多次
4. **預期**：經常看到「測試文字」（80% 機率）

### TC-02: 調整機率並驗證

1. 將某文字機率從 0.1 改為 0.9
2. 清除快取並重新整理
3. 多次重新整理頁面
4. **預期**：該文字出現頻率大幅提升

### TC-03: 設定中獎並驗證

1. 將某文字的 won 從 0 改為 1
2. 清除快取並重新整理
3. 多次嘗試直到抽中
4. **預期**：該文字為藍色可點擊（card.html）

### TC-04: 試算表故障測試

1. 修改程式碼，使用無效的試算表 ID
2. 重新整理頁面
3. **預期**：使用降級文字，控制台顯示錯誤

### TC-05: 快取過期測試

1. 更新試算表
2. 不清除快取，等待 10 分鐘
3. 重新整理頁面
4. **預期**：自動載入新內容

## 💡 最佳實踐

### 內容撰寫

✅ **文字長度**
- 建議 10-20 字
- 太長可能超出卡片範圍
- 太短可能不夠吸引人

✅ **文字風格**
- 保持正面積極
- 避免敏感或爭議內容
- 符合品牌調性

✅ **多樣性**
- 至少 5-10 組文字
- 避免內容過於重複
- 定期更新保持新鮮感

### 機率設定

✅ **平衡性**
- 避免單一文字機率過高（> 50%）
- 確保所有文字都有機會出現
- 中獎機率建議 1-10%

✅ **測試驗證**
- 更新後實際測試抽卡
- 使用 Dev 模式快速測試
- 觀察使用者反饋

### 維護管理

✅ **定期更新**
- 節日推出特殊文字
- 淘汰過時內容
- 根據數據調整機率

✅ **備份**
- 定期下載試算表備份
- 使用版本歷史追蹤變更
- 記錄重大更新日誌

## 🔗 相關文件

- [抽卡系統（含中獎）(UC-02)](02-card-drawing-with-prizes.md)
- [簡易抽卡系統 (UC-03)](03-card-drawing-simple.md)
- [管理員手冊](../admin-guide.md)
- [技術架構](../technical-architecture.md)

---

**最後更新**：2025-10-13
**更新內容**：新增配置工作表（gid=2058356234）支援動態冷卻時間與獎品名稱
