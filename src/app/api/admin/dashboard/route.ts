import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET() {
  try {
    await requireRole(['qcc_admin', 'sys_admin'])
  } catch {
    return NextResponse.json({ success: false, error: '無權限' }, { status: 403 })
  }

  const stallDays = 14

  const projects = await prisma.project.findMany({
    where: { status: 'active' },
    include: {
      steps: {
        select: { stepNumber: true, status: true, updatedAt: true },
        orderBy: { stepNumber: 'asc' },
      },
      _count: { select: { members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const now = new Date()
  const summary = projects.map((p) => {
    const stepsCompleted = p.steps.filter((s) => s.status === 'completed').length
    const lastUpdate = p.steps.reduce<Date | null>((latest, s) => {
      if (!s.updatedAt) return latest
      if (!latest || s.updatedAt > latest) return s.updatedAt
      return latest
    }, null)

    const daysSinceUpdate = lastUpdate
      ? Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      id: p.id,
      name: p.name,
      circleName: p.circleName,
      department: p.department,
      memberCount: p._count.members,
      stepsCompleted,
      currentRate: p.currentRate,
      targetRate: p.targetRate,
      postRate: p.postRate,
      improvementRate: p.improvementRate,
      goalAchievementRate: p.goalAchievementRate,
      lastUpdate,
      daysSinceUpdate,
      isStalled: daysSinceUpdate != null && daysSinceUpdate >= stallDays,
    }
  })

  const stats = {
    totalActive: projects.length,
    totalCompleted: await prisma.project.count({ where: { status: 'completed' } }),
    stalledCount: summary.filter((s) => s.isStalled).length,
  }

  return NextResponse.json({ success: true, data: { stats, projects: summary } })
}
