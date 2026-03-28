# QCC Helper — 開發計畫（iQCC 整合版）

> 本計畫利用多個 AI Agent 並行開發，大幅壓縮時程。
> 完整需求規格見 `requirements.md`，本文件聚焦：**誰做什麼、同時做什麼、依賴關係。**
>
> **2026-03-28 更新：整合 iQCC（智慧品質圈）研究計畫。**
> iQCC 研究文件見 `docs/` 目錄下三份 .md 檔。

---

## 三階段總覽

| 階段 | 目標 | 預估時程 |
|------|------|---------|
| **Phase 1 — MVP** | 一個圈隊能走完十步驟、產出 PDF 報告（含 iQCC 相容架構） | 4~5 週 |
| **Phase 2 — 強化 + iQCC** | AI 主動幫填、互動圖表、**iQCC 引導式 AI 工作流**、輔導機制、資安強化、研究數據匯出 | 4~5 週 |
| **Phase 3 — 醫院治理** | 知識庫、評鑑報告、趨勢分析、持續改善追蹤 | 3~4 週 |

---

## iQCC 整合策略

### 核心決策（2026-03-28 確認）

1. **步驟結構**：維持台灣 10 步驟標準（不改為 iQCC 8 步驟）
2. **AI-QCF 角色**：系統本身自動化 AI-QCF，不需人類促進員
3. **對照組**：傳統 QCC 對照組使用人工流程，不進系統
4. **研究問卷**：外部工具（Google Forms 等），系統只匯出研究數據
5. **對策壓力測試**：作為 Step 7 子流程，不新增步驟
6. **Phase 分配**：iQCC 進階功能放 Phase 2，Phase 1 預留相容架構

### iQCC 功能 × 10 步驟映射

| 步驟 | 現有 MVP 功能 | iQCC 新增能力（Phase 2） |
|---|---|---|
| 1 組圈 | 圈員名單+圈徽 | — |
| 2 主題選定 | 評價矩陣 | AI 背景掃描、重要性摘要 |
| 3 活動計畫 | 時程表格 | AI 自動建議甘特圖草案 |
| 4 現況把握 | CSV→柏拉圖 | AI 現況分析整合報告（數據敘事+主題歸納） |
| 5 目標設定 | 帶入 step4 | AI 外部對標（文獻參考區間）+ 目標分解 |
| 6 解析 | 樹狀列表 | **三階段因果探勘法**（柏拉圖→5-Why 互動→因果驗證） |
| 7 對策擬定 | 5W1H+評價矩陣 | AI 對策草案生成 + **對策壓力測試迴圈**（提案→對抗審查→修正） |
| 8 對策實施 | 進度+照片 | — |
| 9 效果確認 | 前後柏拉圖+雷達 | AI 成效比較報告自動生成 |
| 10 標準化 | SOP+檢討 | AI 一文多用（SOP/查核表/FAQ 批量生成） |

### AI 互動模式演進

```
Phase 1（MVP）：
  ChatMode = 'freeform'     ← 每步驟一個 AI 聊天側邊欄

Phase 2（iQCC）：
  ChatMode =
    | 'freeform'            ← 自由對話（保留）
    | 'guided_analysis'     ← 三階段因果探勘（Step 6）
    | 'pressure_test'       ← 對策壓力測試迴圈（Step 7）
    | 'report_generation'   ← 報告自動生成（Step 4, 9, 10）
    | 'background_scan'     ← 背景掃描 / 外部對標（Step 2, 5）
```

### Phase 1 必須預留的相容架構

以下欄位在 Phase 1 就要建好（即使 Phase 1 不使用）：

```prisma
model ChatHistory {
  // ...現有欄位
  mode       String   @default("freeform")  // Phase 2: guided_analysis 等
  metadata   Json?                          // Phase 2: 工作流狀態、輪次紀錄
}
```

Step 6/7 的 Zod schema 預留 optional 擴展欄位：
- Step6Data: `causal_verification?: CausalVerification[]`
- Step7Data: `pressure_test?: PressureTestRound[]`

---

# Phase 1 — MVP

> **目標：一個圈隊能從步驟一走到步驟十，產出 PDF 報告交差。**
> **架構目標：Phase 2 iQCC 功能可無痛接入。**

## MVP 取捨

| 做 | 不做（Phase 2/3） |
|----|------------------|
| 十步驟表單能填能存 | 精簡/完整模式切換 |
| CSV 上傳 → 柏拉圖 | 魚骨圖互動編輯、甘特圖 |
| AI 對話（streaming, freeform） | iQCC 引導式 AI 工作流 |
| PDF 報告匯出 | PPT / 海報匯出 |
| 基本登入 + 角色 | 通知系統 |
| 管理員看進度 | 評鑑報告、知識庫、趨勢分析 |
| 自動儲存 | upstream_snapshot + hash 比對 |
| UI 個資提醒文字 | 三層 PII 防護架構 |
| 直接呼叫 Claude API | LLM Adapter 抽象層 |
| ChatHistory.mode 欄位（預留） | 引導式 AI 工作流實作 |
| Step6/7 schema 預留 iQCC 欄位 | 三階段因果探勘、壓力測試實作 |

## Agent 團隊配置

```
Agent-F  Foundation    地基：專案初始化、Prisma、Docker、型別
Agent-A  API           後端 API 全部：Auth、Project、Step、Upload、Analyze
Agent-S  StepForms     前端步驟表單：Step1Form ~ Step10Form + 自動儲存
Agent-C  Charts        圖表元件：柏拉圖、雷達圖（可用 mock data 獨立開發）
Agent-I  AI-Chat       AI 整合：Claude API、對話 UI、system prompt
Agent-E  Export        PDF 匯出：Browserless 容器、報告 HTML 模板
Agent-D  Dashboard     管理員：儀表板、帳號管理、收尾
```

