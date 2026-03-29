import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// GET /api/projects/:id/research-export — export research data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({
      success: true,
      data: {
        project: { id, exportedAt: new Date().toISOString() },
        timeline: [],
        aiInteractions: { total: 0, byMode: {} },
        causalVerification: [],
        pressureTest: [],
      },
    })
  }

  try {
    await requireRole(['qcc_admin', 'sys_admin'])
  } catch {
    return NextResponse.json({ success: false, error: '無權限' }, { status: 403 })
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      circleName: true,
      department: true,
      themeType: true,
      currentRate: true,
      targetRate: true,
      postRate: true,
      improvementRate: true,
      goalAchievementRate: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!project) {
    return NextResponse.json({ success: false, error: '專案不存在' }, { status: 404 })
  }

  // Step timeline
  const steps = await prisma.step.findMany({
    where: { projectId: id },
    select: { stepNumber: true, status: true, createdAt: true, updatedAt: true, completedAt: true },
    orderBy: { stepNumber: 'asc' },
  })

  // AI interaction stats
  const chatStats = await prisma.chatHistory.groupBy({
    by: ['mode'],
    where: { projectId: id },
    _count: { id: true },
  })

  const totalChats = await prisma.chatHistory.count({ where: { projectId: id } })

  // Step 6 causal verification data
  const step6 = await prisma.step.findUnique({
    where: { projectId_stepNumber: { projectId: id, stepNumber: 6 } },
    select: { data: true },
  })
  const step6Data = step6?.data as Record<string, unknown> | null
  const causalVerification = step6Data?.causal_verification || []

  // Step 7 pressure test data
  const step7 = await prisma.step.findUnique({
    where: { projectId_stepNumber: { projectId: id, stepNumber: 7 } },
    select: { data: true },
  })
  const step7Data = step7?.data as Record<string, unknown> | null
  const pressureTest = step7Data?.pressure_test || []

  // Step change log
  const changeLogs = await prisma.stepChangeLog.findMany({
    where: { projectId: id },
    select: { stepNumber: true, changeType: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    success: true,
    data: {
      project,
      timeline: steps,
      changeLogs,
      aiInteractions: {
        total: totalChats,
        byMode: Object.fromEntries(chatStats.map((s) => [s.mode, s._count.id])),
      },
      causalVerification,
      pressureTest,
      exportedAt: new Date().toISOString(),
    },
  })
}
