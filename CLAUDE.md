# QCC Helper — 醫院品管圈協助工具

## 專案簡介

QCC Helper 協助醫院同仁執行品管圈（Quality Control Circle）活動。提供步驟式引導介面，讓同仁逐步填寫表單、上傳查檢數據，並透過 AI Agent 協助分析數據、生成圖表、撰寫報告。

## 技術棧

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (via better-sqlite3 開發) / Cloudflare D1 (部署)
- **AI**: Claude API (@anthropic-ai/sdk)
- **Charts**: ECharts (柏拉圖、魚骨圖、甘特圖、雷達圖)
- **File Upload**: 本地 /uploads 目錄 (開發) / Cloudflare R2 (部署)
- **Export**: jsPDF (PDF 報告), pptxgenjs (PPT 簡報)

## 專案結構

```
/
├── CLAUDE.md                  # 本檔案
├── docs/
│   └── requirements.md        # 需求規格書
├── src/
│   ├── app/                   # Next.js App Router 頁面
│   │   ├── page.tsx           # 首頁 — 專案列表
│   │   ├── project/
│   │   │   ├── new/page.tsx   # 建立新專案
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # 專案總覽儀表板
│   │   │       ├── step/
│   │   │       │   └── [n]/page.tsx  # 步驟表單頁面
│   │   │       └── export/page.tsx   # 成果匯出
│   │   └── api/               # API Routes
│   │       ├── project/       # 專案 CRUD
│   │       ├── step/          # 步驟資料存取
│   │       ├── upload/        # 檔案上傳
│   │       ├── analyze/       # 數據分析 (CSV 解析、圖表數據)
│   │       ├── chat/          # AI Agent 對話
│   │       └── export/        # 報告匯出
│   ├── components/
│   │   ├── layout/            # 共用版面 (Sidebar, Header)
│   │   ├── steps/             # 各步驟專屬元件
│   │   │   ├── Step1Form.tsx  # 組圈
│   │   │   ├── Step2Form.tsx  # 主題選定
│   │   │   ├── Step3Form.tsx  # 活動計畫
│   │   │   ├── Step4Form.tsx  # 現況把握 (含 CSV 上傳)
│   │   │   ├── Step5Form.tsx  # 目標設定
│   │   │   ├── Step6Form.tsx  # 解析 (含魚骨圖編輯)
│   │   │   ├── Step7Form.tsx  # 對策擬定
│   │   │   ├── Step8Form.tsx  # 對策實施
│   │   │   ├── Step9Form.tsx  # 效果確認 (含 CSV 上傳)
│   │   │   └── Step10Form.tsx # 標準化與檢討
│   │   ├── charts/            # 圖表元件
│   │   │   ├── ParetoChart.tsx    # 柏拉圖
│   │   │   ├── FishboneChart.tsx  # 魚骨圖
│   │   │   ├── GanttChart.tsx     # 甘特圖
│   │   │   └── RadarChart.tsx     # 雷達圖
│   │   ├── chat/              # AI Agent 對話元件
│   │   │   └── AgentChat.tsx
│   │   └── ui/                # 通用 UI 元件
│   ├── lib/
│   │   ├── db.ts              # 資料庫連線與操作
│   │   ├── schema.ts          # 資料表 Schema 定義
│   │   ├── claude.ts          # Claude API 封裝
│   │   ├── csv-parser.ts      # CSV/Excel 解析
│   │   ├── chart-data.ts      # 圖表數據計算 (柏拉圖排序、累積百分比等)
│   │   └── export.ts          # PDF/PPT 匯出邏輯
│   └── types/
│       └── index.ts           # TypeScript 型別定義
├── public/
│   └── uploads/               # 上傳檔案目錄 (開發用)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 品管圈十大步驟對照

| # | 步驟 | 關鍵功能 | 主要圖表 |
|---|------|----------|----------|
| 1 | 組圈 | 圈員名單表單、圈徽上傳 | — |
| 2 | 主題選定 | 評價矩陣自動計分 | 評價表 |
| 3 | 活動計畫擬定 | 時程規劃 | 甘特圖 |
| 4 | 現況把握 | CSV 上傳 → 數據分析 | **柏拉圖（改善前）** |
| 5 | 目標設定 | 自動計算改善目標 | 目標對照表 |
| 6 | 解析 | 互動式要因編輯 | **魚骨圖** |
| 7 | 對策擬定 | 對策評價矩陣計分 | 對策評價表 |
| 8 | 對策實施 | 進度追蹤、照片上傳 | 實施進度表 |
| 9 | 效果確認 | CSV 上傳 → 前後對比 | **柏拉圖（改善後）**、雷達圖 |
| 10 | 標準化與檢討 | SOP 生成、活動總結 | — |

## 開發規範

### 程式碼風格
- 使用 TypeScript strict mode
- 元件使用 functional component + hooks
- 檔名使用 PascalCase (元件) 或 camelCase (工具函式)
- 全介面使用**繁體中文**，程式碼中的變數名與註解使用英文

### 資料處理原則
- 不儲存任何病患個資（PII），僅處理匿名化的統計數據
- CSV 上傳在前端預覽後才送 API 分析
- 所有使用者輸入須經過驗證與清理

### AI Agent 整合
- 每個步驟有獨立的 system prompt，包含該步驟的品管圈專業知識
- Agent 對話記錄綁定專案與步驟，可回溯
- Agent 回應需包含結構化數據（如圖表數據）時，使用 JSON 格式回傳

### 圖表產生
- 柏拉圖：ECharts bar + line 複合圖，X 軸分類由高到低排序（「其他」放最末），左 Y 軸次數，右 Y 軸累積百分比，標示 80% 線，累積百分比起始值為 0%
- 魚骨圖：ECharts custom series 或 SVG 自繪，預設 5M1E 分類（Man/Machine/Material/Method/Measurement/Environment）
- 甘特圖：ECharts bar 橫向堆疊，虛線＝預定進度、實線＝實際進度
- 雷達圖：ECharts radar，改善前（虛線）vs 改善後（實線）雙線疊加
- 改善前後對比：兩張柏拉圖並排顯示

### 常用指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run lint         # ESLint 檢查
npm run type-check   # TypeScript 型別檢查
```

## 注意事項

- 此為醫院內部工具，注意資料安全，不應外洩任何資料到不可控的第三方
- 上傳的 CSV/Excel 可能包含敏感統計數據，分析完成後僅保留聚合結果
- Claude API 呼叫時不要傳送任何可識別個人的資訊
