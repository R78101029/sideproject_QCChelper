// QCC Helper — Zod Validation Schemas
// Runtime validation for Step1Data ~ Step10Data (requirements.md §6.3)

import { z } from 'zod'

// ─── Common Schemas ───────────────────────────────────────────────

const chartConfigSchema = z.object({
  title_override: z.string().nullable().default(null),
  color_theme: z.string().default('default'),
  show_data_labels: z.boolean().default(true),
})

const categoryCountSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(0),
})

const paretoItemSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(0),
  cumulative_count: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  cumulative_percentage: z.number().min(0).max(100),
})

// ─── Step 1 — 組圈 ────────────────────────────────────────────────

export const step1Schema = z.object({
  circle_name: z.string().default(''),
  circle_meaning: z.string().default(''),
  department: z.string().default(''),
  period_start: z.string().nullable().default(null),
  period_end: z.string().nullable().default(null),
  leader: z.object({
    name: z.string().default(''),
    title: z.string().default(''),
  }).default({ name: '', title: '' }),
  advisor: z.object({
    name: z.string().default(''),
    title: z.string().default(''),
  }).default({ name: '', title: '' }),
  members: z.array(z.object({
    name: z.string().default(''),
    title: z.string().default(''),
    division: z.string().default(''),
  })).default([]),
  emblem_upload_id: z.string().uuid().nullable().default(null),
})

// ─── Step 2 — 主題選定 ────────────────────────────────────────────

export const step2Schema = z.object({
  candidates: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().default(''),
    description: z.string().default(''),
  })).default([]),
  criteria: z.array(z.string()).default([]),
  scores: z.array(z.object({
    member_name: z.string(),
    ratings: z.record(z.string(), z.record(z.string(), z.number())),
  })).default([]),
  totals: z.record(z.string(), z.number()).default({}),
  selected_topic: z.string().default(''),
  selection_reason: z.string().default(''),
  metric_definition: z.string().default(''),
})

// ─── Step 3 — 活動計畫擬定 ────────────────────────────────────────

export const step3Schema = z.object({
  total_weeks: z.number().int().min(0).default(0),
  meeting_frequency: z.string().default(''),
  schedule: z.array(z.object({
    step_number: z.number().int().min(1).max(10),
    step_name: z.string().default(''),
    responsible: z.string().default(''),
    planned_start: z.string().nullable().default(null),
    planned_end: z.string().nullable().default(null),
    actual_start: z.string().nullable().default(null),
    actual_end: z.string().nullable().default(null),
  })).default([]),
})

// ─── Step 4 — 現況把握 ────────────────────────────────────────────

export const step4Schema = z.object({
  check_period_start: z.string().nullable().default(null),
  check_period_end: z.string().nullable().default(null),
  total_checks: z.number().int().min(0).default(0),
  categories: z.array(categoryCountSchema).default([]),
  pareto_sorted: z.array(paretoItemSchema).default([]),
  vital_few: z.array(z.string()).default([]),
  current_rate: z.number().nullable().default(null),
  description: z.string().default(''),
  chart_config: chartConfigSchema.default({
    title_override: null,
    color_theme: 'default',
    show_data_labels: true,
  }),
})

// ─── Step 5 — 目標設定 ────────────────────────────────────────────

export const step5Schema = z.object({
  current_value: z.number().nullable().default(null),
  improvement_focus_ratio: z.number().nullable().default(null),
  circle_capability: z.number().min(0).max(1).nullable().default(null),
  calculation_method: z.enum(['formula', 'manual']).default('formula'),
  theme_type: z.enum(['reduction', 'improvement']).default('reduction'),
  target_value: z.number().nullable().default(null),
  upstream_snapshot: z.object({
    step4_current_rate: z.number(),
    step4_vital_few: z.array(z.string()),
    data_hash: z.string(),
    snapshot_at: z.string(),
  }).nullable().default(null),
  reason: z.string().default(''),
})

// ─── Step 6 — 解析 ────────────────────────────────────────────────

const smallCauseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().default(''),
  is_root_cause: z.boolean().default(false),
})

const mediumCauseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().default(''),
  small_causes: z.array(smallCauseSchema).default([]),
})

const mainCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().default(''),
  medium_causes: z.array(mediumCauseSchema).default([]),
})

// Phase 2: iQCC causal verification
const causalVerificationSchema = z.object({
  cause_id: z.string().uuid(),
  cause_name: z.string(),
  hypothesis: z.string(),
  data_support: z.string(),
  data_against: z.string(),
  conclusion: z.enum(['confirmed', 'rejected', 'inconclusive']),
  ai_analysis: z.string().nullable().default(null),
})