## 依賴關係圖

```
Week 1          Week 2          Week 3          Week 4          Week 5
─────────────── ─────────────── ─────────────── ─────────────── ──────────
                │
Agent-F ████████│
  Foundation    │
  (Prisma,      │
   Docker,      │
   Layout,      ▼
   Types)       ┬───────────────────────────────────────────────
                │
                ├─ Agent-A ████████████████████
                │  API (Auth→Project→Step→    │
                │  Upload→Analyze)            │
                │                             │
                ├─ Agent-S ████████████████████│██████
                │  StepForms (1~5, 6~10)      │  整合
                │                             │
                ├─ Agent-C ██████████         │
                │  Charts (Pareto, Radar)     │
                │                             │
                ├─ Agent-I ██████████████      │
                │  AI Chat (Claude, prompts)  │
                │                             ▼
                │                    ┌─────────────────
                │                    │
                │               Agent-E ████████████
                │               Export (Browserless,
                │                      Report HTML,
                │                      Export API)
                │                             │
                │                             ▼
                │                    ┌─────────────────
                │                    │
                └──────────────Agent-D ████████
                               Dashboard +
                               收尾 + 部署
```

## Sprint 詳細計畫

### Sprint 0 — 地基（Agent-F 單獨，1 週）

> 所有 Agent 都依賴這個。必須先完成。

```
Agent-F 交付物：
├── Next.js 14 專案 + TypeScript strict + Tailwind CSS
├── Prisma schema（全部 17 張表一次建好）
│   ├── User, UserCircle, Project (+KPI 欄位), Member
│   ├── Step (+view_mode, +ai_draft_fields), Upload, Reference
│   ├── CoachingRecord, CoachingSuggestion, DiscussionItem
│   ├── ChatHistory (+mode, +metadata), StepChangeLog, ProjectTemplate, SystemSetting
│   ├── ProjectBenefit, FollowUp, Notification
│   └── 執行 prisma migrate dev 確認 schema 正確
├── Docker Compose（app + db + nginx）
│   └── nginx: client_max_body_size 20m
├── 基本 Layout
│   ├── Sidebar（十步驟導航 + 專案資訊）
│   ├── Header（使用者名稱 + 登出按鈕位置）
│   └── 主內容區 responsive 骨架
├── 共用 UI 元件
│   ├── Button, Input, Textarea, Select, Card
│   ├── Table, Modal, Toast/Alert
│   └── SaveIndicator（已儲存/儲存中/未儲存）
├── types/steps.ts — Step1Data ~ Step10Data TypeScript 介面
│   └── ★ Step6Data 預留 causal_verification, Step7Data 預留 pressure_test
├── lib/step-schemas.ts — Zod schema（runtime 驗證）
│   └── ★ 對應 iQCC 擴展欄位設為 optional
├── lib/prisma.ts — Prisma Client 單例
├── .env.example
├── prisma/seed.ts — 預設 sys_admin 帳號 + demo 資料
└── 4 個技術 spike（見下方）
```

**Sprint 0 第一天：4 個 Spike（並行驗證）**

| Spike | 驗證內容 | Agent |
|-------|---------|-------|
| Browserless PDF | 起 browserless/chrome 容器 → 渲染中文+ECharts HTML → 產出 PDF | Agent-F |
| ECharts 柏拉圖 | 獨立 demo：bar+line+80%線+累積起始0%，確認規格正確 | Agent-F |
| CSV stream | fast-csv pipeline 解析 1 萬行，驗證記憶體恆定 | Agent-F |
| Claude streaming | Next.js API Route + @anthropic-ai/sdk streaming → 前端即時顯示 | Agent-F |

---

### Sprint 1~3 — 並行開發（4 個 Agent 同時，2 週）

Sprint 0 完成後，以下 4 個 Agent **同時啟動**：

#### Agent-A：後端 API（2 週）

```
Week 1 交付：
├── lib/auth.ts — JWT 產生/驗證 + httpOnly cookie
├── middleware.ts — 角色權限檢查（team_rep/qcc_admin/sys_admin）
├── POST /api/auth/login — 登入，回傳 JWT
├── POST /api/auth/logout — 登出，清除 cookie
├── GET  /api/auth/me — 取得目前使用者
├── GET  /api/projects — 專案列表（依角色過濾）
├── POST /api/projects — 建立專案
├── GET  /api/projects/:id — 專案詳情（含各步驟 status）
├── PUT  /api/projects/:id — 更新專案
├── GET  /api/projects/:id/steps — 所有步驟狀態
├── GET  /api/projects/:id/steps/:n — 取得步驟 data
├── PUT  /api/projects/:id/steps/:n — 更新步驟 data（自動儲存用）
│   └── 步驟四/五/九儲存時同步 KPI 至 Project 表
├── PUT  /api/projects/:id/steps/:n/status — 更新步驟狀態
└── GET  /api/projects/:id/steps/:n/completeness — 建議欄位填寫進度

Week 2 交付：
├── POST /api/projects/:id/uploads — 上傳檔案（multipart）
├── GET  /api/projects/:id/uploads — 檔案列表
├── GET  /api/uploads/:uid/download — 下載
├── DELETE /api/uploads/:uid — 刪除
├── POST /api/analyze/csv — CSV stream 解析 + 聚合統計
├── POST /api/analyze/pareto — 柏拉圖數據計算
├── POST /api/analyze/target — 目標值計算
├── POST /api/analyze/effectiveness — 改善幅度/達成率
├── GET  /api/admin/dashboard — 全院進度（query Project KPI 欄位）
├── GET  /api/admin/stalled — 卡關圈隊
├── GET/POST /api/admin/users — 帳號管理
├── PUT  /api/admin/users/:uid — 更新帳號
└── PUT  /api/admin/users/:uid/reset-password — 重設密碼
```

