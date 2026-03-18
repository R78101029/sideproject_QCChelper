# QCC Helper — MVP 開發計畫

> 本文件為**實作導向的開發計畫**，聚焦在「最快讓同仁可以用」。
> 完整需求規格見 `requirements.md`，本文件只關心：**做什麼、順序、取捨。**

## MVP 目標

> **一個圈隊能從步驟一走到步驟十，產出 PDF 報告交差。**

做到這件事就算 MVP 成功。其他功能都是加分項。

## 取捨原則

| 做 | 不做（MVP 後再說） |
|----|------------------|
| 十步驟表單能填能存 | 精簡/完整模式切換 |
| CSV 上傳 → 柏拉圖 | 魚骨圖互動編輯器 |
| AI 對話（streaming） | AI 幫我填（草稿填入） |
| PDF 報告匯出 | PPT / 海報匯出 |
| 基本登入 + 角色 | 通知系統 |
| 管理員看進度 | 評鑑報告、知識庫、趨勢分析 |
| 自動儲存 | upstream_snapshot + hash 比對 |
| CSV 欄位名稱警告（簡易個資提醒） | 三層 PII 防護架構 |
| 直接呼叫 Claude API | LLM Adapter 抽象層 |

### 個資處理（MVP 簡化版）

MVP 階段不做完整的白名單過濾器和 PII middleware。只做：

1. **CSV 上傳預覽頁面**加一行提醒文字：「請確認資料中不包含病患姓名、病歷號等個資」
2. **AI 對話輸入框**上方加常駐灰色提醒：「請勿輸入病患個資」
3. CSV 後端解析時，**不傳原始逐筆數據給 AI**，只傳聚合後的統計摘要（這本來就是架構設計）

完整的 `csv-sanitizer.ts`（白名單欄位過濾）和 `pii-filter.ts`（固定格式攔截）留到 MVP 後再實作。

---

## Sprint 計畫

### Sprint 0 — 地基（1 週）

**目標：專案能跑起來、能連資料庫、有基本頁面骨架。**

```
交付物：
├── Next.js 專案 + TypeScript + Tailwind CSS
├── Prisma schema（全部 17 張表一次建好）
├── Docker Compose（app + db + nginx）
├── 基本 Layout（Sidebar 十步驟導航 + Header）
├── 首頁空殼（專案列表）
├── .env.example
└── Step 1~10 TypeScript 型別定義（types/steps.ts）
```

**關鍵決策：**

- Prisma schema **一次全部建好**，包含 KPI 欄位、Notification 等。表先建好不代表要寫 API，但後續不用反覆 migrate
- 型別定義也一次寫完（Step1Data ~ Step10Data），用 Zod 做 runtime 驗證。後續表單開發直接用
- 暫不設定 Browserless 容器，PDF 匯出在 Sprint 4 再處理
- `claude.ts` 直接封裝 `@anthropic-ai/sdk`，不做 adapter 抽象。MVP 只用 Claude

**不做：**
- ~~LLM Adapter 抽象層~~ → 直接呼叫 Claude
- ~~PII filter~~ → 只加 UI 文字提醒
- ~~Notification 表的 API~~ → 表建好但 API 之後寫

---

### Sprint 1 — 登入 + 專案 CRUD（1 週）

**目標：能登入、能建專案、能看到專案列表。**

```
交付物：
├── POST /api/auth/login, logout, GET /me
├── JWT + httpOnly cookie
├── 角色中介層 middleware
├── 專案 CRUD API（GET/POST/PUT）
├── 登入頁面
├── 首頁 — 專案列表（卡片式，顯示圈名、科別、進度）
├── 建立新專案頁面（圈名 + 科別 + 活動期間，三個欄位就好）
└── 專案總覽頁面骨架（十步驟進度條）
```

**帳號建立方式：**
- MVP 不做註冊頁面，由管理員/網管在後台建帳號
- 預設建一個 sys_admin 帳號（seed script）

---

### Sprint 2a — 步驟表單 1~5（1.5 週）

**目標：前五步驟能填寫、能儲存。**

```
交付物：
├── GET/PUT /api/projects/:id/steps/:n
├── 自動儲存（debounce 3 秒 + 儲存狀態指示器）
├── 步驟一：組圈（圈員名單表單 + 圈徽上傳）
├── 步驟二：主題選定（候選主題 + 評價矩陣 — 純表單，先不做自動計分）
├── 步驟三：活動計畫（時程表單 — 純表單，先不做甘特圖）
├── 步驟四：現況把握（CSV 上傳 + 前端預覽 + 後端解析 — 先不做柏拉圖）
├── 步驟五：目標設定（目標值計算表單）
├── 檔案上傳 API（POST /api/projects/:id/uploads）
└── 側邊欄步驟自由導航（點任何步驟都能跳入）
```

