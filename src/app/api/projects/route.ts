import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/projects — list projects (filtered by role)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const where =
    user.role === 'team_rep'
      ? { userCircles: { some: { userId: user.id } } }
      : {} // admin sees all

  const projects = await prisma.project.findMany({
    where,
    include: {
      steps: { select: { stepNumber: true, status: true } },
      _count: { select: { members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const data = projects.map((p) => {
    const stepsCompleted = p.steps.filter((s) => s.status === 'completed').length
    return {
      id: p.id,
      name: p.name,
      circleName: p.circleName,
      department: p.department,
      status: p.status,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      memberCount: p._count.members,
      stepsCompleted,
      stepsTotal: 10,
      updatedAt: p.updatedAt,
    }
  })

  return NextResponse.json({ success: true, data })
}

// POST /api/projects — create project
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, circleName, department, periodStart, periodEnd, themeType } = body

    if (!name || !circleName || !department) {
      return NextResponse.json(
        { success: false, error: '請填寫專案名稱、圈名及科別' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        circleName,
        department,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        themeType: themeType || null,
        createdBy: user.id,
        userCircles: {
          create: { userId: user.id, memberRole: 'leader' },
        },
      },
    })

    return NextResponse.json({ success: true, data: { id: project.id } }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: '建立專案失敗' },
      { status: 500 }
    )
  }
}
