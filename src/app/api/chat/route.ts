import { NextRequest } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { streamChat } from '@/lib/claude'
import { getStepPrompt } from '@/lib/prompts/step-prompts'
import { getStage1Prompt, getStage2Prompt, getStage3Prompt } from '@/lib/iqcc/guided-analysis'
import { getPressureTestPrompt, type PressureTestPerspective } from '@/lib/iqcc/pressure-test'
import {
  getStep4ReportPrompt, getStep9ReportPrompt, getStep10ReportPrompt,
  getStep2ScanPrompt, getStep5BenchmarkPrompt,
} from '@/lib/iqcc/report-generation'

export async function POST(request: NextRequest) {
  if (!MOCK_MODE) {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: '未登入' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const body = await request.json()
  const { projectId, stepNumber, message, mode = 'freeform', metadata } = body

  if (!projectId || !message) {
    return new Response(JSON.stringify({ success: false, error: '缺少必要參數' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Load project & step data
  let project: { name: string; circleName: string; department: string; themeType: string | null } | null = null
  let stepData: Record<string, unknown> | null = null
  let step4Data: Record<string, unknown> | null = null
  let step5Data: Record<string, unknown> | null = null

  if (MOCK_MODE) {
    const p = mockDb.getProject(projectId)
    if (p) project = { name: p.name, circleName: p.circleName, department: p.department, themeType: p.themeType ?? null }
    if (stepNumber) stepData = mockDb.getStep(projectId, stepNumber).data as Record<string, unknown>
    step4Data = mockDb.getStep(projectId, 4).data as Record<string, unknown>
    step5Data = mockDb.getStep(projectId, 5).data as Record<string, unknown>
  } else {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, circleName: true, department: true, themeType: true },
    })
    if (stepNumber) {
      const step = await prisma.step.findUnique({
        where: { projectId_stepNumber: { projectId, stepNumber } },
        select: { data: true },
      })
      stepData = step?.data as Record<string, unknown> | null
    }
    const s4 = await prisma.step.findUnique({ where: { projectId_stepNumber: { projectId, stepNumber: 4 } }, select: { data: true } })
    step4Data = s4?.data as Record<string, unknown> | null
    const s5 = await prisma.step.findUnique({ where: { projectId_stepNumber: { projectId, stepNumber: 5 } }, select: { data: true } })
    step5Data = s5?.data as Record<string, unknown> | null
  }

  const projectContext = project
    ? `【專案】${project.name}（${project.circleName}・${project.department}）\n【類型】${project.themeType === 'reduction' ? '降低類' : '提升類'}`
    : ''

  // Build system prompt based on mode
  let systemPrompt: string

  switch (mode) {
    case 'guided_analysis': {
      const stage = metadata?.stage || 1
      if (stage === 1) {
        systemPrompt = getStage1Prompt(projectContext, step4Data)
      } else if (stage === 2) {
        systemPrompt = getStage2Prompt(
          projectContext,
          metadata?.currentCause || '',
          metadata?.depth || 0,
          metadata?.previousAnswers || []
        )
      } else {
        const rootCauses = metadata?.rootCauses || []
        systemPrompt = getStage3Prompt(projectContext, step4Data, rootCauses)
      }
      break
    }
    case 'pressure_test': {
      const perspective = (metadata?.perspective || 'verifier') as PressureTestPerspective
      const countermeasure = metadata?.countermeasure || { what: '', why: '', who: '', how: '' }
      systemPrompt = getPressureTestPrompt(
        perspective,
        projectContext,
        countermeasure,
        metadata?.rootCauseName || '',
        metadata?.round || 1,
        metadata?.previousReview || null
      )
      break
    }
    case 'report_generation': {
      if (stepNumber === 4) {
        systemPrompt = getStep4ReportPrompt(projectContext, step4Data || {})
      } else if (stepNumber === 9) {
        const step9Data = stepData || {}
        systemPrompt = getStep9ReportPrompt(projectContext, step4Data || {}, step5Data || {}, step9Data)
      } else if (stepNumber === 10) {
        systemPrompt = getStep10ReportPrompt(projectContext, stepData || {}, metadata?.documentType || 'sop')
      } else {
        systemPrompt = getStepPrompt(stepNumber, project, stepData)
      }
      break
    }
    case 'background_scan': {
      if (stepNumber === 2) {
        systemPrompt = getStep2ScanPrompt(projectContext, metadata?.topicName || '')
      } else if (stepNumber === 5) {
        systemPrompt = getStep5BenchmarkPrompt(projectContext, (stepData as Record<string, unknown>)?.current_value as number | null, metadata?.topicName || '')
      } else {
        systemPrompt = getStepPrompt(stepNumber, project, stepData)
      }
      break
    }
    default:
      systemPrompt = getStepPrompt(stepNumber, project, stepData)
  }

  // Load chat history
  let history: Array<{ role: string; content: string }> = []
  if (MOCK_MODE) {
    history = mockDb.getChatHistory(projectId, stepNumber, mode)
    mockDb.addChatMessage(projectId, stepNumber, 'user', message, mode)
  } else {
    const dbHistory = await prisma.chatHistory.findMany({
      where: { projectId, stepNumber, mode },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: { role: true, content: true },
    })
    history = dbHistory

    const user = await getCurrentUser()
    if (user) {
      await prisma.chatHistory.create({
        data: { projectId, stepNumber, userId: user.id, role: 'user', content: message, mode },
      })
    }
  }

  const messages = [
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: message },
  ]

  // Stream response
  const stream = streamChat({ messages, systemPrompt, mode })
  const [responseStream, collectStream] = stream.tee()

  // Save assistant response in background
  collectFullResponse(collectStream).then(async (fullText) => {
    if (!fullText) return
    if (MOCK_MODE) {
      mockDb.addChatMessage(projectId, stepNumber, 'assistant', fullText, mode)
    } else {
      const user = await getCurrentUser()
      if (user) {
        await prisma.chatHistory.create({
          data: { projectId, stepNumber, userId: user.id, role: 'assistant', content: fullText, mode },
        })
      }
    }
  })

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function collectFullResponse(stream: ReadableStream<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder()
  const reader = stream.getReader()
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data)
          if (parsed.text) fullText += parsed.text
        } catch { /* skip */ }
      }
    }
  } catch { /* stream error */ }

  return fullText
}
