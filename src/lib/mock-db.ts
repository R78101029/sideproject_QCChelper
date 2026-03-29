// In-memory mock database for testing without PostgreSQL
// Enable by setting MOCK_MODE=true in .env

export const MOCK_MODE = process.env.MOCK_MODE === 'true'

// ─── Demo Data ────────────────────────────────────────────────────

const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000099',
  username: 'demo',
  displayName: '王小明',
  role: 'team_rep' as const,
  department: '護理部',
  email: null,
  isActive: true,
  passwordHash: '$2a$10$demo', // not used in mock mode
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

const ADMIN_USER = {
  id: '00000000-0000-0000-0000-000000000100',
  username: 'admin',
  displayName: '系統管理員',
  role: 'sys_admin' as const,
  department: '資訊室',
  email: null,
  isActive: true,
  passwordHash: '$2a$10$admin',
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

const DEMO_PROJECT = {
  id: '00000000-0000-0000-0000-000000000001',
  name: '降低住院病人跌倒發生率',
  circleName: '安心圈',
  department: '護理部',
  status: 'completed',
  themeType: 'reduction',
  topicCategory: '病人安全',
  periodStart: '2026-01-01',
  periodEnd: '2026-06-30',
  currentRate: 3.2,
  targetRate: 1.8,
  postRate: 1.15,
  improvementRate: 64.1,
  goalAchievementRate: 146.4,
  isFeatured: false,
  isPublic: false,
  createdBy: DEMO_USER.id,
  updatedAt: new Date().toISOString(),
}

const DEMO_STEPS: Record<number, { stepNumber: number; status: string; data: Record<string, unknown>; updatedAt: string }> = {
  1: {
    stepNumber: 1,
    status: 'completed',
    updatedAt: '2026-01-10T00:00:00Z',
    data: {
      circle_name: '安心圈',
      circle_meaning: '讓住院病人安心住院，不再擔心跌倒。',
      department: '護理部',
      period_start: '2026-01-01',
      period_end: '2026-06-30',
      leader: { name: '王小明', title: '護理師' },
      advisor: { name: '陳教授', title: '護理主任' },
      members: [
        { name: '李美麗', title: '護理師', division: '資料收集' },
        { name: '張大華', title: '護理師', division: '對策擬定' },
        { name: '林志偉', title: '護理師', division: '圖表製作' },
        { name: '黃小芬', title: '護理師', division: '文書記錄' },
      ],
      emblem_upload_id: null,
    },
  },
  2: {
    stepNumber: 2,
    status: 'completed',
    updatedAt: '2026-01-20T00:00:00Z',
    data: {
      candidates: [
        { id: 'c1', name: '降低住院病人跌倒發生率', description: '跌倒是住院病人常見事故' },
        { id: 'c2', name: '降低給藥異常率', description: '給藥錯誤影響病人安全' },
        { id: 'c3', name: '提升手部衛生遵從率', description: '感染管控基礎' },
      ],
      criteria: ['上級政策', '重要性', '迫切性', '可行性', '圈能力'],
      scores: [{ member_name: '圈長', ratings: { c1: { '上級政策': 5, '重要性': 5, '迫切性': 4, '可行性': 4, '圈能力': 4 }, c2: { '上級政策': 3, '重要性': 4, '迫切性': 3, '可行性': 3, '圈能力': 3 }, c3: { '上級政策': 4, '重要性': 3, '迫切性': 3, '可行性': 4, '圈能力': 4 } } }],
      totals: { c1: 22, c2: 16, c3: 18 },
      selected_topic: '降低住院病人跌倒發生率',
      selection_reason: '跌倒為本院住院病人安全指標前三名，與上級政策一致且圈員均有相關經驗。',
      metric_definition: '跌倒發生率 = 跌倒人次 / 住院人日 × 1000‰',
    },
  },
  3: {
    stepNumber: 3,
    status: 'completed',
    updatedAt: '2026-02-01T00:00:00Z',
    data: {
      total_weeks: 24,
      meeting_frequency: '每兩週一次',
      schedule: [
        { step_number: 1, step_name: '組圈', responsible: '王小明', planned_start: '2026-01-01', planned_end: '2026-01-10', actual_start: '2026-01-01', actual_end: '2026-01-08' },
        { step_number: 2, step_name: '主題選定', responsible: '王小明', planned_start: '2026-01-11', planned_end: '2026-01-25', actual_start: '2026-01-11', actual_end: '2026-01-20' },
        { step_number: 3, step_name: '活動計畫', responsible: '黃小芬', planned_start: '2026-01-26', planned_end: '2026-02-05', actual_start: '2026-01-26', actual_end: null },
        { step_number: 4, step_name: '現況把握', responsible: '李美麗', planned_start: '2026-02-06', planned_end: '2026-02-28', actual_start: null, actual_end: null },
        { step_number: 5, step_name: '目標設定', responsible: '王小明', planned_start: '2026-03-01', planned_end: '2026-03-07', actual_start: null, actual_end: null },
        { step_number: 6, step_name: '解析', responsible: '張大華', planned_start: '2026-03-08', planned_end: '2026-03-28', actual_start: null, actual_end: null },
        { step_number: 7, step_name: '對策擬定', responsible: '張大華', planned_start: '2026-03-29', planned_end: '2026-04-15', actual_start: null, actual_end: null },
        { step_number: 8, step_name: '對策實施', responsible: '全體', planned_start: '2026-04-16', planned_end: '2026-05-15', actual_start: null, actual_end: null },
        { step_number: 9, step_name: '效果確認', responsible: '林志偉', planned_start: '2026-05-16', planned_end: '2026-06-05', actual_start: null, actual_end: null },
        { step_number: 10, step_name: '標準化', responsible: '黃小芬', planned_start: '2026-06-06', planned_end: '2026-06-30', actual_start: null, actual_end: null },
      ],
    },
  },
  4: {
    stepNumber: 4,
    status: 'completed',
    updatedAt: '2026-02-28T00:00:00Z',
    data: {
      check_period_start: '2026-01-01',
      check_period_end: '2026-01-31',
      total_checks: 500,
      categories: [
        { name: '環境因素', count: 18 },
        { name: '藥物影響', count: 12 },
        { name: '肌力不足', count: 8 },
        { name: '認知障礙', count: 5 },
        { name: '未使用輔具', count: 4 },
        { name: '其他', count: 3 },
      ],
      pareto_sorted: [
        { name: '環境因素', count: 18, cumulative_count: 18, percentage: 36, cumulative_percentage: 36 },
        { name: '藥物影響', count: 12, cumulative_count: 30, percentage: 24, cumulative_percentage: 60 },
        { name: '肌力不足', count: 8, cumulative_count: 38, percentage: 16, cumulative_percentage: 76 },
        { name: '認知障礙', count: 5, cumulative_count: 43, percentage: 10, cumulative_percentage: 86 },
        { name: '未使用輔具', count: 4, cumulative_count: 47, percentage: 8, cumulative_percentage: 94 },
        { name: '其他', count: 3, cumulative_count: 50, percentage: 6, cumulative_percentage: 100 },
      ],
      vital_few: ['環境因素', '藥物影響', '肌力不足'],
      current_rate: 3.2,
      description: '2026年1月共發生50件跌倒事件，跌倒發生率為 3.2‰。前三大原因（環境因素、藥物影響、肌力不足）佔 76%。',
      chart_config: { title_override: null, color_theme: 'default', show_data_labels: true },
    },
  },
  5: {
    stepNumber: 5,
    status: 'completed',
    updatedAt: '2026-03-05T00:00:00Z',
    data: {
      current_value: 3.2,
      improvement_focus_ratio: 0.76,
      circle_capability: 0.7,
      calculation_method: 'formula',
      theme_type: 'reduction',
      target_value: 1.8,
      upstream_snapshot: null,
      reason: '目標值 = 3.2 × (1 - 0.76 × 0.7) = 3.2 × 0.468 = 1.50，考量實際可行性取 1.8‰。',
    },
  },
  6: {
    stepNumber: 6,
    status: 'completed',
    updatedAt: '2026-03-25T00:00:00Z',
    data: {
      fishbone_topic: '住院病人跌倒原因分析',
      main_categories: [
        {
          id: '5m1e-man',
          name: 'Man（人員）',
          medium_causes: [
            {
              id: 'med-m1',
              name: '護理人力不足',
              small_causes: [
                { id: 'sc-m1a', name: '夜班護病比偏高', is_root_cause: true },
                { id: 'sc-m1b', name: '新進人員經驗不足', is_root_cause: false },
              ],
            },
            {
              id: 'med-m2',
              name: '病人自主意識',
              small_causes: [
                { id: 'sc-m2a', name: '病人不按鈴自行下床', is_root_cause: true },
                { id: 'sc-m2b', name: '家屬夜間離院', is_root_cause: false },
              ],
            },
          ],
        },
        {
          id: '5m1e-machine',
          name: 'Machine（設備）',
          medium_causes: [
            {
              id: 'med-mc1',
              name: '病床設備',
              small_causes: [
                { id: 'sc-mc1a', name: '床欄未確實拉起', is_root_cause: true },
                { id: 'sc-mc1b', name: '呼叫鈴位置不當', is_root_cause: false },
              ],
            },
          ],
        },
        {
          id: '5m1e-material',
          name: 'Material（材料）',
          medium_causes: [],
        },
        {
          id: '5m1e-method',
          name: 'Method（方法）',
          medium_causes: [
            {
              id: 'med-mt1',
              name: '評估流程',
              small_causes: [
                { id: 'sc-mt1a', name: '跌倒風險評估表未落實', is_root_cause: true },
                { id: 'sc-mt1b', name: '交班未交接高風險病人', is_root_cause: false },
              ],
            },
          ],
        },
        {
          id: '5m1e-measurement',
          name: 'Measurement（測量）',
          medium_causes: [],
        },
        {
          id: '5m1e-environment',
          name: 'Environment（環境）',
          medium_causes: [
            {
              id: 'med-e1',
              name: '病房環境',
              small_causes: [
                { id: 'sc-e1a', name: '浴室地面濕滑', is_root_cause: true },
                { id: 'sc-e1b', name: '夜間照明不足', is_root_cause: true },
              ],
            },
          ],
        },
      ],
      root_cause_verification: [
        { cause_id: 'sc-m1a', cause_name: '夜班護病比偏高', method: '排班表分析', result: true, evidence: '夜班跌倒佔 62%，護病比 1:12 超過建議值' },
        { cause_id: 'sc-m2a', cause_name: '病人不按鈴自行下床', method: '事件報告分析', result: true, evidence: '78% 跌倒發生在病人自行下床時' },
        { cause_id: 'sc-mc1a', cause_name: '床欄未確實拉起', method: '現場查核', result: true, evidence: '抽查 50 床，12 床（24%）床欄未完全拉起' },
        { cause_id: 'sc-mt1a', cause_name: '跌倒風險評估表未落實', method: '病歷審查', result: true, evidence: '高風險病人僅 65% 有完整評估紀錄' },
        { cause_id: 'sc-e1a', cause_name: '浴室地面濕滑', method: '環境巡查', result: true, evidence: '8 間浴室中 5 間無防滑墊' },
        { cause_id: 'sc-e1b', cause_name: '夜間照明不足', method: '照度測量', result: true, evidence: '走廊夜間照度僅 30 lux，低於建議 50 lux' },
      ],
      confirmed_root_causes: ['sc-m1a', 'sc-m2a', 'sc-mc1a', 'sc-mt1a', 'sc-e1a', 'sc-e1b'],
    },
  },
  7: {
    stepNumber: 7,
    status: 'completed',
    updatedAt: '2026-04-10T00:00:00Z',
    data: {
      countermeasures: [
        { id: 'cm1', root_cause_id: 'sc-m2a', root_cause_name: '病人不按鈴自行下床', what: '導入離床感應器', why: '即時偵測病人離床，縮短護理人員反應時間', who: '李美麗', where: '高風險病房', when: '2026-04-20', how: '高風險病人床位安裝感應墊，連動護理站警示燈' },
        { id: 'cm2', root_cause_id: 'sc-mc1a', root_cause_name: '床欄未確實拉起', what: '床欄查核 + 圖示提醒', why: '提升同仁確實執行床欄的意識', who: '張大華', where: '全病房', when: '2026-04-15', how: '每班交班查核床欄，床頭張貼圖示提醒卡' },
        { id: 'cm3', root_cause_id: 'sc-mt1a', root_cause_name: '跌倒風險評估表未落實', what: '修訂評估流程 + 電子提醒', why: '確保高風險病人 100% 完成評估', who: '王小明', where: '全病房', when: '2026-04-25', how: '入院 8 小時內完成評估，系統自動提醒未完成案例' },
        { id: 'cm4', root_cause_id: 'sc-e1a', root_cause_name: '浴室地面濕滑', what: '全面鋪設防滑墊 + 乾濕分離', why: '消除環境危險因子', who: '林志偉', where: '全病房浴室', when: '2026-04-10', how: '採購防滑墊、安裝排水條、張貼「小心地滑」標誌' },
        { id: 'cm5', root_cause_id: 'sc-e1b', root_cause_name: '夜間照明不足', what: '增設夜間感應式照明', why: '提升夜間環境安全', who: '林志偉', where: '走廊+浴室', when: '2026-04-12', how: '安裝 LED 感應夜燈，走廊照度提升至 50 lux 以上' },
      ],
      evaluation_criteria: ['可行性', '經濟性', '效益性'],
      evaluation_scores: [{ member_name: '圈長', ratings: {
        cm1: { '可行性': 4, '經濟性': 3, '效益性': 5 },
        cm2: { '可行性': 5, '經濟性': 5, '效益性': 4 },
        cm3: { '可行性': 4, '經濟性': 4, '效益性': 5 },
        cm4: { '可行性': 5, '經濟性': 4, '效益性': 4 },
        cm5: { '可行性': 5, '經濟性': 3, '效益性': 4 },
      } }],
      evaluation_totals: { cm1: 12, cm2: 14, cm3: 13, cm4: 13, cm5: 12 },
      adoption_threshold: 10,
      adopted: ['cm1', 'cm2', 'cm3', 'cm4', 'cm5'],
      rejected: [],
    },
  },
  8: {
    stepNumber: 8,
    status: 'completed',
    updatedAt: '2026-05-10T00:00:00Z',
    data: {
      implementations: [
        { countermeasure_id: 'cm1', countermeasure_name: '導入離床感應器', implementation_date: '2026-04-18', before_description: '高風險病人離床無預警，護理人員發現時已跌倒', after_description: '感應器即時通知護理站，平均反應時間從 8 分鐘縮短至 45 秒', responsible: '李美麗', status: 'completed', effectiveness: 'effective', review_note: '已安裝 15 床，病人接受度良好' },
        { countermeasure_id: 'cm2', countermeasure_name: '床欄查核 + 圖示提醒', implementation_date: '2026-04-14', before_description: '床欄遵從率 76%', after_description: '查核後遵從率提升至 97%', responsible: '張大華', status: 'completed', effectiveness: 'effective', review_note: '圖示提醒卡獲得正面回饋' },
        { countermeasure_id: 'cm3', countermeasure_name: '修訂評估流程 + 電子提醒', implementation_date: '2026-04-22', before_description: '高風險病人評估完成率 65%', after_description: '導入電子提醒後完成率提升至 95%', responsible: '王小明', status: 'completed', effectiveness: 'effective', review_note: '系統提醒功能有效，但需持續監測' },
        { countermeasure_id: 'cm4', countermeasure_name: '全面鋪設防滑墊 + 乾濕分離', implementation_date: '2026-04-08', before_description: '8 間浴室僅 3 間有防滑墊', after_description: '全部 8 間已鋪設防滑墊，另增設排水條', responsible: '林志偉', status: 'completed', effectiveness: 'effective', review_note: '浴室跌倒事件從每月 3 件降至 0 件' },
        { countermeasure_id: 'cm5', countermeasure_name: '增設夜間感應式照明', implementation_date: '2026-04-11', before_description: '走廊夜間照度 30 lux', after_description: '安裝後照度提升至 55 lux，浴室增設感應燈', responsible: '林志偉', status: 'completed', effectiveness: 'effective', review_note: '病人反映夜間上廁所更安心' },
      ],
    },
  },
  9: {
    stepNumber: 9,
    status: 'completed',
    updatedAt: '2026-06-01T00:00:00Z',
    data: {
      post_check_period_start: '2026-05-01',
      post_check_period_end: '2026-05-31',
      post_total_checks: 520,
      post_categories: [
        { name: '環境因素', count: 3 },
        { name: '藥物影響', count: 6 },
        { name: '肌力不足', count: 4 },
        { name: '認知障礙', count: 3 },
        { name: '未使用輔具', count: 1 },
        { name: '其他', count: 1 },
      ],
      post_pareto_sorted: [
        { name: '藥物影響', count: 6, cumulative_count: 6, percentage: 33.3, cumulative_percentage: 33.3 },
        { name: '肌力不足', count: 4, cumulative_count: 10, percentage: 22.2, cumulative_percentage: 55.6 },
        { name: '環境因素', count: 3, cumulative_count: 13, percentage: 16.7, cumulative_percentage: 72.2 },
        { name: '認知障礙', count: 3, cumulative_count: 16, percentage: 16.7, cumulative_percentage: 88.9 },
        { name: '未使用輔具', count: 1, cumulative_count: 17, percentage: 5.6, cumulative_percentage: 94.4 },
        { name: '其他', count: 1, cumulative_count: 18, percentage: 5.6, cumulative_percentage: 100 },
      ],
      post_rate: 1.15,
      improvement_rate: 64.1,
      goal_achievement_rate: 146.4,
      intangible_criteria: ['團隊合作', '問題解決能力', '溝通協調', '品管手法運用', '責任感', '自信心'],
      intangible_scores: {
        before: { '圈長': { '團隊合作': 3, '問題解決能力': 2, '溝通協調': 3, '品管手法運用': 2, '責任感': 4, '自信心': 3 } },
        after: { '圈長': { '團隊合作': 5, '問題解決能力': 4, '溝通協調': 4, '品管手法運用': 4, '責任感': 5, '自信心': 4 } },
      },
      intangible_averages: {
        before: { '團隊合作': 3, '問題解決能力': 2, '溝通協調': 3, '品管手法運用': 2, '責任感': 4, '自信心': 3 },
        after: { '團隊合作': 5, '問題解決能力': 4, '溝通協調': 4, '品管手法運用': 4, '責任感': 5, '自信心': 4 },
      },
      upstream_snapshot: null,
      chart_config: { title_override: null, color_theme: 'default', show_data_labels: true },
    },
  },
  10: {
    stepNumber: 10,
    status: 'completed',
    updatedAt: '2026-06-20T00:00:00Z',
    data: {
      standardizations: [
        { countermeasure_name: '離床感應器使用', standard_content: '入院評估為高跌倒風險（Morse ≥ 45）之病人，於 2 小時內安裝離床感應器，每班確認運作正常。', document_number: 'SOP-NUR-2026-018', maintainer: '李美麗' },
        { countermeasure_name: '床欄查核制度', standard_content: '每班交班時查核床欄是否完全拉起，於交班紀錄表勾選確認。床頭張貼圖示提醒卡。', document_number: 'SOP-NUR-2026-019', maintainer: '張大華' },
        { countermeasure_name: '跌倒風險評估流程', standard_content: '所有新入院病人於入院 8 小時內完成跌倒風險評估（Morse Fall Scale）。高風險病人每週重新評估。系統未完成自動提醒。', document_number: 'SOP-NUR-2026-020', maintainer: '王小明' },
        { countermeasure_name: '浴室防滑設施', standard_content: '全病房浴室鋪設防滑墊、安裝排水條。每月環境巡查確認設施完好。', document_number: 'SOP-ENV-2026-005', maintainer: '林志偉' },
        { countermeasure_name: '夜間照明標準', standard_content: '走廊夜間照度維持 50 lux 以上，浴室安裝感應式夜燈。每季照度檢測。', document_number: 'SOP-ENV-2026-006', maintainer: '林志偉' },
      ],
      review: {
        strengths: '1. 團隊合作默契佳，每位圈員都能主動承擔任務\n2. 數據收集完整，分析方法正確\n3. 對策執行迅速，全部在預定時間內完成\n4. 改善成效顯著，目標達成率 146.4% 超出預期',
        improvements: '1. 初期對品管手法不熟悉，應加強教育訓練\n2. 藥物影響的跌倒仍有改善空間，可列為下期主題\n3. 應建立更完善的持續監測機制',
        next_topic_suggestion: '降低藥物相關跌倒事件發生率 — 本次改善後藥物影響成為新的關鍵少數（33.3%），建議下期針對此議題深入改善。',
      },
      benefit_summary: '本次品管圈活動成功將住院病人跌倒發生率從 3.2‰ 降至 1.15‰，改善幅度 64.1%，目標達成率 146.4%。預估每年可減少約 400 件跌倒事件，節省跌倒相關醫療處置費用約 NT$120 萬元/年，同時降低醫療糾紛風險。',
    },
  },
}

// ─── In-Memory Store ──────────────────────────────────────────────

interface MockUser {
  id: string
  username: string
  displayName: string
  role: string
  department: string | null
  email: string | null
  isActive: boolean
  passwordHash: string
  lastLoginAt: string | null
  createdAt: string
}

interface MockProject {
  id: string
  name: string
  circleName: string
  department: string
  status: string
  themeType: string | null
  topicCategory: string | null
  periodStart: string | null
  periodEnd: string | null
  currentRate: number | null
  targetRate: number | null
  postRate: number | null
  improvementRate: number | null
  goalAchievementRate: number | null
  isFeatured: boolean
  isPublic: boolean
  createdBy: string
  updatedAt: string
}

const users = new Map<string, MockUser>([
  [DEMO_USER.id, DEMO_USER],
  [ADMIN_USER.id, ADMIN_USER],
])

const projects = new Map<string, MockProject>([[DEMO_PROJECT.id, DEMO_PROJECT]])

const steps = new Map<string, Record<number, typeof DEMO_STEPS[1]>>([
  [DEMO_PROJECT.id, { ...DEMO_STEPS }],
])

const chatMessages: Array<{ projectId: string; stepNumber: number; role: string; content: string; mode: string }> = []

// Currently "logged in" user (mock session)
let currentUserId: string | null = DEMO_USER.id

// ─── Mock DB API ──────────────────────────────────────────────────

export const mockDb = {
  // Auth
  login(username: string, _password: string) {
    const user = Array.from(users.values()).find((u) => u.username === username)
    if (!user) return null
    currentUserId = user.id
    return { id: user.id, username: user.username, displayName: user.displayName, role: user.role, department: user.department }
  },

  logout() {
    currentUserId = null
  },

  getCurrentUser() {
    if (!currentUserId) return null
    const u = users.get(currentUserId)
    if (!u) return null
    return { id: u.id, username: u.username, displayName: u.displayName, role: u.role, department: u.department, email: u.email }
  },

  // Projects
  getProjects() {
    return Array.from(projects.values()).map((p) => {
      const projectSteps = steps.get(p.id) || {}
      const stepsCompleted = Object.values(projectSteps).filter((s) => s.status === 'completed').length
      return {
        id: p.id,
        name: p.name,
        circleName: p.circleName,
        department: p.department,
        status: p.status,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        memberCount: 5,
        stepsCompleted,
        stepsTotal: 10,
        updatedAt: p.updatedAt,
      }
    })
  },

  getProject(id: string) {
    const p = projects.get(id)
    if (!p) return null
    const projectSteps = steps.get(id) || {}
    return {
      ...p,
      members: [],
      steps: Object.values(projectSteps).map((s) => ({
        stepNumber: s.stepNumber,
        status: s.status,
        updatedAt: s.updatedAt,
      })),
    }
  },

  createProject(data: { name: string; circleName: string; department: string; periodStart?: string; periodEnd?: string; themeType?: string }) {
    const id = crypto.randomUUID()
    const project = {
      id,
      name: data.name,
      circleName: data.circleName,
      department: data.department,
      status: 'active',
      themeType: data.themeType || 'reduction',
      topicCategory: null,
      periodStart: data.periodStart || null,
      periodEnd: data.periodEnd || null,
      currentRate: null,
      targetRate: null,
      postRate: null,
      improvementRate: null,
      goalAchievementRate: null,
      isFeatured: false,
      isPublic: false,
      createdBy: currentUserId || DEMO_USER.id,
      updatedAt: new Date().toISOString(),
    }
    projects.set(id, project)
    steps.set(id, {})
    return { id }
  },

  // Steps
  getStepStatuses(projectId: string) {
    const projectSteps = steps.get(projectId) || {}
    return Array.from({ length: 10 }, (_, i) => {
      const n = i + 1
      const s = projectSteps[n]
      return { stepNumber: n, status: s?.status || 'not_started', updatedAt: s?.updatedAt || null, completedAt: null }
    })
  },

  getStep(projectId: string, stepNumber: number) {
    const projectSteps = steps.get(projectId) || {}
    const s = projectSteps[stepNumber]
    if (!s) return { stepNumber, status: 'not_started', data: {}, aiDraftFields: null }
    return { stepNumber: s.stepNumber, status: s.status, data: s.data, aiDraftFields: null, updatedAt: s.updatedAt }
  },

  saveStep(projectId: string, stepNumber: number, data: Record<string, unknown>, status?: string) {
    if (!steps.has(projectId)) steps.set(projectId, {})
    const projectSteps = steps.get(projectId)!
    projectSteps[stepNumber] = {
      stepNumber,
      status: status || 'in_progress',
      data,
      updatedAt: new Date().toISOString(),
    }
    return { stepNumber, status: projectSteps[stepNumber].status, updatedAt: projectSteps[stepNumber].updatedAt }
  },

  // Chat
  getChatHistory(projectId: string, stepNumber: number | null, mode: string = 'freeform') {
    return chatMessages
      .filter((m) => m.projectId === projectId && (stepNumber == null || m.stepNumber === stepNumber) && m.mode === mode)
      .map((m) => ({ role: m.role, content: m.content }))
  },

  addChatMessage(projectId: string, stepNumber: number, role: string, content: string, mode: string = 'freeform') {
    chatMessages.push({ projectId, stepNumber, role, content, mode })
  },

  // Admin
  getDashboard() {
    const allProjects = Array.from(projects.values())
    const projectSummaries = allProjects.map((p) => {
      const projectSteps = steps.get(p.id) || {}
      const stepsCompleted = Object.values(projectSteps).filter((s) => s.status === 'completed').length
      return {
        id: p.id,
        name: p.name,
        circleName: p.circleName,
        department: p.department,
        memberCount: 5,
        stepsCompleted,
        currentRate: p.currentRate,
        targetRate: p.targetRate,
        postRate: p.postRate,
        improvementRate: p.improvementRate,
        goalAchievementRate: p.goalAchievementRate,
        lastUpdate: p.updatedAt,
        daysSinceUpdate: 2,
        isStalled: false,
      }
    })
    return {
      stats: { totalActive: allProjects.length, totalCompleted: 0, stalledCount: 0 },
      projects: projectSummaries,
    }
  },

  getUsers() {
    return Array.from(users.values()).map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      department: u.department,
      email: u.email,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }))
  },

  createUser(data: { username: string; displayName: string; role: string; department?: string }) {
    const id = crypto.randomUUID()
    const user = {
      id,
      username: data.username,
      displayName: data.displayName,
      role: data.role as 'team_rep' | 'qcc_admin' | 'sys_admin',
      department: data.department || null,
      email: null,
      isActive: true,
      passwordHash: '$2a$10$mock',
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
    }
    users.set(id, user)
    return { id, username: user.username }
  },
}
