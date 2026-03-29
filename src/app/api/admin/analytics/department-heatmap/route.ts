import { NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics/department-heatmap
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({
      success: true,
      data: { departments: ['護理部'], years: [2026], matrix: [[1]] },
    })
  }

  const projects = await prisma.project.findMany({
    select: { department: true, createdAt: true, improvementRate: true },
  })

  const departments = [...new Set(projects.map((p) => p.department))].sort()
  const years = [...new Set(projects.map((p) => p.createdAt.getFullYear()))].sort()

  const matrix = departments.map((dept) =>
    years.map((year) => {
      const matched = projects.filter((p) => p.department === dept && p.createdAt.getFullYear() === year)
      return matched.length
    })
  )

  return NextResponse.json({ success: true, data: { departments, years, matrix } })
}
