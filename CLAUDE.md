# QCC Helper — Claude 開發記憶

> 本檔案是 Claude Agent 的**專案記憶**。每次 session 啟動時讀取此檔，快速掌握專案全貌。
> 最後更新：2026-03-18

---

## 專案狀態

| 項目 | 狀態 |
|------|------|
| **當前階段** | Phase 1 — MVP（尚未開始實作） |
| **已完成** | 需求規格書、三階段開發計畫 |
| **下一步** | Sprint 0 — 地基建設 |
| **程式碼** | 零（僅文件，尚無 src/、package.json、prisma/ 等） |

### 已存在的檔案（僅 3 個）

```
CLAUDE.md                     ← 本檔案（Agent 記憶）
docs/requirements.md          ← 完整需求規格（2171 行，§1~§10）
docs/plan.md                  ← 三階段並行開發計畫
```

### 尚不存在的檔案（需在 Sprint 0 建立）

```
package.json, tsconfig.json, next.config.mjs, tailwind.config.ts
.env.example, .gitignore, Dockerfile
docker-compose.yml, docker-compose.dev.yml, nginx/default.conf
prisma/schema.prisma, prisma/seed.ts
src/ (所有程式碼)
```

---

## 專案簡介

醫院品管圈（QCC）協助工具。同仁填寫十大步驟表單 → CSV 上傳數據分析 → AI 輔助 → 匯出 PDF 報告。

**設計理念：系統是來幫忙的，不是來考試的。**

---

## 關鍵文件索引

| 文件 | 用途 | 何時查閱 |
|------|------|---------|
| `docs/requirements.md` §3 | 十步驟表單欄位 + 功能需求 | 開發任何步驟表單時 |
| `docs/requirements.md` §6.2 | 17 張資料表欄位定義 | 寫 Prisma schema 或 API 時 |
| `docs/requirements.md` §6.3 | Step.data JSONB 結構（Step 1~10） | 寫 Zod schema 或表單時 |
| `docs/requirements.md` §8 | API Routes 完整定義 | 寫後端 API 時 |
| `docs/requirements.md` §10.3 | 環境變數清單 | 寫 .env.example 時 |
| `docs/requirements.md` §10.4 | AI system prompt 設計原則 | 寫 AI 對話 prompt 時 |
| `docs/plan.md` | Agent 並行開發計畫 + 三階段規劃 | 規劃工作分配時 |

---

## 技術棧

| 層 | 技術 | 備註 |
|----|------|------|
| Frontend | Next.js 14+ (App Router) + TypeScript strict + Tailwind CSS | |
| Backend | Next.js API Routes | |
| Database | PostgreSQL 16 (Docker) | pg_trgm + 全文搜尋（Phase 3 知識庫用） |
| ORM | Prisma | schema-first, 自動 migration |
| AI | `@anthropic-ai/sdk` 直接呼叫（MVP） | Phase 3 才做 LLM Adapter |
| Charts | ECharts | 柏拉圖、雷達圖（MVP）；魚骨圖、甘特圖（Phase 2） |
| File Upload | 本地 `/uploads` 目錄 | Docker volume 掛載 |
| PDF Export | Browserless/chrome 容器 → HTML→PDF | 自帶中文字型 |
| Deployment | Docker Compose（app + db + nginx + browserless） | |

---

## 資料模型速查

17 張表，完整欄位見 `requirements.md` §6.2。

### 核心表

| 表 | 用途 | 關鍵設計 |
|----|------|---------|
| **User** | 帳號 | role: `team_rep` / `qcc_admin` / `sys_admin` |
| **UserCircle** | 帳號↔專案 多對多 | member_role: `leader` / `member` |
| **Project** | 專案 | KPI 欄位 denormalization（current_rate, target_rate, post_rate, improvement_rate, goal_achievement_rate） |
| **Member** | 圈員名單 | role: `leader` / `member` / `advisor` |
| **Step** | 步驟資料 | `data` JSONB（§6.3）+ `ai_draft_fields` JSONB + `view_mode` + `upstream_snapshot` |
| **Upload** | 上傳檔案 | purpose: `data` / `attachment` / `alternative` |
| **ChatHistory** | AI 對話紀錄 | 綁定 project + step_number |

### 輔助表

| 表 | 用途 |
|----|------|
| Reference | 參考文獻 |
| CoachingRecord / CoachingSuggestion | 輔導紀錄（Phase 2） |
| DiscussionItem | 待討論事項 |
| StepChangeLog | 步驟異動紀錄 |
| ProjectTemplate | 專案範本（Phase 2+） |
| SystemSetting | 系統設定 key-value |
| ProjectBenefit | 效益填報（Phase 3） |
| FollowUp | 3/6/12 月追蹤（Phase 3） |
| Notification | 通知（Phase 2） |

### KPI 同步規則（重要）

- 步驟四儲存 → `Project.current_rate` = `step4.data.current_rate`
- 步驟五儲存 → `Project.target_rate` = `step5.data.target_value`
- 步驟九儲存 → `Project.post_rate` + `improvement_rate` + `goal_achievement_rate`

---