#### Agent-S：步驟表單前端（2 週）

> 依賴 Agent-F 的 Layout、types、Zod schema。
> API 尚未就緒時，用 mock data 或 localStorage 暫存開發。

```
Week 1 交付（步驟 1~5）：
├── 自動儲存 hook（useAutoSave）
│   ├── debounce 3 秒
│   ├── SaveIndicator 元件整合
│   └── beforeunload 離開提醒
├── 步驟頁面共用骨架（/project/[id]/step/[n]/page.tsx）
│   ├── 讀取 step data → 填入表單
│   ├── 表單變更 → useAutoSave
│   └── 步驟完成度提示（已填 X / 共 Y 欄位）
├── Step1Form.tsx — 組圈
│   ├── 圈員名單（動態新增/刪除列）
│   ├── 圈徽上傳（圖片預覽）
│   └── 基本資訊欄位
├── Step2Form.tsx — 主題選定
│   ├── 候選主題清單（動態新增）
│   ├── 評價矩陣表格（圈長代填版）
│   └── 自動加總 + 選定主題
├── Step3Form.tsx — 活動計畫
│   └── 時程表格（步驟 × 預定/實際日期，純表單）
├── Step4Form.tsx — 現況把握
│   ├── CSV 上傳元件 + 前端預覽
│   ├── 「請確認不含個資」灰色提醒
│   ├── 呼叫 /api/analyze/csv → 顯示統計表
│   └── 柏拉圖預留位置（Sprint 3 嵌入）
├── Step5Form.tsx — 目標設定
│   ├── 自動帶入步驟四 current_rate（有就帶，沒有留空）
│   ├── 目標值計算公式 UI
│   └── 呼叫 /api/analyze/target
└── 專案總覽頁面（十步驟進度條 + 點擊跳入）

Week 2 交付（步驟 6~10）：
├── Step6Form.tsx — 解析
│   ├── 5M1E 樹狀列表（六個大分類 + 新增小要因）
│   ├── 真因勾選
│   └── 數據結構 = requirements.md main_categories JSON
│   └── ★ UI 預留「AI 因果探勘」區塊位置（Phase 2 啟用）
├── Step7Form.tsx — 對策擬定
│   ├── 5W1H 對策表單（動態新增對策卡片）
│   ├── 評價矩陣（圈長代填版）
│   ├── 採行/不採行分類
│   └── ★ UI 預留「壓力測試」tab 位置（Phase 2 啟用）
├── Step8Form.tsx — 對策實施
│   └── 實施進度表格（狀態、前後描述、照片上傳）
├── Step9Form.tsx — 效果確認
│   ├── CSV 上傳（同步驟四）
│   ├── 自動帶入步驟四、五數據做對比
│   ├── 改善幅度/達成率自動計算顯示
│   ├── 雷達圖自評（無形成果）前後對比表
│   └── 柏拉圖預留位置
├── Step10Form.tsx — 標準化與檢討
│   ├── SOP 表格（標準化內容 + 文件編號）
│   └── 檢討表單（優點、待改進、下期建議）
├── 首頁 — 專案列表頁
│   ├── 專案卡片（圈名、科別、進度百分比）
│   └── 建立新專案按鈕
├── 建立新專案頁面
│   └── 圈名 + 科別 + 活動期間（三個欄位）
└── 登入頁面
```

#### Agent-C：圖表元件（1 週，可提前完成）

> 完全獨立，用 mock data 開發。不需要等 API。

```
交付物：
├── ParetoChart.tsx
│   ├── ECharts bar + line 複合圖
│   ├── X 軸分類由高到低排序（「其他」放最末）
│   ├── 左 Y 軸：次數（bar）
│   ├── 右 Y 軸：累積百分比（line）
│   ├── 80% 參考線
│   ├── 累積百分比起始值 = 0%
│   ├── Props: { data: ParetoItem[], title?: string }
│   └── PNG 下載按鈕（getDataURL）
├── RadarChart.tsx
│   ├── ECharts radar
│   ├── 改善前（虛線）vs 改善後（實線）
│   ├── Props: { criteria: string[], before: number[], after: number[] }
│   └── PNG 下載按鈕
├── ParetoComparison.tsx
│   ├── 兩張柏拉圖並排（改善前 vs 改善後）
│   └── 改善幅度/達成率摘要卡片
├── lib/chart-data.ts
│   ├── sortPareto() — 排序+累積百分比計算
│   ├── calculateImprovement() — 改善幅度
│   └── calculateAchievement() — 目標達成率
└── Storybook 或獨立 demo 頁面驗證
```

#### Agent-I：AI 對話整合（1.5 週，可提前完成）

> 核心依賴只有 Prisma schema（ChatHistory 表）和基本 Layout。
> ★ Phase 1 只實作 freeform 模式，但 API 架構要支援 mode 切換。

