import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/projects/:id/benefit
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: null })
  }

  const benefit = await prisma.projectBenefit.findUnique({
    where: { projectId: id },
  })

  return NextResponse.json({ success: true, data: benefit })
}

// PUT /api/projects/:id/benefit
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const { benefitType, description, estimatedValue, estimatedUnit, isAiEstimated } = await request.json()

  const benefit = await prisma.projectBenefit.upsert({
    where: { projectId: id },
    create: {
      projectId: id,
      benefitType: benefitType || 'other',
      description,
      estimatedValue: estimatedValue != null ? estimatedValue : undefined,
      estimatedUnit: estimatedUnit || undefined,
      isAiEstimated: isAiEstimated || false,
      createdBy: user.id,
    },
    update: {
      benefitType: benefitType || undefined,
      description,
      estimatedValue: estimatedValue != null ? estimatedValue : undefined,
      estimatedUnit: estimatedUnit || undefined,
      isAiEstimated: isAiEstimated || false,
    },
  })

  return NextResponse.json({ success: true, data: benefit })
}