**CSV 解析重點：**
- 使用 `fast-csv` stream mode（不一次載入全檔）
- 後端聚合後回傳分類統計表
- 前端預覽頁加灰色提醒文字（個資）
- 暫不傳 AI，只做解析和統計

**步驟間連動（簡化版）：**
- 步驟五自動帶入步驟四的 `current_rate`（有就帶，沒有就空）
- 不做 upstream_snapshot、不做 hash 比對（MVP 後再加）

---

### Sprint 2b — 步驟表單 6~10（1.5 週）

**目標：後五步驟能填寫、能儲存。一個完整的品管圈流程可以走完。**

```
交付物：
├── 步驟六：解析（魚骨圖 — MVP 用簡化版：大骨+小骨的樹狀列表，不做互動拖拉圖）
├── 步驟七：對策擬定（5W1H 表單 + 評價矩陣）
├── 步驟八：對策實施（實施進度表 — 表格填寫）
├── 步驟九：效果確認（CSV 上傳 + 改善幅度/達成率自動計算）
├── 步驟十：標準化與檢討（SOP 文字表單 + 檢討表單）
├── 步驟九自動帶入步驟四、五的數據做對比
└── Project KPI 欄位同步（步驟四/五/九儲存時寫入 Project 表）
```

**魚骨圖簡化策略：**
- MVP 不做 ECharts 互動式魚骨圖（開發成本高）
- 改用**樹狀列表 UI**：5M1E 六個大分類，每個下面可新增小要因
- 視覺上夠清楚，數據結構和最終版一樣（`main_categories` JSON）
- 正式版再換成 ECharts/SVG 渲染

**步驟二/七 評價矩陣簡化：**
- MVP 先做「圈長代填總分」（一人填所有分數），不做「每位圈員各別打分」
- 因為「每人打分 → 自動加總」的 UI 複雜度高，且實務上常常是圈長彙整後統一輸入

---

### Sprint 3 — 圖表（1.5 週）

**目標：柏拉圖能正確產生並顯示。**

```
交付物：
├── ParetoChart.tsx — ECharts 柏拉圖元件
│   ├── bar + line 複合圖
│   ├── X 軸由高到低排序（「其他」放最末）
│   ├── 右 Y 軸累積百分比 + 80% 線
│   └── 累積百分比起始值為 0%
├── 步驟四嵌入柏拉圖（改善前）
├── 步驟九嵌入柏拉圖（改善後）
├── 改善前後並排對比頁面
├── RadarChart.tsx — 雷達圖（步驟九無形成果）
├── POST /api/analyze/pareto — 柏拉圖數據計算
├── POST /api/analyze/effectiveness — 改善幅度計算
└── 圖表 PNG 下載（echarts.getDataURL()）
```

**不做：**
- ~~甘特圖~~ → MVP 步驟三用純文字時程表
- ~~魚骨圖 ECharts 渲染~~ → Sprint 2b 已用樹狀列表替代
- ~~chart_config 持久化~~ → MVP 後再加

**為什麼柏拉圖優先？**
因為柏拉圖是品管圈報告的**核心圖表**，沒有柏拉圖就不算完成品管圈。其他圖表是加分。

---

### Sprint 4 — AI 對話 + PDF 匯出（2 週）

**目標：同仁能和 AI 對話問問題；能匯出 PDF 報告交差。**

```
交付物：
├── AI 對話
│   ├── POST /api/chat（streaming response）
│   ├── claude.ts — 直接封裝 @anthropic-ai/sdk（不做 adapter）
│   ├── AgentChat.tsx — 對話 UI 元件（嵌在步驟頁面側邊）
│   ├── 各步驟 system prompt（動態注入專案數據）
│   ├── ChatHistory 儲存
│   └── 對話輸入框上方加「請勿輸入個資」灰色提醒
│
├── PDF 匯出
│   ├── docker-compose 加入 browserless/chrome 容器
│   ├── lib/export.ts — 呼叫 browserless API 將 HTML 轉 PDF
│   ├── 匯出用隱藏頁面（/project/:id/export/render）
│   │   └── 十步驟完整報告 HTML（含柏拉圖、雷達圖）
│   ├── POST /api/projects/:id/export/pdf
│   └── 缺漏欄位顯示「（待補充）」，不阻擋匯出
│
└── 匯出頁面 UI（選擇匯出格式、預覽、下載）
```

**AI 範圍限制（MVP）：**
- 只做**對話問答**，不做「AI 幫我填」（草稿自動填入表單）
- 同仁可以問 AI「這步該怎麼寫」「幫我分析這組數據」，AI 回答後同仁自己複製貼上
- 這樣可以先驗證 AI 的實際價值，再決定是否投入「AI 幫我填」的開發

