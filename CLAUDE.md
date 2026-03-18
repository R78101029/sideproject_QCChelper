# QCC Helper — 醫院品管圈協助工具

## 專案簡介

QCC Helper 協助醫院同仁執行品管圈（Quality Control Circle）活動。提供步驟式引導介面，讓同仁逐步填寫表單、上傳查檢數據，並透過 AI Agent 協助分析數據、生成圖表、撰寫報告。

> **詳細需求規格請見 `docs/requirements.md`**，本檔案為開發快速參考。

## 設計理念（必讀）

> **系統是來幫忙的，不是來考試的。**

- **自由跳步** — 十大步驟可任意順序填寫，不鎖流程
- **提示不阻擋** — 缺漏欄位用溫和提示（藍色「建議填寫」），不用紅色錯誤阻擋
- **AI 主動幫填** — 每個步驟有「AI 幫我填」按鈕，產生草稿填入表單，同仁確認即可。AI 草稿欄位以淺藍背景標記
- **精簡/完整模式** — 預設精簡模式（3~5 核心欄位），可切換完整模式
- **隨時可存可走** — 自動儲存（debounce 3 秒），任何狀態離開都不遺失
- **匯出不阻擋** — 缺漏欄位在報告中顯示「待補充」，不阻擋匯出

## 技術棧

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 (Docker) — pg_trgm + 全文搜尋（知識庫用）
- **ORM**: Prisma (schema-first, 自動 migration, TypeScript 型別生成)
- **AI**: Claude API (@anthropic-ai/sdk) — 對話、分析、草稿產生
- **Charts**: ECharts (柏拉圖、魚骨圖、甘特圖、雷達圖、趨勢圖、熱力圖)
- **File Upload**: 本地 /uploads 目錄 (Docker volume 掛載)
- **Export**: jsPDF (PDF 報告), pptxgenjs (PPT 簡報)
- **Deployment**: Docker Compose (Next.js + PostgreSQL + Nginx 反向代理)

## 專案結構

```
/
├── CLAUDE.md                  # 本檔案（開發快速參考）
├── docs/
│   └── requirements.md        # 需求規格書（完整規格）
├── src/
│   ├── app/                   # Next.js App Router 頁面
│   │   ├── login/page.tsx
│   │   ├── page.tsx           # 首頁 — 專案列表
│   │   ├── project/
│   │   │   ├── new/page.tsx   # 建立新專案（含範本選擇）
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # 專案總覽儀表板（視覺化十步驟進度）
│   │   │       ├── step/
│   │   │       │   └── [n]/page.tsx  # 步驟表單（精簡/完整模式 + AI 幫我填）
│   │   │       ├── coaching/page.tsx # 輔導紀錄
│   │   │       ├── export/page.tsx   # 成果匯出
│   │   │       └── follow-up/page.tsx # 改善後追蹤（3/6/12 個月）
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx    # 管理員儀表板（一眼總覽卡片）
│   │   │   ├── users/page.tsx        # 帳號管理
│   │   │   ├── templates/page.tsx    # 範本管理
│   │   │   ├── reports/page.tsx      # 評鑑報告產出（年度成果摘要）
│   │   │   ├── knowledge/page.tsx    # 全院知識庫
│   │   │   ├── report-settings/page.tsx  # 報告範本設定
│   │   │   ├── coaching/monthly/page.tsx # 月會報告輸出
│   │   │   └── settings/page.tsx     # 系統設定
│   │   ├── learn/             # 教學中心 (MDX)
│   │   │   ├── page.tsx
│   │   │   └── [topic]/page.tsx
│   │   └── api/               # API Routes（詳見 requirements.md §8）
│   │       ├── auth/          # 登入/登出/密碼管理
│   │       ├── project/       # 專案 CRUD
│   │       ├── step/          # 步驟資料存取 + AI 草稿
│   │       ├── upload/        # 檔案上傳
│   │       ├── analyze/       # 數據分析 (CSV 解析、圖表數據)
│   │       ├── chat/          # AI Agent 對話
│   │       ├── search/        # 文獻搜尋
│   │       ├── coaching/      # 輔導紀錄 CRUD
│   │       ├── knowledge/     # 知識庫搜尋、真因庫、對策庫
│   │       ├── admin/         # 管理員（儀表板、評鑑報告、趨勢）
│   │       └── export/        # 報告匯出
│   ├── components/
│   │   ├── layout/            # 共用版面 (Sidebar, Header)
│   │   ├── steps/             # 各步驟表單元件 (Step1Form ~ Step10Form)
│   │   ├── charts/            # 圖表元件 (Pareto, Fishbone, Gantt, Radar)
│   │   ├── chat/              # AI Agent 對話元件
│   │   └── ui/                # 通用 UI 元件
│   ├── content/learn/         # 教學中心 MDX (qcc/pdca/hfmea/qc7tools)
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client 單例
│   │   ├── auth.ts            # 認證與授權
│   │   ├── claude.ts          # Claude API 封裝（含 AI 草稿產生）
│   │   ├── csv-parser.ts      # CSV/Excel 解析
│   │   ├── chart-data.ts      # 圖表數據計算
│   │   ├── step-linking.ts    # 步驟間柔性數據連動
│   │   ├── knowledge.ts       # 知識庫搜尋邏輯
│   │   └── export.ts          # PDF/PPT 匯出
│   └── types/
│       └── index.ts           # TypeScript 型別定義
├── prisma/
│   └── schema.prisma          # 資料模型（16 張表，詳見下方）
├── public/uploads/            # 上傳檔案目錄 (開發用)
├── docker-compose.yml         # 正式環境 (app + db + nginx)
├── docker-compose.dev.yml     # 開發環境 (含 hot reload)
├── Dockerfile                 # Next.js 多階段建置
├── nginx/default.conf         # Nginx 反向代理
└── .env.example               # 環境變數範本
```

