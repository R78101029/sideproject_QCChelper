import { NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'

// GET /api/knowledge/countermeasures — aggregate effective countermeasures
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [] })
  }

  const steps = await prisma.step.findMany({
    where: {
      stepNumber: 7,
      project: { status: 'completed', isPublic: true },
    },
    select: {
      data: true,
      project: {
        select: { id: true, name: true, topicCategory: true, improvementRate: true },
      },
    },
  })

  const countermeasures: Array<{
    what: string
    how: string
    projectName: string
    projectId: string
    category: string | null
    improvementRate: number | null
  }> = []

  for (const step of steps) {
    const data = step.data as Record<string, unknown> | null
    if (!data?.countermeasures) continue

    const cms = data.countermeasures as Array<{ id: string; what: string; how: string }>
    const adopted = (data.adopted as string[]) || []

    for (const cm of cms) {
      if (adopted.includes(cm.id) && cm.what) {
        countermeasures.push({
          what: cm.what,
          how: cm.how,
          projectName: step.project.name,
          projectId: step.project.id,
          category: step.project.topicCategory,
          improvementRate: step.project.improvementRate ? Number(step.project.improvementRate) : null,
        })
      }
    }
  }

  // Sort by improvement rate desc
  countermeasures.sort((a, b) => (b.improvementRate || 0) - (a.improvementRate || 0))

  return NextResponse.json({ success: true, data: countermeasures })
}
