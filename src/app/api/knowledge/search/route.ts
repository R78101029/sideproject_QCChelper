import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'

// GET /api/knowledge/search?q=&department=&category=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const department = searchParams.get('department')
  const category = searchParams.get('category')

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [] })
  }

  const projects = await prisma.project.findMany({
    where: {
      isPublic: true,
      status: 'completed',
      ...(department && { department }),
      ...(category && { topicCategory: category }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { circleName: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      circleName: true,
      department: true,
      topicCategory: true,
      currentRate: true,
      postRate: true,
      improvementRate: true,
      goalAchievementRate: true,
      periodStart: true,
      periodEnd: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ success: true, data: projects })
}