```
交付物：
├── lib/claude.ts
│   ├── 封裝 @anthropic-ai/sdk
│   ├── streamChat(messages, systemPrompt, mode?) → ReadableStream
│   └── 不做 adapter，直接呼叫 Claude
├── POST /api/chat
│   ├── 接收 { projectId, stepNumber, message, mode? }
│   │   └── ★ mode 參數預留（Phase 1 只接受 "freeform"，Phase 2 擴展）
│   ├── 組裝 system prompt（動態注入專案數據）
│   ├── streaming response（text/event-stream）
│   └── 完成後儲存 ChatHistory（含 mode + metadata）
├── GET /api/projects/:id/chat/history
│   └── 依 stepNumber + mode 分組回傳
├── 10 套 system prompt（每步驟一套）
│   ├── 角色定義 + 步驟目的 + 關鍵要點 + 常見錯誤
│   ├── ★ 角色統一為「AI 品管促進員」語氣（為 Phase 2 iQCC 鋪路）
│   ├── 步驟 5 注入步驟 4 的 current_rate, vital_few
│   ├── 步驟 7 注入步驟 6 的 confirmed_root_causes
│   └── 步驟 9 注入步驟 4, 5 數據
├── AgentChat.tsx — 對話 UI 元件
│   ├── 可摺疊側邊面板（不佔主表單空間）
│   ├── 訊息列表（user/assistant 氣泡）
│   ├── streaming 逐字顯示
│   ├── 輸入框 + 送出按鈕
│   ├── 輸入框上方灰色提醒：「請勿輸入病患個資」
│   ├── ★ mode 切換 UI 預留（Phase 1 隱藏，Phase 2 啟用）
│   └── 歷史紀錄載入
└── 步驟頁面整合（AgentChat 嵌入步驟表單右側）
```

---

### Sprint 4 — 匯出 + 整合（Agent-E + Agent-D，1.5 週）

> 等 Agent-S（表單）和 Agent-C（圖表）完成後才能開始。

#### Agent-E：PDF 匯出（1 週）

```
交付物：
├── docker-compose.yml 加入 browserless/chrome 容器
│   ├── image: browserless/chrome
│   ├── MAX_CONCURRENT_SESSIONS=2
│   └── 確認中文字型正確
├── lib/export.ts
│   ├── generatePDF(projectId) → Buffer
│   ├── 呼叫 browserless API：POST http://qcc-browserless:3000/pdf
│   └── 傳入隱藏報告頁面 URL
├── /project/[id]/export/render/page.tsx（隱藏頁面）
│   ├── 讀取所有步驟 data
│   ├── 渲染十步驟完整報告 HTML
│   ├── 嵌入 ParetoChart + RadarChart
│   ├── 缺漏欄位顯示「（待補充）」
│   └── 排版：A4 尺寸、適當分頁、院徽/頁首頁尾
├── POST /api/projects/:id/export/pdf
│   └── 回傳 PDF Buffer → 前端下載
└── /project/[id]/export/page.tsx — 匯出頁面 UI
    ├── 匯出前 checklist（各步驟填寫狀態一覽）
    ├── 「匯出 PDF」按鈕 + 進度提示
    └── 下載完成提示
```

#### Agent-D：管理員 + 收尾（1 週，與 Agent-E 並行）

```
交付物：
├── 管理員儀表板頁面
│   ├── 一眼總覽卡片（進行中/卡關/即將到期/已完成）
│   ├── 全圈隊進度表（圈名、科別、步驟、落後狀態）
│   ├── 依科別/狀態篩選排序
│   └── 點擊圈名 → 跳到專案總覽
├── 帳號管理頁面
│   ├── 帳號列表 + 新增/編輯/停用
│   └── 密碼重設
├── 收尾整合
│   ├── 全域 Error Boundary
│   ├── API 錯誤統一格式
│   ├── Skeleton Loading（步驟頁面、專案列表）
│   ├── 響應式微調（平板可用）
│   ├── Agent-S + Agent-C + Agent-I 整合測試
│   │   ├── 步驟四表單 → CSV 上傳 → 柏拉圖顯示
│   │   ├── 步驟九表單 → 前後對比 → 改善幅度計算
│   │   └── 任一步驟 → 開啟 AI 對話 → 正常 streaming
│   ├── Docker 全環境部署測試
│   └── prisma/seed.ts 更新（demo 專案含完整十步驟範例數據）
```

## Phase 1 時程甘特圖

```
        Week 1       Week 2       Week 3       Week 4       Week 5
        ──────────── ──────────── ──────────── ──────────── ────────
Agent-F ████████████
        地基+Spike
        +iQCC 相容欄位

Agent-A              ████████████ ████████████
                     Auth+Project  Upload+Analyze
                     Step API      Admin API

Agent-S              ████████████ ████████████ ██████
                     Step 1~5      Step 6~10    整合
                     自動儲存       KPI sync     修補

Agent-C              ████████████
                     Pareto+Radar
                     (mock data)

Agent-I              ████████████ ██████
                     Claude+Chat   Prompt
                     streaming     整合
                     +mode 預留

Agent-E                                        ████████████
                                               Browserless
                                               Report HTML
                                               Export API

Agent-D                                        ████████████ ████████
                                               Admin 儀表板  收尾
                                               帳號管理      部署

                                                             ✅ MVP
                                                             上線
```

**關鍵路徑：** Agent-F → Agent-S（最長） → Agent-E → Agent-D
**並行最大化：** Week 2~3 同時跑 4 個 Agent（A, S, C, I）

---

# Phase 2 — 強化 + iQCC（MVP 上線後 4~5 週）

> **目標：讓系統從「能用」變成「好用」，同時實現 iQCC 自動化 AI-QCF 功能。**
> **研究支持：系統可作為 iQCC 實證研究的實驗組工具。**

## Phase 2 功能範圍

