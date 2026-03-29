import { NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics/trends — yearly trend data
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({
      success: true,
      data: [{ year: 2026, totalProjects: 1, completedProjects: 0, avgImprovement: null, avgAchievement: null }],
    })
  }

  const projects = await prisma.project.findMany({
    select: {
      createdAt: true,
      status: true,
      improvementRate: true,
      goalAchievementRate: true,
    },
  })

  const yearMap = new Map<number, { total: number; completed: number; improvements: number[]; achievements: number[] }>()

  for (const p of projects) {
    const year = p.createdAt.getFullYear()
    if (!yearMap.has(year)) {
      yearMap.set(year, { total: 0, completed: 0, improvements: [], achievements: [] })
    }
    const entry = yearMap.get(year)!
    entry.total++
    if (p.status === 'completed') entry.completed++
    if (p.improvementRate) entry.improvements.push(Number(p.improvementRate))
    if (p.goalAchievementRate) entry.achievements.push(Number(p.goalAchievementRate))
  }

  const data = Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, d]) => ({
      year,
      totalProjects: d.total,
      completedProjects: d.completed,
      avgImprovement: d.improvements.length ? Number((d.improvements.reduce((a, b) => a + b, 0) / d.improvements.length).toFixed(1)) : null,
      avgAchievement: d.achievements.length ? Number((d.achievements.reduce((a, b) => a + b, 0) / d.achievements.length).toFixed(1)) : null,
    }))

  return NextResponse.json({ success: true, data })
}
