import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/projects/:id — project detail with step statuses
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { orderBy: { createdAt: 'asc' } },
      steps: {
        select: { stepNumber: true, status: true, updatedAt: true },
        orderBy: { stepNumber: 'asc' },
      },
    },
  })

  if (!project) {
    return NextResponse.json({ success: false, error: '專案不存在' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: project })
}

// PUT /api/projects/:id — update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, circleName, department, periodStart, periodEnd, themeType, topicCategory, status } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(circleName !== undefined && { circleName }),
        ...(department !== undefined && { department }),
        ...(periodStart !== undefined && { periodStart: periodStart ? new Date(periodStart) : null }),
        ...(periodEnd !== undefined && { periodEnd: periodEnd ? new Date(periodEnd) : null }),
        ...(themeType !== undefined && { themeType }),
        ...(topicCategory !== undefined && { topicCategory }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ success: true, data: { id: project.id } })
  } catch {
    return NextResponse.json(
      { success: false, error: '更新專案失敗' },
      { status: 500 }
    )
  }
}
