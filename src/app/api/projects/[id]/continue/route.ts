import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST /api/projects/:id/continue — create continuation project
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: { id: crypto.randomUUID() } }, { status: 201 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const original = await prisma.project.findUnique({
    where: { id },
    select: {
      name: true,
      circleName: true,
      department: true,
      themeType: true,
      topicCategory: true,
      postRate: true,
    },
  })

  if (!original) {
    return NextResponse.json({ success: false, error: '原專案不存在' }, { status: 404 })
  }

  const newProject = await prisma.project.create({
    data: {
      name: `${original.name}（延續）`,
      circleName: original.circleName,
      department: original.department,
      themeType: original.themeType,
      topicCategory: original.topicCategory,
      continuationOf: id,
      currentRate: original.postRate, // carry forward post-improvement as new baseline
      createdBy: user.id,
      userCircles: {
        create: { userId: user.id, memberRole: 'leader' },
      },
    },
  })

  return NextResponse.json({ success: true, data: { id: newProject.id } }, { status: 201 })
}
