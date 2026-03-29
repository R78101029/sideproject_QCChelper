import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/projects/:id/steps — all step statuses
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: mockDb.getStepStatuses(id) })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const steps = await prisma.step.findMany({
    where: { projectId: id },
    select: {
      stepNumber: true,
      status: true,
      updatedAt: true,
      completedAt: true,
    },
    orderBy: { stepNumber: 'asc' },
  })

  // Fill in missing steps
  const stepMap = new Map(steps.map((s) => [s.stepNumber, s]))
  const allSteps = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1
    return stepMap.get(n) || { stepNumber: n, status: 'not_started', updatedAt: null, completedAt: null }
  })

  return NextResponse.json({ success: true, data: allSteps })
}