| 功能群 | 內容 | 價值 |
|--------|------|------|
| **★ iQCC 引導式 AI** | 三階段因果探勘、對策壓力測試迴圈、AI 報告生成、背景掃描 | 系統自動扮演 AI-QCF |
| **AI 強化** | AI 幫我填（草稿自動填入）、AI 草稿標記/確認機制 | 大幅降低同仁填寫負擔 |
| **互動圖表** | 魚骨圖 ECharts 互動編輯器、甘特圖 | 報告視覺品質提升 |
| **評價矩陣完整版** | 每位圈員各別打分 → 自動加總 | 評審要求 |
| **輔導機制** | 輔導紀錄 CRUD、建議追蹤、一鍵輔導摘要 | 月會報告用 |
| **通知** | Notification 表 + Header 小紅點 | 輔導建議通知 |
| **資安強化** | CSV 白名單欄位過濾、固定格式 PII 攔截 | 合規要求 |
| **UX 優化** | 精簡/完整模式切換、圖表設定持久化 | 使用體驗提升 |
| **★ 研究數據匯出** | 時間戳匯出、AI 互動紀錄、匿名報告匯出 | iQCC 研究用 |

## Phase 2 Agent 並行規劃

```
Agent-QCF   iQCC AI-QCF    引導式 AI 工作流：因果探勘 + 壓力測試 + 報告生成
Agent-AI    AI 強化         AI 幫我填 + 草稿標記 + 健康度建議
Agent-VIZ   互動圖表        魚骨圖編輯器 + 甘特圖 + chart_config
Agent-COA   輔導 + 資安     輔導紀錄 + 通知 + PII 過濾 + 精簡模式 + 研究匯出
```

### ★ Agent-QCF：iQCC 自動化 AI-QCF（2.5 週）

> **最重要的 Phase 2 新增 Agent。實現系統自動扮演 AI 品管促進員。**

```
Week 1 — 三階段因果探勘法（Step 6 引導式 AI）：
├── lib/iqcc/guided-analysis.ts
│   ├── Stage 1: AI 輔助柏拉圖分析
│   │   └── 自動從 Step 4 數據找出「關鍵少數」，生成分析敘事
│   ├── Stage 2: AI 5-Why 互動追問
│   │   ├── AI 扮演「5-Why 大師」角色
│   │   ├── 多輪對話：團隊提出原因 → AI 追問「為什麼？」→ 團隊回答 → 繼續追問
│   │   ├── 每輪自動記錄到 ChatHistory (mode='guided_analysis')
│   │   └── AI 在追問 3-5 層後主動建議「是否已到根本原因」
│   └── Stage 3: AI 因果假設驗證
│       ├── AI 回到 Step 4 的原始數據中搜尋支持/反駁證據
│       ├── 生成「因果關係驗證表」（每個根因 × 證據 × 支持度 0-3 分）
│       └── 結果存入 Step6Data.causal_verification
├── POST /api/chat (mode='guided_analysis')
│   ├── 根據 stage 動態切換 system prompt
│   └── 自動注入 Step 4 數據作為上下文
├── Step6Form 更新
│   ├── 新增「AI 因果探勘」tab
│   ├── 三階段進度指示器（1/3 → 2/3 → 3/3）
│   ├── 因果驗證表格 UI（證據、支持度）
│   └── 「將 AI 分析結果匯入主表單」按鈕
└── 3 套 guided_analysis system prompt
    ├── stage1_pareto_analysis.ts
    ├── stage2_five_why_master.ts
    └── stage3_causal_verification.ts

Week 2 — 對策壓力測試迴圈（Step 7 引導式 AI）：
├── lib/iqcc/pressure-test.ts
│   ├── 迴圈流程：提案(Propose) → 驗證(Verify) → 修正(Correct)
│   ├── Verify 階段 AI 角色切換：
│   │   ├── 「IMO 級驗證官」— 找嚴重錯誤與細節缺陷
│   │   ├── 「護理師視角」— 臨床執行可行性
│   │   ├── 「法務視角」— 合規與責任風險
│   │   └── 「病患/家屬視角」— 使用者體驗與接受度
│   ├── 每輪生成結構化「風險與缺陷報告」
│   ├── 團隊決定：修正方案（繼續迴圈）或 關閉迴圈（方案定案）
│   └── 結果存入 Step7Data.pressure_test[]
├── POST /api/chat (mode='pressure_test')
│   ├── 根據迴圈輪次 + 角色動態組裝 prompt
│   └── 自動注入 Step 6 根因 + Step 7 對策內容
├── Step7Form 更新
│   ├── 新增「壓力測試」tab
│   ├── 迴圈輪次紀錄列表（Round 1, 2, 3...）
│   ├── 每輪：AI 風險報告 + 團隊修正紀錄
│   └── 「關閉迴圈，確認定案」按鈕
└── 4+ 套 pressure_test system prompt
    ├── verifier_imo.ts
    ├── verifier_nurse.ts
    ├── verifier_legal.ts
    └── verifier_patient.ts

Week 2.5 — AI 報告生成 + 背景掃描：
├── lib/iqcc/report-generation.ts
│   ├── Step 4: 現況分析整合報告（數據敘事 + 主題歸納）
│   ├── Step 9: 成效比較報告（前後對比 + 改善率 + 摘要描述）
│   └── Step 10: 一文多用（SOP + 查核表 + FAQ 批量生成）
├── lib/iqcc/background-scan.ts
│   ├── Step 2: 主題背景掃描（重要性、常見挑戰）
│   └── Step 5: 外部對標（文獻參考區間 + 目標分解建議）
├── POST /api/chat (mode='report_generation' | 'background_scan')
├── 對應步驟表單 UI 更新
│   ├── Step 4: 「AI 生成現況報告」按鈕
│   ├── Step 9: 「AI 生成成效報告」按鈕
│   ├── Step 10: 「AI 批量生成文件」按鈕（選擇要生成的類型）
│   ├── Step 2: 「AI 背景掃描」按鈕
│   └── Step 5: 「AI 外部對標」按鈕
└── 5 套 report/scan system prompt
```

