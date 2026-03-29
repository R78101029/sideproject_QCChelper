import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/projects/:id/follow-up
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [] })
  }

  const followUps = await prisma.followUp.findMany({
    where: { projectId: id },
    orderBy: { scheduledDate: 'asc' },
  })

  return NextResponse.json({ success: true, data: followUps })
}

// POST /api/projects/:id/follow-up — create or auto-generate follow-ups
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [] }, { status: 201 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const body = await request.json()

  if (body.autoGenerate) {
    // Auto-generate 3/6/12 month follow-ups from project end date
    const project = await prisma.project.findUnique({
      where: { id },
      select: { periodEnd: true },
    })

    if (!project?.periodEnd) {
      return NextResponse.json({ success: false, error: '專案尚未設定結束日期' }, { status: 400 })
    }

    const baseDate = new Date(project.periodEnd)
    const types: Array<{ type: 'three_month' | 'six_month' | 'twelve_month'; months: number }> = [
      { type: 'three_month', months: 3 },
      { type: 'six_month', months: 6 },
      { type: 'twelve_month', months: 12 },
    ]

    const followUps = await Promise.all(
      types.map(({ type, months }) => {
        const scheduledDate = new Date(baseDate)
        scheduledDate.setMonth(scheduledDate.getMonth() + months)
        return prisma.followUp.create({
          data: {
            projectId: id,
            followUpType: type,
            scheduledDate,
            createdBy: user.id,
          },
        })
      })
    )

    return NextResponse.json({ success: true, data: followUps }, { status: 201 })
  }

  // Manual follow-up update
  const { followUpId, followUpRate, isSustained, notes } = body

  if (!followUpId) {
    return NextResponse.json({ success: false, error: '缺少追蹤 ID' }, { status: 400 })
  }

  const updated = await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      actualDate: new Date(),
      status: 'completed',
      followUpRate: followUpRate != null ? followUpRate : undefined,
      isSustained: isSustained != null ? isSustained : undefined,
      notes: notes || undefined,
      createdBy: user.id,
    },
  })

  return NextResponse.json({ success: true, data: updated })
}
