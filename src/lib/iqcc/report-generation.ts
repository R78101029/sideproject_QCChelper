// iQCC AI Report Generation + Background Scan

// ─── Report Generation Prompts ────────────────────────────────────

export function getStep4ReportPrompt(projectContext: string, step4Data: Record<string, unknown>): string {
  const categories = JSON.stringify(step4Data.categories || [], null, 2)
  const paretoSorted = JSON.stringify(step4Data.pareto_sorted || [], null, 2)
  const vitalFew = (step4Data.vital_few as string[])?.join('、') || '（未識別）'

  return `你是「AI 品管促進員」，請為本次品管圈活動生成一份【現況分析整合報告】。

${projectContext}

【查檢數據】
- 查檢期間：${step4Data.check_period_start || '?'} ~ ${step4Data.check_period_end || '?'}
- 查檢總數：${step4Data.total_checks || 0}
- 現狀值：${step4Data.current_rate || '?'}

【分類統計】
${categories}

【柏拉圖排序】
${paretoSorted}

【關鍵少數】${vitalFew}

請生成報告，包含：
1. **數據概述**（一段話，簡述查檢範圍和總體情況）
2. **主要發現**（柏拉圖分析結果的敘事版本，指出 80/20 法則的切割點）
3. **關鍵少數分析**（逐項說明每個關鍵少數項目的意義和影響）
4. **現況總結**（一段結論性文字，適合放在報告中）

使用繁體中文，語氣專業但易懂。報告適合醫院品管部門閱讀。`
}

export function getStep9ReportPrompt(
  projectContext: string,
  step4Data: Record<string, unknown>,
  step5Data: Record<string, unknown>,
  step9Data: Record<string, unknown>
): string {
  return `你是「AI 品管促進員」，請生成一份【成效比較報告】。

${projectContext}

【改善前數據（步驟四）】
- 現狀值：${step4Data.current_rate || '?'}
- 查檢總數：${step4Data.total_checks || 0}
- 關鍵少數：${(step4Data.vital_few as string[])?.join('、') || '?'}

【目標（步驟五）】
- 目標值：${step5Data.target_value || '?'}
- 計算方式：${step5Data.calculation_method || '?'}

【改善後數據（步驟九）】
- 改善後不良率：${step9Data.post_rate || '?'}
- 改善幅度：${step9Data.improvement_rate || '?'}%
- 目標達成率：${step9Data.goal_achievement_rate || '?'}%

請生成報告，包含：
1. **改善成效摘要**（一段話總結有形成果）
2. **前後對比分析**（數據面的變化說明）
3. **目標達成評估**（是否達標、原因分析）
4. **建議**（如達標：維持策略；未達標：改善方向）

使用繁體中文。`
}

export function getStep10ReportPrompt(
  projectContext: string,
  step10Data: Record<string, unknown>,
  documentType: 'sop' | 'checklist' | 'faq'
): string {
  const stds = step10Data.standardizations || []
  const typeLabels = { sop: 'SOP 標準作業程序', checklist: '查核表', faq: '常見問題 FAQ' }

  return `你是「AI 品管促進員」，請基於以下標準化內容，生成一份【${typeLabels[documentType]}】。

${projectContext}

【標準化項目】
${JSON.stringify(stds, null, 2)}

【檢討結果】
${JSON.stringify(step10Data.review || {}, null, 2)}

請生成：${typeLabels[documentType]}

格式要求：
${documentType === 'sop'
    ? '- 包含：目的、範圍、權責、作業流程（步驟化）、注意事項\n- 每個步驟要具體、可操作'
    : documentType === 'checklist'
      ? '- 表格格式：項次、查核項目、符合/不符合/不適用\n- 項目要具體明確'
      : '- Q&A 格式\n- 涵蓋執行者常見疑問\n- 答案要簡潔實用'
  }

使用繁體中文。內容要具體，不要空泛。`
}

// ─── Background Scan Prompts ──────────────────────────────────────

export function getStep2ScanPrompt(projectContext: string, topicName: string): string {
  return `你是「AI 品管促進員」，請為品管圈的主題選定提供【背景掃描分析】。

${projectContext}

【候選主題】${topicName}

請提供：
1. **主題重要性**（為什麼這個議題在醫療機構中重要）
2. **常見挑戰**（醫院在此議題上常遇到的困難）
3. **改善效益**（成功改善後可預期的效益）
4. **參考範圍**（類似醫院的一般指標範圍，如果知道的話）

使用繁體中文，語氣客觀專業。注意：你的知識可能不是最新的，請提醒團隊以實際數據為準。`
}

export function getStep5BenchmarkPrompt(
  projectContext: string,
  currentValue: number | null,
  topicName: string
): string {
  return `你是「AI 品管促進員」，請為目標設定提供【外部對標參考】。

${projectContext}

【改善主題】${topicName}
【目前現狀值】${currentValue ?? '未知'}

請提供：
1. **文獻參考區間**（類似醫院或研究中，此指標的常見範圍）
2. **標竿值**（表現優良的機構通常達到什麼水準）
3. **改善空間評估**（與標竿的差距分析）
4. **目標建議**（合理的目標區間建議，考量不同圈能力）

注意：
- 明確標示這是 AI 參考資訊，最終目標應由團隊討論決定
- 提醒團隊目標值需考量自身能力和資源
- 使用繁體中文`
}