## 資料模型概覽

共 16 張表（完整欄位定義見 `requirements.md` §6.2）：

| 表名 | 用途 |
|------|------|
| User | 使用者帳號（team_rep / qcc_admin / sys_admin） |
| UserCircle | 帳號與圈隊多對多關聯 |
| Project | 專案（含 topic_category, is_featured, is_public） |
| Member | 圈員名單 |
| Step | 步驟資料（JSONB data + ai_draft_fields + view_mode） |
| Upload | 上傳檔案 |
| Reference | 參考文獻 |
| CoachingRecord | 輔導紀錄 |
| CoachingSuggestion | 輔導建議子項 |
| DiscussionItem | 待討論事項 |
| ChatHistory | AI 對話紀錄 |
| StepChangeLog | 步驟異動紀錄 |
| ProjectTemplate | 專案範本 |
| SystemSetting | 系統設定 (key-value) |
| ProjectBenefit | 效益填報（選填，支援 AI 推估） |
| FollowUp | 改善後追蹤（3/6/12 個月） |

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
| 10 | 標準化與檢討 | SOP 生成、活動總結、效益填報 | — |

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

### UX 彈性原則
- 步驟完成度僅為「建議欄位 X/Y 已填」提示，**不阻擋**標記完成
- 步驟間數據連動為柔性帶入：有上游數據時自動填入，無則留空
- 同仁手動修改過的值**不會被自動覆蓋**
- AI 草稿一律標記為「AI 草稿」，同仁可一鍵採用、修改或忽略

### AI Agent 整合
- 每個步驟有獨立的 system prompt，包含該步驟的品管圈專業知識
- Agent 對話記錄綁定專案與步驟，可回溯
- Agent 回應需包含結構化數據（如圖表數據）時，使用 JSON 格式回傳
- 「AI 幫我填」產生的草稿存入 Step.ai_draft_fields 追蹤確認狀態
- AI 健康度建議為友善教練語氣，可收合，不主動彈出打斷操作

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
- 本專案與 CQI365 Hospital 共用同一台 Docker Host 和 PostgreSQL（不同 database），詳見 requirements.md §5.3