### Agent-AI：AI 強化（2 週）

```
Week 1：
├── POST /api/projects/:id/steps/:n/ai-draft
│   ├── 依現有專案數據 + 步驟 context → 產生該步驟完整草稿
│   ├── 回傳結構化 JSON（對應 StepNData 型別）
│   └── streaming response
├── 前端「AI 幫我填」按鈕
│   ├── 點擊 → 呼叫 ai-draft API
│   ├── streaming 填入各欄位
│   ├── AI 填入期間暫停自動儲存
│   ├── 填入完成 → 觸發一次完整儲存
│   └── AI 產生的欄位背景變淺藍色
├── Step.ai_draft_fields JSONB 更新
│   └── 記錄哪些欄位是 AI 產生、是否已確認
└── 同仁編輯 AI 欄位後 → 背景變白 → 標記 confirmed

Week 2：
├── AI 健康度建議（專案總覽頁右側）
│   ├── GET /api/projects/:id/health
│   ├── 分析所有步驟 status + data
│   ├── 友善教練語氣建議（可收合）
│   └── 每條建議附「要我幫你處理嗎？」按鈕
└── 各步驟 AI 進場時機優化
    ├── 空白步驟 → AI 主動詢問「需要幫你產生草稿嗎？」
    ├── 步驟四上傳 CSV → AI 自動分析 + 產生描述
    └── 步驟九完成 → AI 提示「要我幫你填步驟十的檢討嗎？」
```

### Agent-VIZ：互動圖表（2 週）

```
Week 1：
├── FishboneChart.tsx — 魚骨圖互動編輯器
│   ├── ECharts custom series 或 SVG 繪製
│   ├── 5M1E 預設大骨
│   ├── 點擊大骨 → 新增小要因
│   ├── 拖拽調整位置
│   ├── 雙擊編輯文字
│   ├── 真因標記（紅色高亮）
│   └── 數據結構不變（main_categories JSON）
└── 替換 Step6Form 的樹狀列表為 FishboneChart

Week 2：
├── GanttChart.tsx — 甘特圖
│   ├── ECharts bar 橫向
│   ├── 虛線 = 預定、實線 = 實際
│   ├── 時間軸自動計算
│   └── 嵌入 Step3Form
├── chart_config 持久化
│   ├── Step.data.chart_config 儲存自訂設定
│   ├── 標題覆寫、顏色主題、數據標籤開關
│   └── 載入時套用、修改後自動儲存
└── 評價矩陣完整版（Step2Form, Step7Form）
    ├── 每位圈員各別打分 UI
    ├── 自動加總 + 排名
    └── 向下相容圈長代填版數據
```

### Agent-COA：輔導 + 資安 + 研究匯出（2.5 週）

```
Week 1 — 輔導機制：
├── 輔導紀錄 API
│   ├── GET/POST /api/projects/:id/coaching
│   ├── PUT /api/coaching/:cid
│   └── PUT /api/coaching/:cid/suggestions/:sid
├── /project/[id]/coaching/page.tsx
│   ├── 輔導紀錄時間軸
│   ├── 新增紀錄（日期 + 老師 + 逐條建議）
│   ├── 建議可選擇關聯步驟（選填）
│   └── 追蹤狀態（待處理/已完成，選填）
├── 通知機制
│   ├── Notification API（GET/PUT read status）
│   ├── Header NotificationBell 元件（小紅點 + 下拉清單）
│   └── 新增輔導建議 → 自動通知圈隊成員
├── 一鍵輔導摘要
│   ├── POST /api/projects/:id/export/coaching-summary
│   └── 自動彙整：已完成步驟 + 目前進展 + 待討論事項 + 圖表
└── 管理員月會匯出
    ├── POST /api/admin/export/monthly
    └── 全院進度總表 PDF/Excel

Week 2 — 資安 + UX：
├── lib/csv-sanitizer.ts — CSV 白名單欄位過濾
│   ├── 掃描欄位名稱 → 標記疑似個資欄位
│   ├── 只提取統計欄位（時間、類別、次數）
│   ├── 前端預覽：「以下欄位將被送至分析，其餘將移除」
│   └── 管理員可設定白名單規則
├── lib/pii-filter.ts — 固定格式攔截
│   ├── 身分證字號、病歷號、電話、Email
│   ├── API middleware 自動套用
│   └── 偵測到 → 攔截 + 前端黃色提示
├── 精簡/完整模式切換
│   ├── Step.view_mode 欄位（quick/full）
│   ├── 精簡模式只顯示核心欄位
│   ├── 切換按鈕 + 模式記憶
│   └── 精簡模式填過的內容在完整模式中保留
└── UI 提醒強化
    ├── CSV 上傳頁「安全提醒」卡片
    └── AI 輸入框常駐提醒文字

Week 2.5 — ★ 研究數據匯出：
├── GET /api/projects/:id/research-export
│   ├── 匯出格式：JSON + CSV
│   ├── 內容：
│   │   ├── 各步驟 created_at / updated_at（時間戳序列）
│   │   ├── AI 互動紀錄統計（輪次、token 數、mode 分布）
│   │   ├── 因果驗證表（Step 6 causal_verification）
│   │   ├── 壓力測試紀錄（Step 7 pressure_test rounds）
│   │   └── 步驟完成度序列
│   ├── 匿名化：移除使用者真名，僅保留角色
│   └── 可選：匿名化完整報告 PDF（供盲性專家評分）
├── /admin/research/page.tsx（管理員研究數據頁面）
│   ├── 選擇專案 → 預覽匯出內容
│   └── 下載 JSON / CSV / 匿名 PDF
└── 研究數據 API 權限
    └── 僅 sys_admin 可存取
```

