import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const stepNumber = searchParams.get('stepNumber')
  const mode = searchParams.get('mode') || 'freeform'

  if (MOCK_MODE) {
    const data = mockDb.getChatHistory(id, stepNumber ? parseInt(stepNumber) : null, mode)
    return NextResponse.json({ success: true, data })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const messages = await prisma.chatHistory.findMany({
    where: {
      projectId: id,
      ...(stepNumber ? { stepNumber: parseInt(stepNumber) } : {}),
      mode,
    },
    orderBy: { createdAt: 'asc' },
    select: { role: true, content: true },
    take: 50,
  })

  return NextResponse.json({ success: true, data: messages })
}
