# QCC Helper — 醫院品管圈協助工具

## 專案簡介

QCC Helper 協助醫院同仁執行品管圈（Quality Control Circle）活動。提供步驟式引導介面，讓同仁逐步填寫表單、上傳查檢數據，並透過 AI Agent 協助分析數據、生成圖表、撰寫報告。

## 技術棧

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 (Docker 部署) — 開發與正式環境皆使用 PostgreSQL
- **ORM**: Prisma (schema-first, 自動 migration, TypeScript 型別生成)
- **AI**: Claude API (@anthropic-ai/sdk)
- **Charts**: ECharts (柏拉圖、魚骨圖、甘特圖、雷達圖)
- **File Upload**: 本地 /uploads 目錄 (volume 掛載)
- **Export**: jsPDF (PDF 報告), pptxgenjs (PPT 簡報)
- **Deployment**: Docker Compose (Next.js + PostgreSQL + Nginx 反向代理)

## 專案結構

```
/
├── CLAUDE.md                  # 本檔案
├── docs/
│   └── requirements.md        # 需求規格書
├── src/
│   ├── app/                   # Next.js App Router 頁面
│   │   ├── login/page.tsx     # 登入頁面
│   │   ├── page.tsx           # 首頁 — 專案列表
│   │   ├── project/
│   │   │   ├── new/page.tsx   # 建立新專案（含範本選擇）
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # 專案總覽儀表板（含 AI 健康度）
│   │   │       ├── step/
│   │   │       │   └── [n]/page.tsx  # 步驟表單頁面
│   │   │       ├── coaching/page.tsx # 輔導紀錄
│   │   │       └── export/page.tsx   # 成果匯出
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx    # 管理員儀表板（含一眼總覽卡片）
│   │   │   ├── users/page.tsx        # 帳號管理
│   │   │   ├── settings/page.tsx     # 系統設定
│   │   │   ├── reports/page.tsx      # 評鑑報告產出（年度成果摘要）
│   │   │   └── knowledge/page.tsx    # 全院知識庫（歷年品管圈經驗）
│   │   ├── learn/             # 教學中心
│   │   │   ├── page.tsx       # 教學首頁
│   │   │   └── [topic]/page.tsx  # 各主題教學頁面
│   │   └── api/               # API Routes
│   │       ├── auth/          # 登入/登出/密碼管理
│   │       ├── project/       # 專案 CRUD
│   │       ├── step/          # 步驟資料存取
│   │       ├── upload/        # 檔案上傳
│   │       ├── analyze/       # 數據分析 (CSV 解析、圖表數據)
│   │       ├── chat/          # AI Agent 對話
│   │       ├── search/        # 文獻搜尋
│   │       ├── coaching/      # 輔導紀錄 CRUD
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
│   ├── content/
│   │   └── learn/             # 教學中心靜態內容 (MDX)
│   │       ├── qcc/           # QCC 品管圈教學
│   │       ├── pdca/          # PDCA 循環教學
│   │       ├── hfmea/         # HFMEA 教學
│   │       └── qc7tools/      # 品管七大手法教學
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client 單例 (連線管理)
│   │   ├── auth.ts            # 認證與授權邏輯
│   │   ├── claude.ts          # Claude API 封裝
│   │   ├── csv-parser.ts      # CSV/Excel 解析
│   │   ├── chart-data.ts      # 圖表數據計算 (柏拉圖排序、累積百分比等)
│   │   ├── step-linking.ts    # 步驟間數據連動邏輯
│   │   └── export.ts          # PDF/PPT 匯出邏輯
│   └── types/
│       └── index.ts           # TypeScript 型別定義
├── public/
│   └── uploads/               # 上傳檔案目錄 (開發用)
├── prisma/
│   └── schema.prisma          # Prisma Schema (資料模型定義)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── Dockerfile                 # Next.js 多階段建置
├── docker-compose.yml         # 完整服務編排 (app + db + nginx)
├── docker-compose.dev.yml     # 開發用 (含 hot reload)
├── nginx/
│   └── default.conf           # Nginx 反向代理設定
└── .env.example               # 環境變數範本
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
# 開發
npm run dev          # 啟動開發伺服器 (需先啟動 PostgreSQL)
npm run build        # 建置生產版本
npm run lint         # ESLint 檢查
npm run type-check   # TypeScript 型別檢查

# Prisma
npx prisma migrate dev    # 執行 migration (開發)
npx prisma generate       # 重新生成 Prisma Client
npx prisma studio         # 開啟資料庫 GUI

# Docker
docker compose up -d              # 啟動所有服務 (背景)
docker compose -f docker-compose.dev.yml up  # 開發模式 (含 hot reload)
docker compose down               # 停止所有服務
docker compose logs -f qcc-app    # 查看應用日誌
docker exec -it qcc-db psql -U qcc -d qcc_helper  # 進入資料庫 CLI
```

## 注意事項

- 此為醫院內部工具，注意資料安全，不應外洩任何資料到不可控的第三方
- 上傳的 CSV/Excel 可能包含敏感統計數據，分析完成後僅保留聚合結果
- Claude API 呼叫時不要傳送任何可識別個人的資訊
