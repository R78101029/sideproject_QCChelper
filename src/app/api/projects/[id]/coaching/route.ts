import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/projects/:id/coaching
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [] })
  }

  const records = await prisma.coachingRecord.findMany({
    where: { projectId: id },
    include: { suggestions: { orderBy: { createdAt: 'asc' } } },
    orderBy: { coachingDate: 'desc' },
  })

  return NextResponse.json({ success: true, data: records })
}

// POST /api/projects/:id/coaching
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: { id: crypto.randomUUID() } }, { status: 201 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const { coachingDate, advisorName, summary, suggestions } = await request.json()

  const record = await prisma.coachingRecord.create({
    data: {
      projectId: id,
      coachingDate: new Date(coachingDate),
      advisorName,
      summary,
      createdBy: user.id,
      suggestions: {
        create: (suggestions || []).map((s: { content: string; stepNumber?: number }) => ({
          content: s.content,
          stepNumber: s.stepNumber || null,
        })),
      },
    },
    include: { suggestions: true },
  })

  // Create notifications for all circle members
  const members = await prisma.userCircle.findMany({
    where: { projectId: id },
    select: { userId: true },
  })

  if (members.length > 0) {
    await prisma.notification.createMany({
      data: members.map((m) => ({
        userId: m.userId,
        projectId: id,
        type: 'coaching_suggestion' as const,
        title: `收到新的輔導建議`,
        content: `${advisorName} 老師提供了 ${(suggestions || []).length} 條建議`,
        linkUrl: `/project/${id}/coaching`,
      })),
    })
  }

  return NextResponse.json({ success: true, data: record }, { status: 201 })
}