## Phase 2 時程甘特圖

```
        Week 1       Week 2       Week 3       Week 4       Week 5
        ──────────── ──────────── ──────────── ──────────── ────────
Agent-QCF████████████ ████████████ ██████
         三階段因果    壓力測試      報告生成
         探勘法        迴圈         背景掃描

Agent-AI ████████████ ████████████
         AI 幫我填     健康度建議
         草稿標記      進場時機

Agent-VIZ████████████ ████████████
         魚骨圖編輯器  甘特圖
                      chart_config
                      評價矩陣完整版

Agent-COA████████████ ████████████ ██████
         輔導紀錄      資安+UX      研究數據
         通知機制      PII 攔截     匯出 API

                                   ████████████
                                   整合測試 +
                                   Phase 2 上線

                                                ✅ Phase 2
                                                上線
                                                （iQCC 研究可啟動）
```

**Agent-QCF 是 Phase 2 關鍵路徑。** 其他三個 Agent 與 Phase 1 原計畫大致相同。
**Phase 2 上線後，系統即可作為 iQCC 實證研究的實驗組工具。**

---

# Phase 3 — 醫院治理（Phase 2 上線後 3~4 週）

> **目標：從「單圈工具」升級為「全院品管治理平台」。**
> 需要累積足夠的完成專案數據才有意義，因此放在最後。

## Phase 3 功能範圍

| 功能群 | 內容 | 價值 |
|--------|------|------|
| **知識庫** | 歷年專案瀏覽/搜尋、真因庫、對策庫 | 經驗傳承，後人不重新發明輪子 |
| **評鑑報告** | 年度成果摘要、指標改善對照表 | 直接拿去 JCI/醫院評鑑 |
| **數據一致性** | upstream_snapshot + hash 比對 | 防止數據邏輯斷裂 |
| **持續改善** | SOP 追蹤、3/6/12 月追蹤回填、延續型專案 | PDCA 閉環 |
| **LLM 彈性** | LLM Adapter（支援地端模型） | Air-gapped 醫院需求 |
| **趨勢分析** | 年度趨勢圖、科別熱力圖、主題詞雲 | 醫院高層決策 |
| **效益量化** | 效益填報、全院彙總、AI 推估 | 證明品管圈活動的投資回報 |
| **進階匯出** | PPT 簡報、成果發表海報 | 成果發表會用 |

## Phase 3 Agent 並行規劃

```
Agent-KB     知識庫        全院知識庫 + 搜尋 + 真因/對策庫
Agent-RPT    報告 + 趨勢   評鑑報告 + 年度統計 + 熱力圖
Agent-INT    數據一致性     snapshot + hash + 持續追蹤 + LLM Adapter
Agent-EXP    進階匯出 + 效益  PPT + 海報 + 效益量化
```

### Agent-KB：知識庫（2 週）

```
Week 1：
├── 專案公開機制
│   ├── PUT /api/admin/projects/:id/public — 標記知識庫公開
│   ├── 去識別化邏輯（移除圈員真名，僅保留職稱）
│   └── 公開專案唯讀瀏覽頁面
├── GET /api/knowledge/search
│   ├── PostgreSQL 全文搜尋（pg_trgm）
│   ├── 依科別、主題分類篩選
│   └── 回傳匹配專案列表 + 摘要
└── /admin/knowledge/page.tsx — 知識庫管理頁面

Week 2：
├── GET /api/knowledge/root-causes
│   ├── 從已完成專案的步驟六 JSONB 聚合
│   ├── 依主題分類歸類常見真因
│   └── 顯示出現頻率
├── GET /api/knowledge/countermeasures
│   ├── 從步驟七+九聚合有效對策
│   ├── 依改善幅度排序
│   └── 顯示成功案例連結
└── AI 步驟六/七 system prompt 整合
    ├── 做魚骨圖時 → AI 參考歷年真因庫
    └── 擬對策時 → AI 推薦歷年有效對策
```

### Agent-RPT：報告 + 趨勢（2 週）

```
Week 1：
├── POST /api/admin/export/annual-report — 年度成果摘要 PDF
│   ├── 自動彙整全院 KPI（從 Project 表 denormalized 欄位）
│   ├── 圈隊數、完成率、平均改善幅度、達成率
│   ├── 改善主題分布圖（ECharts pie/bar）
│   └── 代表圈隊精選（is_featured）
├── PUT /api/admin/projects/:id/featured — 標記代表圈隊
└── /admin/reports/page.tsx — 評鑑報告頁面
    ├── 選擇年度範圍
    ├── 預覽摘要數據
    └── 一鍵匯出 PDF

Week 2：
├── GET /api/admin/analytics/trends — 逐年趨勢數據
│   └── 年度 × 圈隊數/完成率/改善幅度折線圖
├── GET /api/admin/analytics/department-heatmap — 科別熱力圖
│   └── 科別 × 年度 × 圈隊數/改善幅度 矩陣
├── /admin/analytics/page.tsx — 趨勢分析頁面
│   ├── 趨勢折線圖
│   ├── 科別熱力圖
│   └── 改善主題詞雲（簡版：依 topic_category 聚合）
└── 管理員儀表板增加年度統計區塊
```

### Agent-INT：數據一致性 + 基礎設施（2 週）

