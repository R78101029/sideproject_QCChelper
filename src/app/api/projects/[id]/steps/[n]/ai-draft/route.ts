import { NextRequest } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { streamChat } from '@/lib/claude'

type RouteParams = { params: Promise<{ id: string; n: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id, n } = await params
  const stepNumber = parseInt(n, 10)

  if (!MOCK_MODE) {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: '未登入' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Load project context + all existing step data for context
  let projectName = ''
  let circleName = ''
  let department = ''
  let themeType = ''
  const allSteps: Record<number, Record<string, unknown>> = {}

  if (MOCK_MODE) {
    const p = mockDb.getProject(id)
    if (p) { projectName = p.name; circleName = p.circleName; department = p.department; themeType = p.themeType ?? '' }
    for (let i = 1; i <= 10; i++) {
      const s = mockDb.getStep(id, i)
      if (s.data && Object.keys(s.data).length > 0) allSteps[i] = s.data as Record<string, unknown>
    }
  } else {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true, circleName: true, department: true, themeType: true },
    })
    if (project) { projectName = project.name; circleName = project.circleName; department = project.department; themeType = project.themeType || '' }

    const steps = await prisma.step.findMany({
      where: { projectId: id },
      select: { stepNumber: true, data: true },
    })
    for (const s of steps) {
      if (s.data) allSteps[s.stepNumber] = s.data as Record<string, unknown>
    }
  }

  // Build context from existing steps
  const existingContext = Object.entries(allSteps)
    .filter(([num]) => parseInt(num) !== stepNumber)
    .map(([num, data]) => {
      const key = parseInt(num)
      const summary = summarizeStep(key, data)
      return summary ? `步驟${key}：${summary}` : null
    })
    .filter(Boolean)
    .join('\n')

  const STEP_NAMES = ['組圈', '主題選定', '活動計畫', '現況把握', '目標設定', '解析', '對策擬定', '對策實施', '效果確認', '標準化']

  const systemPrompt = `你是「AI 品管促進員」。請為步驟${stepNumber}（${STEP_NAMES[stepNumber - 1]}）生成完整的草稿內容。

【專案資訊】
- 專案名稱：${projectName}
- 圈名：${circleName}
- 科別：${department}
- 改善類型：${themeType === 'reduction' ? '降低類' : '提升類'}

【已有的步驟數據】
${existingContext || '（尚無其他步驟數據）'}

請根據以上資訊，生成步驟${stepNumber}的完整草稿。
回傳格式：JSON，欄位對應步驟${stepNumber}的資料結構。
重要：只回傳 JSON，不要加任何其他文字、markdown 或解釋。`

  const body = await request.json()
  const userMessage = body.message || `請為步驟${stepNumber}生成草稿。`

  const stream = streamChat({
    messages: [{ role: 'user', content: userMessage }],
    systemPrompt,
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function summarizeStep(stepNumber: number, data: Record<string, unknown>): string | null {
  switch (stepNumber) {
    case 1: return data.circle_name ? `圈名=${data.circle_name}` : null
    case 2: return data.selected_topic ? `主題=${data.selected_topic}` : null
    case 4: return data.current_rate != null ? `現狀值=${data.current_rate}，關鍵少數=${(data.vital_few as string[])?.join('、') || '?'}` : null
    case 5: return data.target_value != null ? `目標值=${data.target_value}` : null
    case 6: return data.confirmed_root_causes ? `真因=${(data.confirmed_root_causes as string[]).length}項` : null
    case 9: return data.post_rate != null ? `改善後=${data.post_rate}` : null
    default: return null
  }
}
