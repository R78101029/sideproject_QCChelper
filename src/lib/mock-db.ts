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
  status: 'active',
  themeType: 'reduction',
  topicCategory: '病人安全',
  periodStart: '2026-01-01',
  periodEnd: '2026-06-30',
  currentRate: 3.2,
  targetRate: 1.8,
  postRate: null,
  improvementRate: null,
  goalAchievementRate: null,
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
    status: 'in_progress',
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
