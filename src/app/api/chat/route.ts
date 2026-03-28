import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { streamChat } from '@/lib/claude'
import { getStepPrompt } from '@/lib/prompts/step-prompts'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: '未登入' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { projectId, stepNumber, message, mode = 'freeform' } = await request.json()

  if (!projectId || !message) {
    return new Response(JSON.stringify({ success: false, error: '缺少必要參數' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Load project context for system prompt
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true, circleName: true, department: true, themeType: true },
  })

  // Load step data for context injection
  let stepData = null
  if (stepNumber) {
    const step = await prisma.step.findUnique({
      where: { projectId_stepNumber: { projectId, stepNumber } },
      select: { data: true },
    })
    stepData = step?.data
  }

  // Build system prompt
  const systemPrompt = getStepPrompt(stepNumber, project, stepData)

  // Load chat history
  const history = await prisma.chatHistory.findMany({
    where: { projectId, stepNumber, mode },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { role: true, content: true },
  })

  const messages = [
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: message },
  ]

  // Save user message
  await prisma.chatHistory.create({
    data: {
      projectId,
      stepNumber,
      userId: user.id,
      role: 'user',
      content: message,
      mode,
    },
  })

  // Stream response and collect for saving
  const stream = streamChat({ messages, systemPrompt, mode })

  // Tee the stream: one for response, one for collecting
  const [responseStream, collectStream] = stream.tee()

  // Collect full response in background
  collectFullResponse(collectStream).then(async (fullText) => {
    if (fullText) {
      await prisma.chatHistory.create({
        data: {
          projectId,
          stepNumber,
          userId: user.id,
          role: 'assistant',
          content: fullText,
          mode,
        },
      })
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