## 品管圈十大步驟

| # | 步驟 | MVP 表單 | 主要圖表 | Step.data 結構見 |
|---|------|----------|----------|-----------------|
| 1 | 組圈 | 圈員名單 + 圈徽上傳 | — | §6.3 Step 1 |
| 2 | 主題選定 | 候選主題 + 評價矩陣（圈長代填版） | 評價表 | §6.3 Step 2 |
| 3 | 活動計畫 | 時程表格（純表單，MVP 不做甘特圖） | — | §6.3 Step 3 |
| 4 | 現況把握 | CSV 上傳 → 統計 → **柏拉圖** → KPI 同步 | **柏拉圖（改善前）** | §6.3 Step 4 |
| 5 | 目標設定 | 自動帶入步驟四 current_rate | 目標對照表 | §6.3 Step 5 |
| 6 | 解析 | 5M1E 樹狀列表（MVP）→ 魚骨圖（Phase 2） | 樹狀列表 | §6.3 Step 6 |
| 7 | 對策擬定 | 5W1H + 評價矩陣（圈長代填版） | 對策評價表 | §6.3 Step 7 |
| 8 | 對策實施 | 進度表格 + 照片上傳 | 進度表 | §6.3 Step 8 |
| 9 | 效果確認 | CSV → 前後對比 → **柏拉圖** + 雷達圖 → KPI 同步 | **柏拉圖（改善後）**、雷達圖 | §6.3 Step 9 |
| 10 | 標準化 | SOP + 檢討 | — | §6.3 Step 10 |

---

## MVP 範圍邊界（Phase 1）

### 做

- 十步驟表單能填能存（自動儲存 debounce 3s）
- 步驟自由跳轉，不鎖流程
- CSV 上傳 → stream 解析 → 柏拉圖 + 雷達圖
- AI 對話（streaming），每步驟專屬 system prompt
- PDF 報告匯出（缺漏欄位顯示「待補充」）
- 基本登入（JWT + httpOnly cookie）+ 三角色
- 管理員儀表板（進度一覽 + 卡關預警）
- 帳號管理（管理員建帳號，不做自助註冊）

### 不做（Phase 2/3）

- ~~AI 幫我填（草稿自動填入）~~ → Phase 2
- ~~魚骨圖互動編輯器~~ → Phase 2（MVP 用樹狀列表）
- ~~甘特圖~~ → Phase 2（MVP 用純文字時程表）
- ~~精簡/完整模式切換~~ → Phase 2
- ~~通知系統~~ → Phase 2
- ~~CSV 白名單過濾 + PII 攔截~~ → Phase 2（MVP 只加 UI 文字提醒）
- ~~LLM Adapter 抽象層~~ → Phase 3（MVP 直接呼叫 Claude）
- ~~upstream_snapshot + hash 比對~~ → Phase 3
- ~~知識庫、評鑑報告、趨勢分析~~ → Phase 3
- ~~PPT / 海報匯出~~ → Phase 3
- ~~效益量化、追蹤回填~~ → Phase 3

---

## Agent 團隊與分工（Phase 1）

```
Sprint 0（Week 1）：Agent-F 獨跑
  → 地基：Next.js + Prisma 17 表 + Docker + Layout + Types + Zod + Spike

Sprint 1~3（Week 2~3）：4 Agent 並行
  → Agent-A  後端 API（Auth, Project, Step, Upload, Analyze, Admin）
  → Agent-S  前端表單（Step1~10 + 自動儲存 + 專案頁面 + 登入頁）
  → Agent-C  圖表元件（ParetoChart, RadarChart — mock data 獨立開發）
  → Agent-I  AI 對話（claude.ts + POST /api/chat + AgentChat.tsx + 10 套 prompt）

Sprint 4（Week 4~5）：2 Agent 並行
  → Agent-E  PDF 匯出（Browserless + 報告 HTML + Export API）
  → Agent-D  管理員儀表板 + 收尾整合 + 部署
```

關鍵路徑：`Agent-F → Agent-S → Agent-E → Agent-D`

---

## 開發規範

### 程式碼風格
- TypeScript strict mode
- Functional component + hooks
- 檔名：PascalCase（元件）、camelCase（工具函式）
- **全介面繁體中文**，程式碼變數名與註解用英文

### 資安紅線（不可違反）
1. **AI 絕對不傳原始逐筆數據** — 只傳聚合後的統計摘要
2. **CSV 必須 stream pipeline** — `fast-csv` + `pipeline`，禁止一次載入全檔，上限 50,000 行
3. **不儲存病患個資** — 僅處理匿名化統計數據
4. MVP 階段：CSV 上傳頁 + AI 輸入框加灰色文字提醒即可
5. Phase 2 才做 `csv-sanitizer.ts`（白名單過濾）和 `pii-filter.ts`（固定格式攔截）

### UX 鐵律（不可違反）
1. **不阻擋** — 缺漏欄位用藍色提示，不用紅色錯誤阻擋提交
2. **自由跳步** — 十步驟任意順序，不鎖流程
3. **自動儲存** — debounce 3 秒 + 儲存狀態指示器（已儲存/儲存中/未儲存）
4. **匯出不阻擋** — 缺漏顯示「（待補充）」
5. **手動修改值不被覆蓋** — 步驟間帶入為柔性，使用者編輯過的欄位不自動覆蓋