export const step6Schema = z.object({
  fishbone_topic: z.string().default(''),
  main_categories: z.array(mainCategorySchema).default([]),
  root_cause_verification: z.array(z.object({
    cause_id: z.string().uuid(),
    cause_name: z.string(),
    method: z.string(),
    result: z.boolean(),
    evidence: z.string(),
  })).default([]),
  confirmed_root_causes: z.array(z.string()).default([]),
  // Phase 2: iQCC three-stage causal exploration
  causal_verification: z.array(causalVerificationSchema).optional(),
})

// ─── Step 7 — 對策擬定 ────────────────────────────────────────────

const countermeasureSchema = z.object({
  id: z.string().uuid(),
  root_cause_id: z.string().uuid(),
  root_cause_name: z.string().default(''),
  what: z.string().default(''),
  why: z.string().default(''),
  who: z.string().default(''),
  where: z.string().default(''),
  when: z.string().default(''),
  how: z.string().default(''),
})

// Phase 2: iQCC pressure test
const pressureTestRoundSchema = z.object({
  round: z.number().int().min(1),
  proposal: z.string(),
  ai_review: z.string(),
  ai_perspective: z.string(),
  risks_identified: z.array(z.string()),
  team_response: z.string(),
  status: z.enum(['pending', 'revised', 'approved']),
  created_at: z.string(),
})

export const step7Schema = z.object({
  countermeasures: z.array(countermeasureSchema).default([]),
  evaluation_criteria: z.array(z.string()).default([]),
  evaluation_scores: z.array(z.object({
    member_name: z.string(),
    ratings: z.record(z.string(), z.record(z.string(), z.number())),
  })).default([]),
  evaluation_totals: z.record(z.string(), z.number()).default({}),
  adoption_threshold: z.number().default(0),
  adopted: z.array(z.string()).default([]),
  rejected: z.array(z.string()).default([]),
  // Phase 2: iQCC pressure test loop
  pressure_test: z.array(pressureTestRoundSchema).optional(),
})

// ─── Step 8 — 對策實施與檢討 ──────────────────────────────────────

export const step8Schema = z.object({
  implementations: z.array(z.object({
    countermeasure_id: z.string().uuid(),
    countermeasure_name: z.string().default(''),
    implementation_date: z.string().nullable().default(null),
    before_description: z.string().default(''),
    after_description: z.string().default(''),
    responsible: z.string().default(''),
    status: z.enum(['in_progress', 'completed', 'delayed']).default('in_progress'),
    effectiveness: z.enum(['effective', 'ineffective', 'needs_revision']).nullable().default(null),
    review_note: z.string().default(''),
  })).default([]),
})

// ─── Step 9 — 效果確認 ────────────────────────────────────────────

export const step9Schema = z.object({
  post_check_period_start: z.string().nullable().default(null),
  post_check_period_end: z.string().nullable().default(null),
  post_total_checks: z.number().int().min(0).default(0),
  post_categories: z.array(categoryCountSchema).default([]),
  post_pareto_sorted: z.array(paretoItemSchema).default([]),
  post_rate: z.number().nullable().default(null),
  improvement_rate: z.number().nullable().default(null),
  goal_achievement_rate: z.number().nullable().default(null),
  intangible_criteria: z.array(z.string()).default([]),
  intangible_scores: z.object({
    before: z.record(z.string(), z.record(z.string(), z.number())),
    after: z.record(z.string(), z.record(z.string(), z.number())),
  }).default({ before: {}, after: {} }),
  intangible_averages: z.object({
    before: z.record(z.string(), z.number()),
    after: z.record(z.string(), z.number()),
  }).default({ before: {}, after: {} }),
  upstream_snapshot: z.object({
    step4_current_rate: z.number(),
    step4_categories: z.array(categoryCountSchema),
    step5_target_value: z.number(),
    data_hash: z.string(),
    snapshot_at: z.string(),
  }).nullable().default(null),
  chart_config: chartConfigSchema.default({
    title_override: null,
    color_theme: 'default',
    show_data_labels: true,
  }),
})

// ─── Step 10 — 標準化與檢討改進 ──────────────────────────────────

export const step10Schema = z.object({
  standardizations: z.array(z.object({
    countermeasure_name: z.string().default(''),
    standard_content: z.string().default(''),
    document_number: z.string().default(''),
    maintainer: z.string().default(''),
  })).default([]),
  review: z.object({
    strengths: z.string().default(''),
    improvements: z.string().default(''),
    next_topic_suggestion: z.string().default(''),
  }).default({
    strengths: '',
    improvements: '',
    next_topic_suggestion: '',
  }),
  benefit_summary: z.string().default(''),
})

// ─── Schema Map ───────────────────────────────────────────────────

export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
  9: step9Schema,
  10: step10Schema,
} as const

export type StepSchemaMap = typeof stepSchemas

export function getStepSchema(stepNumber: number) {
  const schema = stepSchemas[stepNumber as keyof typeof stepSchemas]
  if (!schema) {
    throw new Error(`Invalid step number: ${stepNumber}`)
  }
  return schema
}
