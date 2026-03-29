import { NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'

// GET /api/knowledge/root-causes — aggregate root causes from completed projects
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [] })
  }

  const steps = await prisma.step.findMany({
    where: {
      stepNumber: 6,
      project: { status: 'completed', isPublic: true },
    },
    select: {
      data: true,
      project: { select: { topicCategory: true, name: true, id: true } },
    },
  })

  const rootCauseMap = new Map<string, { name: string; count: number; categories: string[]; projects: string[] }>()

  for (const step of steps) {
    const data = step.data as Record<string, unknown> | null
    if (!data?.main_categories) continue

    const mainCats = data.main_categories as Array<{
      medium_causes: Array<{ small_causes: Array<{ id: string; name: string }> }>
    }>
    const confirmed = (data.confirmed_root_causes as string[]) || []

    for (const cat of mainCats) {
      for (const med of cat.medium_causes) {
        for (const sc of med.small_causes) {
          if (confirmed.includes(sc.id) && sc.name) {
            const key = sc.name.toLowerCase().trim()
            const existing = rootCauseMap.get(key)
            if (existing) {
              existing.count++
              if (step.project.topicCategory && !existing.categories.includes(step.project.topicCategory)) {
                existing.categories.push(step.project.topicCategory)
              }
              existing.projects.push(step.project.id)
            } else {
              rootCauseMap.set(key, {
                name: sc.name,
                count: 1,
                categories: step.project.topicCategory ? [step.project.topicCategory] : [],
                projects: [step.project.id],
              })
            }
          }
        }
      }
    }
  }

  const results = Array.from(rootCauseMap.values()).sort((a, b) => b.count - a.count)

  return NextResponse.json({ success: true, data: results })
}