### 圖表規格
- **柏拉圖**：ECharts bar+line 複合，X 軸由高到低（「其他」放最末），左 Y 軸次數，右 Y 軸累積%，80% 線，累積起始值 = 0%
- **雷達圖**：ECharts radar，改善前虛線 vs 改善後實線
- **魚骨圖**（Phase 2）：ECharts/SVG，預設 5M1E
- **甘特圖**（Phase 2）：ECharts bar 橫向，虛線=預定 / 實線=實際

### API 設計慣例
- RESTful：`/api/projects/:id/steps/:n`
- 回傳格式：`{ success: boolean, data?: T, error?: string }`
- 錯誤碼：400 驗證錯誤、401 未登入、403 無權限、404 不存在、500 伺服器錯誤
- Step API 回傳包含 completeness 資訊（已填 X / 共 Y 欄位）

---

## 專案結構（目標）

```
/
├── CLAUDE.md                       ← 本檔案
├── docs/
│   ├── requirements.md             ← 完整需求規格
│   └── plan.md                     ← 三階段並行開發計畫
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # 首頁（專案列表）
│   │   ├── login/page.tsx
│   │   ├── project/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # 專案總覽（十步驟進度條）
│   │   │       ├── step/[n]/page.tsx  # 步驟表單
│   │   │       ├── export/page.tsx
│   │   │       └── export/render/page.tsx  # PDF 用隱藏頁面
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── users/page.tsx
│   │   └── api/
│   │       ├── auth/               # login, logout, me
│   │       ├── projects/           # CRUD + steps + uploads
│   │       ├── analyze/            # csv, pareto, target, effectiveness
│   │       ├── chat/               # AI streaming
│   │       ├── admin/              # dashboard, users
│   │       └── export/             # PDF
│   ├── components/
│   │   ├── layout/                 # Sidebar, Header
│   │   ├── steps/                  # Step1Form ~ Step10Form
│   │   ├── charts/                 # ParetoChart, RadarChart
│   │   ├── chat/                   # AgentChat
│   │   └── ui/                     # Button, Input, Card, Modal, Toast...
│   ├── lib/
│   │   ├── prisma.ts               # Prisma Client singleton
│   │   ├── auth.ts                 # JWT + cookie + middleware
│   │   ├── claude.ts               # @anthropic-ai/sdk 封裝（MVP 直呼叫）
│   │   ├── csv-parser.ts           # fast-csv stream pipeline
│   │   ├── chart-data.ts           # sortPareto, calculateImprovement
│   │   ├── step-schemas.ts         # Zod schema（Step1Data ~ Step10Data）
│   │   └── export.ts               # Browserless PDF
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma               # 17 張表
│   └── seed.ts                     # sys_admin + demo project
├── public/uploads/
├── docker-compose.yml              # prod: app + db + nginx + browserless
├── docker-compose.dev.yml          # dev: hot reload
├── Dockerfile
├── nginx/default.conf
└── .env.example
```

---

## 環境變數（完整清單見 requirements.md §10.3）

```env
# Database
DATABASE_URL=postgresql://qcc:qcc_password@localhost:5432/qcc_helper

# Auth
JWT_SECRET=<min-32-chars>
SESSION_TIMEOUT_HOURS=8

# AI (MVP: 直接呼叫 Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxx
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# PDF Export
BROWSERLESS_URL=http://qcc-browserless:3000

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE_MB=10
CSV_MAX_ROWS=50000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 常用指令

```bash
# 開發
npm run dev                  # 開發伺服器（需先啟動 PostgreSQL）
npm run build                # 生產建置
npm run lint                 # ESLint
npm run type-check           # TypeScript 型別檢查

# Prisma
npx prisma migrate dev       # 執行 migration
npx prisma generate          # 重新生成 Client
npx prisma studio            # 資料庫 GUI
npx prisma db seed           # 種子資料

# Docker
docker compose up -d                              # 啟動全部服務
docker compose -f docker-compose.dev.yml up       # 開發模式
docker compose down                                # 停止
docker compose logs -f qcc-app                     # 看日誌
docker exec -it qcc-db psql -U qcc -d qcc_helper  # 資料庫 CLI
```

---

## 注意事項

- **醫院內部工具** — 不外洩資料到不可控第三方
- **共用 Docker Host** — 本專案與 CQI365 Hospital 共用同一台主機和 PostgreSQL（不同 database），見 requirements.md §5.3
- **Step.data JSONB** — 每步驟的結構不同，Zod schema 是唯一的 source of truth
- **Step UNIQUE constraint** — `(project_id, step_number)` 保證每專案每步驟只有一筆
- **評價矩陣** — MVP 用圈長代填版（一人填分），Phase 2 改為每位圈員各別打分
- **魚骨圖** — MVP 用樹狀列表 UI（數據結構相同 = main_categories JSON），Phase 2 才做互動圖