**PDF 匯出策略：**
- 建一個隱藏的 HTML 報告頁面，把十步驟的內容渲染成排版好的 HTML
- 呼叫 browserless 容器對這個頁面截圖/轉 PDF
- 好處：所見即所得，中文字型由 browserless 處理，不需要操心 jsPDF

---

### Sprint 5 — 管理員 + 收尾（1 週）

**目標：管理員能看到全院進度；系統可以正式上線。**

```
交付物：
├── 管理員儀表板
│   ├── GET /api/admin/dashboard
│   ├── 一眼總覽卡片（進行中 / 卡關 / 即將到期 / 已完成）
│   ├── 全圈隊進度表（圈名、科別、目前步驟、落後狀態）
│   └── 點擊圈名跳到專案總覽
│
├── 帳號管理
│   ├── 帳號 CRUD API
│   ├── 管理員帳號管理頁面
│   └── 密碼重設
│
├── 收尾
│   ├── 錯誤處理（全域 error boundary + API 錯誤統一格式）
│   ├── 載入狀態（skeleton loading）
│   ├── 響應式微調（確保平板可用）
│   ├── Docker 部署測試
│   └── 種子資料（demo 專案 + 預設帳號）
```

**不做：**
- ~~範本管理~~ → MVP 不做範本，seed 一個 demo 專案就好
- ~~輔導紀錄~~ → MVP 後再加
- ~~教學中心~~ → MVP 後再加
- ~~評鑑報告~~ → MVP 後再加
- ~~知識庫~~ → MVP 後再加

---

## 時程總覽

```
Sprint 0  ████                     地基（1 週）
Sprint 1  ████                     登入 + 專案（1 週）
Sprint 2a ██████                   步驟 1~5（1.5 週）
Sprint 2b ██████                   步驟 6~10（1.5 週）
Sprint 3  ██████                   圖表（1.5 週）
Sprint 4  ████████                 AI + PDF（2 週）
Sprint 5  ████                     管理員 + 收尾（1 週）
          ────────────────────────────────────────
          總計約 9~10 週
```

## MVP 交付物清單

完成後，系統能做到：

- [x] 同仁能登入、建立品管圈專案
- [x] 十大步驟能填寫、自動儲存、自由跳步
- [x] CSV 上傳 → 自動產生柏拉圖（改善前/後）
- [x] 改善幅度、目標達成率自動計算
- [x] 雷達圖（無形成果）
- [x] 和 AI 對話問問題（每步驟有專屬 system prompt）
- [x] 匯出 PDF 報告（含圖表、中文字型）
- [x] 管理員看全院進度、卡關預警
- [x] 帳號管理

## MVP 不做但已設計好的（第二波）

以下功能在 `requirements.md` 中已完整定義，MVP 後可依優先順序逐步加入：

| 優先 | 功能 | 理由 |
|:---:|------|------|
| 1 | AI 幫我填（草稿自動填入） | MVP 驗證 AI 價值後再做 |
| 2 | 魚骨圖互動編輯器 | MVP 用樹狀列表替代，功能完整 |
| 3 | 甘特圖 | MVP 用文字時程表替代 |
| 4 | 輔導紀錄 + 通知 | 下次輔導月會前加 |
| 5 | 精簡/完整模式切換 | 看同仁使用反饋決定 |
| 6 | PII 完整防護（白名單過濾 + regex） | MVP 後強化 |
| 7 | LLM Adapter（地端模型支援） | 醫院要求時再做 |
| 8 | upstream_snapshot + hash 比對 | 數據一致性問題浮現時再加 |
| 9 | 評鑑報告 / 知識庫 | 累積足夠專案後才有意義 |
| 10 | 趨勢分析 / 效益量化 | 長期功能 |

## 技術風險與 Spike

在 Sprint 0 開始前或進行中，需要驗證的技術風險：

| 風險 | 驗證方式 | 預計時間 |
|------|---------|---------|
| Browserless + 中文 PDF | 起一個 browserless 容器，渲染含中文 + ECharts 的 HTML → PDF | 半天 |
| ECharts 柏拉圖規格 | 寫一個獨立的柏拉圖 demo（bar + line + 80% 線 + 累積起始 0%），確認渲染正確 | 半天 |
| CSV stream 解析 | 用 fast-csv pipeline 解析 1 萬行 CSV，驗證記憶體使用與效能 | 2 小時 |
| Claude streaming in Next.js | 在 API Route 中用 @anthropic-ai/sdk streaming，確認前端能即時顯示 | 2 小時 |

建議在 Sprint 0 的第一天先跑這四個 spike，確認技術路線可行後再全速開發。
