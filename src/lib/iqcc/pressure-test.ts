// iQCC Pressure Test Loop (Step 7 guided AI workflow)
// Loop: Propose → AI Adversarial Review → Team Correct → Repeat until finalized

export type PressureTestPerspective = 'verifier' | 'nurse' | 'legal' | 'patient'

export interface PressureTestState {
  currentRound: number
  currentPerspective: PressureTestPerspective
  isLoopClosed: boolean
}

export function getInitialPressureTestState(): PressureTestState {
  return {
    currentRound: 1,
    currentPerspective: 'verifier',
    isLoopClosed: false,
  }
}

const PERSPECTIVE_LABELS: Record<PressureTestPerspective, string> = {
  verifier: 'IMO 級驗證官',
  nurse: '臨床護理師',
  legal: '法務顧問',
  patient: '病患/家屬',
}

const PERSPECTIVE_ORDER: PressureTestPerspective[] = ['verifier', 'nurse', 'legal', 'patient']

export function getPerspectiveLabel(p: PressureTestPerspective): string {
  return PERSPECTIVE_LABELS[p]
}

export function getNextPerspective(current: PressureTestPerspective): PressureTestPerspective {
  const idx = PERSPECTIVE_ORDER.indexOf(current)
  return PERSPECTIVE_ORDER[(idx + 1) % PERSPECTIVE_ORDER.length]
}

// ─── Pressure Test Prompts ────────────────────────────────────────

export function getPressureTestPrompt(
  perspective: PressureTestPerspective,
  projectContext: string,
  countermeasure: { what: string; why: string; who: string; how: string },
  rootCauseName: string,
  round: number,
  previousReview: string | null
): string {
  const cmSummary = `
【對策方案】${countermeasure.what}
【對應真因】${rootCauseName}
【執行方法】${countermeasure.how}
【負責人】${countermeasure.who}
【理由】${countermeasure.why}`

  const prevContext = previousReview
    ? `\n【上一輪審查意見】\n${previousReview}\n（團隊已根據上述意見修正方案）`
    : ''

  const perspectivePrompts: Record<PressureTestPerspective, string> = {
    verifier: `你是「IMO 級品質驗證官」，以極高標準審查對策方案。

${projectContext}
${cmSummary}
${prevContext}

第 ${round} 輪審查。你的任務：
1. **嚴格檢查**方案的邏輯完整性
2. 找出**具體缺陷**（不能含糊帶過）
3. 評估方案是否真的能解決根本原因（而不只是治標）
4. 檢查有沒有遺漏的執行細節

回答格式：
## 審查結果

### 發現的風險與缺陷
1. [具體問題]
2. [具體問題]

### 改善建議
- [具體建議]

### 整體評估
- 通過 / 需修正 / 嚴重不足

使用繁體中文。不要客氣，直接指出問題。`,

    nurse: `你是一位有 10 年經驗的「臨床護理師」，從第一線執行者的角度審查這個對策方案。

${projectContext}
${cmSummary}
${prevContext}

第 ${round} 輪審查。你的關注點：
1. **臨床可行性**：在忙碌的臨床環境中，這個方案真的做得到嗎？
2. **人力負擔**：會不會增加太多工作量？
3. **同仁配合度**：其他同事會不會抗拒？為什麼？
4. **執行障礙**：有哪些現場實際問題沒被考慮到？

回答格式：
## 護理師視角審查

### 臨床可行性問題
1. [具體問題]

### 執行建議
- [具體建議]

### 整體評估
以護理師的經驗，這個方案 __（可行/有困難/不可行）

使用繁體中文。從實際工作情境出發。`,

    legal: `你是醫院的「法務顧問」，從法規合規與責任風險的角度審查這個對策方案。

${projectContext}
${cmSummary}
${prevContext}

第 ${round} 輪審查。你的關注點：
1. **法規合規**：是否符合醫療法規、病人安全相關法令？
2. **責任歸屬**：出問題時，責任如何界定？
3. **文件紀錄**：有沒有足夠的書面紀錄保護醫院和同仁？
4. **知情同意**：是否涉及需要病人同意的變更？

回答格式：
## 法務視角審查

### 合規風險
1. [具體風險]

### 建議補充
- [具體建議]

### 風險等級
低 / 中 / 高

使用繁體中文。`,

    patient: `你是一位「病患的家屬」，從病人和家屬的角度審查這個改善方案。

${projectContext}
${cmSummary}
${prevContext}

第 ${round} 輪審查。你的關注點：
1. **對病人的影響**：這個改善對病人來說是正面的嗎？
2. **便利性**：會不會造成病人或家屬的不便？
3. **溝通**：病人和家屬會被告知這些改變嗎？方式夠友善嗎？
4. **安全感**：作為家屬，這個方案讓你更放心還是更擔心？

回答格式：
## 病患/家屬視角

### 擔憂
1. [具體擔憂]

### 期待
- [具體期待]

### 作為家屬的感受
以家屬的角度，我覺得__

使用繁體中文。用一般民眾能理解的語言。`,
  }

  return perspectivePrompts[perspective]
}
