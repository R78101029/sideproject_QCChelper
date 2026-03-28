// QCC Helper — TypeScript Type Definitions
// Step1Data ~ Step10Data interfaces matching requirements.md §6.3

// ─── Common Types ─────────────────────────────────────────────────

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ─── Step 1 — 組圈 ────────────────────────────────────────────────

export interface Step1Member {
  name: string
  title: string
  division: string
}

export interface Step1Data {
  circle_name: string
  circle_meaning: string
  department: string
  period_start: string | null
  period_end: string | null
  leader: { name: string; title: string }
  advisor: { name: string; title: string }
  members: Step1Member[]
  emblem_upload_id: string | null
}

// ─── Step 2 — 主題選定 ────────────────────────────────────────────

export interface Step2Candidate {
  id: string
  name: string
  description: string
}

export interface Step2Score {
  member_name: string
  ratings: Record<string, Record<string, number>>
}

export interface Step2Data {
  candidates: Step2Candidate[]
  criteria: string[]
  scores: Step2Score[]
  totals: Record<string, number>
  selected_topic: string
  selection_reason: string
  metric_definition: string
}

// ─── Step 3 — 活動計畫擬定 ────────────────────────────────────────

export interface Step3ScheduleItem {
  step_number: number
  step_name: string
  responsible: string
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
}

export interface Step3Data {
  total_weeks: number
  meeting_frequency: string
  schedule: Step3ScheduleItem[]
}

// ─── Step 4 — 現況把握 ────────────────────────────────────────────

export interface CategoryCount {
  name: string
  count: number
}

export interface ParetoItem {
  name: string
  count: number
  cumulative_count: number
  percentage: number
  cumulative_percentage: number
}

export interface ChartConfig {
  title_override: string | null
  color_theme: string
  show_data_labels: boolean
}

export interface Step4Data {
  check_period_start: string | null
  check_period_end: string | null
  total_checks: number
  categories: CategoryCount[]
  pareto_sorted: ParetoItem[]
  vital_few: string[]
  current_rate: number | null
  description: string
  chart_config: ChartConfig
}

// ─── Step 5 — 目標設定 ────────────────────────────────────────────

export interface UpstreamSnapshot {
  step4_current_rate: number
  step4_vital_few: string[]
  data_hash: string
  snapshot_at: string
}

export interface Step5Data {
  current_value: number | null
  improvement_focus_ratio: number | null
  circle_capability: number | null
  calculation_method: 'formula' | 'manual'
  theme_type: 'reduction' | 'improvement'
  target_value: number | null
  upstream_snapshot: UpstreamSnapshot | null
  reason: string
}

// ─── Step 6 — 解析 ────────────────────────────────────────────────

export interface SmallCause {
  id: string
  name: string
  is_root_cause: boolean
}

export interface MediumCause {
  id: string
  name: string
  small_causes: SmallCause[]
}

export interface MainCategory {
  id: string
  name: string
  medium_causes: MediumCause[]
}

export interface RootCauseVerification {
  cause_id: string
  cause_name: string
  method: string
  result: boolean
  evidence: string
}

// Phase 2: iQCC causal verification
export interface CausalVerification {
  cause_id: string
  cause_name: string
  hypothesis: string
  data_support: string
  data_against: string
  conclusion: 'confirmed' | 'rejected' | 'inconclusive'
  ai_analysis: string | null
}

export interface Step6Data {
  fishbone_topic: string
  main_categories: MainCategory[]
  root_cause_verification: RootCauseVerification[]
  confirmed_root_causes: string[]
  // Phase 2: iQCC three-stage causal exploration
  causal_verification?: CausalVerification[]
}

// ─── Step 7 — 對策擬定 ────────────────────────────────────────────

export interface Countermeasure {
  id: string
  root_cause_id: string
  root_cause_name: string
  what: string
  why: string
  who: string
  where: string
  when: string
  how: string
}

export interface EvaluationScore {
  member_name: string
  ratings: Record<string, Record<string, number>>
}

// Phase 2: iQCC pressure test
export interface PressureTestRound {
  round: number
  proposal: string
  ai_review: string
  ai_perspective: string
  risks_identified: string[]
  team_response: string
  status: 'pending' | 'revised' | 'approved'
  created_at: string
}

export interface Step7Data {
  countermeasures: Countermeasure[]
  evaluation_criteria: string[]
  evaluation_scores: EvaluationScore[]
  evaluation_totals: Record<string, number>
  adoption_threshold: number
  adopted: string[]
  rejected: string[]
  // Phase 2: iQCC pressure test loop
  pressure_test?: PressureTestRound[]
}

// ─── Step 8 — 對策實施與檢討 ──────────────────────────────────────

export interface Implementation {
  countermeasure_id: string
  countermeasure_name: string
  implementation_date: string | null
  before_description: string
  after_description: string
  responsible: string
  status: 'in_progress' | 'completed' | 'delayed'
  effectiveness: 'effective' | 'ineffective' | 'needs_revision' | null
  review_note: string
}

export interface Step8Data {
  implementations: Implementation[]
}

// ─── Step 9 — 效果確認 ────────────────────────────────────────────

export interface Step9UpstreamSnapshot {
  step4_current_rate: number
  step4_categories: CategoryCount[]
  step5_target_value: number
  data_hash: string
  snapshot_at: string
}

export interface Step9Data {
  post_check_period_start: string | null
  post_check_period_end: string | null
  post_total_checks: number
  post_categories: CategoryCount[]
  post_pareto_sorted: ParetoItem[]
  post_rate: number | null
  improvement_rate: number | null
  goal_achievement_rate: number | null
  intangible_criteria: string[]
  intangible_scores: {
    before: Record<string, Record<string, number>>
    after: Record<string, Record<string, number>>
  }
  intangible_averages: {
    before: Record<string, number>
    after: Record<string, number>
  }
  upstream_snapshot: Step9UpstreamSnapshot | null
  chart_config: ChartConfig
}

// ─── Step 10 — 標準化與檢討改進 ──────────────────────────────────

export interface Standardization {
  countermeasure_name: string
  standard_content: string
  document_number: string
  maintainer: string
}

export interface Step10Data {
  standardizations: Standardization[]
  review: {
    strengths: string
    improvements: string
    next_topic_suggestion: string
  }
  benefit_summary: string
}

// ─── Step Data Union ──────────────────────────────────────────────

export type StepData =
  | Step1Data
  | Step2Data
  | Step3Data
  | Step4Data
  | Step5Data
  | Step6Data
  | Step7Data
  | Step8Data
  | Step9Data
  | Step10Data

export type StepDataMap = {
  1: Step1Data
  2: Step2Data
  3: Step3Data
  4: Step4Data
  5: Step5Data
  6: Step6Data
  7: Step7Data
  8: Step8Data
  9: Step9Data
  10: Step10Data
}
