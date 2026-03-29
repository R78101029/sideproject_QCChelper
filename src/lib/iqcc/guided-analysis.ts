// iQCC Three-Stage Causal Exploration (Step 6 guided AI workflow)
// Stage 1: AI-assisted Pareto analysis → identify vital few
// Stage 2: AI 5-Why interactive questioning → trace to root cause
// Stage 3: AI causal hypothesis verification → evidence-based validation

export type GuidedStage = 1 | 2 | 3

export interface GuidedAnalysisState {
  currentStage: GuidedStage
  stage1Complete: boolean
  stage2Complete: boolean
  stage3Complete: boolean
  fiveWhyDepth: number
  currentCauseId: string | null
}

export function getInitialState(): GuidedAnalysisState {
  return {
    currentStage: 1,
    stage1Complete: false,
    stage2Complete: false,
    stage3Complete: false,
    fiveWhyDepth: 0,
    currentCauseId: null,
  }
}

const STAGE_LABELS: Record<GuidedStage, string> = {
  1: '柏拉圖分析',
  2: '5-Why 追問',
  3: '因果假設驗證',
}

export function getStageLabel(stage: GuidedStage): string {
  return STAGE_LABELS[stage]
}

// ─── Stage 1: Pareto Analysis Prompt ──────────────────────────────

export function getStage1Prompt(projectContext: string, step4Data: Record<string, unknown> | null): string {
  const paretoData = step4Data?.pareto_sorted
    ? JSON.stringify(step4Data.pareto_sorted, null, 2)
    : '（尚無柏拉圖數據）'

  const vitalFew = step4Data?.vital_few
    ? (step4Data.vital_few as string[]).join('、')
    : '（尚未識別）'

  return `你是「AI 品管促進員」，正在進行【三階段因果探勘法 — 第一階段：柏拉圖分析】。

${projectContext}

【步驟四柏拉圖數據】
${paretoData}

【已識別的關鍵少數】${vitalFew}

你的任務：
1. 分析柏拉圖數據，找出「關鍵少數」（vital few）
2. 解釋為什麼這些項目是最值得優先改善的
3. 對每個關鍵少數項目，提出初步的可能原因假設
4. 引導團隊進入下一階段（5-Why 追問）

回答格式：
- 先給出數據摘要（總數、前幾項佔比、80% 線切割點）
- 再逐一分析關鍵少數項目
- 最後建議：「接下來我們用 5-Why 法，針對【XX】深入追問根本原因。準備好了嗎？」

使用繁體中文，語氣友善專業。`
}

// ─── Stage 2: 5-Why Interactive Prompt ────────────────────────────

export function getStage2Prompt(
  projectContext: string,
  currentCause: string,
  depth: number,
  previousAnswers: string[]
): string {
  const history = previousAnswers.length > 0
    ? previousAnswers.map((a, i) => `第 ${i + 1} 層：${a}`).join('\n')
    : '（剛開始）'

  return `你是「AI 品管促進員」，正在進行【三階段因果探勘法 — 第二階段：5-Why 追問】。
你現在扮演的是「5-Why 大師」，目標是引導團隊從表面原因追問到根本原因。

${projectContext}

【當前追問的原因】${currentCause}
【已追問深度】${depth} 層
【之前的回答歷程】
${history}

你的任務：
${depth === 0
    ? `- 針對「${currentCause}」，問團隊：「為什麼會發生這個問題？」`
    : depth < 3
      ? `- 針對團隊的最新回答，繼續追問「為什麼？」
- 幫助團隊更深入思考，不要接受太表面的答案`
      : `- 已追問 ${depth} 層，評估是否已到根本原因
- 如果回答仍是症狀而非根因，繼續追問
- 如果已到根因（無法再分解、可直接針對此制定對策），告訴團隊：「這已經是根本原因了。」
- 建議總結此原因的追問結果`
  }

回答規則：
- 每次只問一個「為什麼」
- 如果團隊的回答太模糊，要求具體化
- 適當引導但不替團隊回答
- 5 層後主動建議是否已到根因
- 使用繁體中文，語氣像一位有經驗的品管教練`
}

// ─── Stage 3: Causal Verification Prompt ──────────────────────────

export function getStage3Prompt(
  projectContext: string,
  step4Data: Record<string, unknown> | null,
  rootCauses: Array<{ id: string; name: string }>
): string {
  const categories = step4Data?.categories
    ? JSON.stringify(step4Data.categories, null, 2)
    : '（無數據）'

  const causeList = rootCauses.map((c, i) => `${i + 1}. ${c.name}`).join('\n')

  return `你是「AI 品管促進員」，正在進行【三階段因果探勘法 — 第三階段：因果假設驗證】。

${projectContext}

【步驟四原始數據】
${categories}

【待驗證的根本原因】
${causeList}

你的任務：
對每個根本原因，進行假設驗證：
1. **假設**：如果「XX」是根因，那麼數據中應該看到什麼模式？
2. **支持證據**：數據中有哪些發現支持此假設？
3. **反駁證據**：數據中有哪些發現不支持此假設？
4. **結論**：confirmed（確認）/ rejected（排除）/ inconclusive（無法確定）

回答格式（對每個根因）：
---
**根因：XX**
- 假設：...
- 支持：...
- 反駁：...
- 結論：✓ 確認 / ✗ 排除 / ? 無法確定
- AI 分析：（一句話說明你的判斷邏輯）
---

使用繁體中文，分析要基於數據，不要憑空猜測。`
}