```
Week 1：
├── upstream_snapshot 機制
│   ├── 步驟五/九標記完成 → 快照上游核心數據
│   ├── data_hash（MD5）計算
│   ├── 上游修改時比對 hash
│   ├── hash 相同 → 不提示
│   └── hash 不同 → 「上游核心數據已更新」提示 + 重新同步按鈕
├── lib/step-linking.ts 重構
│   ├── 核心數據欄位定義（per step）
│   ├── hash 計算邏輯
│   └── snapshot 凍結/更新邏輯
└── 步驟間連動 UI 更新

Week 2：
├── lib/llm-adapter.ts — LLM 抽象層
│   ├── interface LLMAdapter { chat, estimateTokens }
│   ├── ClaudeAdapter（提取現有 claude.ts 邏輯）
│   ├── OllamaAdapter（Ollama REST API）
│   ├── VLLMAdapter（OpenAI-compatible API）
│   └── LLM_PROVIDER 環境變數切換
├── 持續改善追蹤
│   ├── FollowUp API（GET/PUT）
│   ├── 專案完成時自動建立 3/6/12 月追蹤排程
│   ├── /project/[id]/follow-up/page.tsx — 追蹤回填頁面
│   └── 到期提醒 → Notification
└── 延續型專案
    ├── POST /api/projects/:id/continue — 一鍵建立延續專案
    ├── 自動帶入原專案的改善後數據作為新專案的改善前基準
    └── Project.continuation_of 關聯
```

### Agent-EXP：進階匯出 + 效益（1.5 週）

```
Week 1：
├── PPT 簡報匯出
│   ├── pptxgenjs
│   ├── 成果發表用（關鍵圖表 + 摘要文字）
│   ├── POST /api/projects/:id/export/ppt
│   └── 投影片模板（封面 + 十步驟各一頁 + 感謝頁）
├── 效益填報
│   ├── ProjectBenefit API（GET/PUT）
│   ├── Step10Form 增加效益區塊（選填）
│   └── 效益類型選擇 + 描述 + 量化數值
└── 全院效益彙總
    ├── GET /api/admin/analytics/benefits
    ├── 依類型彙總（時間節省、成本節省、品質提升）
    └── 納入年度報告

Week 1.5：
├── 成果發表海報（A0/A1）
│   ├── 海報 HTML 模板
│   ├── Browserless 渲染 → 高解析度 PDF
│   └── POST /api/projects/:id/export/poster
└── 報告範本自訂
    ├── /admin/report-settings/page.tsx
    ├── 院徽、頁首頁尾文字
    ├── 步驟呈現順序調整
    └── 儲存為全院範本
```

## Phase 3 時程甘特圖

```
        Week 1       Week 2       Week 3       Week 4
        ──────────── ──────────── ──────────── ────────
Agent-KB ████████████ ████████████
         專案公開      真因/對策庫
         搜尋功能      AI 整合

Agent-RPT████████████ ████████████
         年度報告      趨勢分析
         代表圈隊      熱力圖

Agent-INT████████████ ████████████
         snapshot     LLM Adapter
         hash 比對     追蹤+延續

Agent-EXP████████████ ██████
         PPT+效益      海報+範本

                                   ████████████
                                   整合測試 +
                                   Phase 3 上線

                                                ✅ Phase 3
                                                上線
```

---

# 全局時程總覽

```
Month 1              Month 2              Month 3              Month 4
──────────────────── ──────────────────── ──────────────────── ──────────

Phase 1 — MVP
████████████████████ ██████
地基 → 4 Agent 並行 → 匯出+收尾
                          ↓
                      ✅ MVP 上線
                      （同仁開始使用）

                          Phase 2 — 強化 + iQCC
                          ████████████████████ ██████
                          5 Agent 並行 → 整合
                          Agent-QCF 為關鍵新增
                                                    ↓
                                                ✅ Phase 2 上線
                                                （iQCC 研究可啟動）

                                                    Phase 3 — 治理
                                                    ████████████████
                                                    4 Agent 並行 →
                                                                 ↓
Month 5                                                      ✅ Phase 3
────────                                                     上線
████████
整合 + 上線

總計：約 14~17 週（3.5~4.5 個月）
```

## 各階段 Agent 數量

| 階段 | 最大並行 Agent 數 | 瓶頸 |
|------|:---:|------|
| Phase 1 Sprint 0 | 1 | 地基必須先完成 |
| Phase 1 Sprint 1~3 | **4** | Agent-A, S, C, I 同時 |
| Phase 1 Sprint 4 | 2 | Agent-E, D 同時（等 S+C 完成） |
| Phase 2 | **4** | QCF, AI, VIZ, COA 同時（QCF 為關鍵路徑） |
| Phase 3 | **4** | KB, RPT, INT, EXP 無依賴 |

---

# iQCC 研究時程對照

> 以下為 iQCC 實證研究計畫與系統開發的時程對照。
> 研究計畫詳見 `docs/導入智慧品質圈 (iQCC) 框架...混合方法實證研究計畫.md`

```
系統開發                              iQCC 研究
──────────────────────────────────── ────────────────────────
Month 1~2: Phase 1 MVP 開發
Month 2~4: Phase 2 開發（含 iQCC）
                                     Month 4: 研究準備期
                                       - 團隊招募、配對分派
                                       - IRB 審查
                                       - AI-QCF = 系統本身（不需人員訓練）
Month 4~5: Phase 3 開發
                                     Month 5~7: 規劃分析期
                                       - 實驗組用 QCChelper（Phase 2 功能）
                                       - 對照組用傳統手動流程
                                       - [前測] 期中報告 → 專家評分
                                     Month 8~10: 對策實施期
                                     Month 11~12: 效果確認 + 結案
                                       - [後測] 最終報告 → 專家評分
                                       - 問卷施測（外部工具）
                                       - 質性訪談
                                       - 研究數據匯出（系統 API）
```

**關鍵：Phase 2 必須在研究啟動前完成。** Phase 3 可與研究並行開發。
