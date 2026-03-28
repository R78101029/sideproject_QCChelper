import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getStepSchema } from '@/lib/step-schemas'

type RouteParams = { params: Promise<{ id: string; n: string }> }

// GET /api/projects/:id/steps/:n — get step data
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id, n } = await params
  const stepNumber = parseInt(n, 10)

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  if (stepNumber < 1 || stepNumber > 10) {
    return NextResponse.json({ success: false, error: '步驟編號無效' }, { status: 400 })
  }

  const step = await prisma.step.findUnique({
    where: { projectId_stepNumber: { projectId: id, stepNumber } },
  })

  if (!step) {
    // Return empty default data from Zod schema
    const schema = getStepSchema(stepNumber)
    const defaultData = schema.parse({})
    return NextResponse.json({
      success: true,
      data: {
        stepNumber,
        status: 'not_started',
        data: defaultData,
        aiDraftFields: null,
      },
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      stepNumber: step.stepNumber,
      status: step.status,
      data: step.data,
      aiDraftFields: step.aiDraftFields,
      updatedAt: step.updatedAt,
    },
  })
}

// PUT /api/projects/:id/steps/:n — update step data (auto-save target)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, n } = await params
  const stepNumber = parseInt(n, 10)

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  if (stepNumber < 1 || stepNumber > 10) {
    return NextResponse.json({ success: false, error: '步驟編號無效' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { data, status } = body

    // Validate with Zod (permissive — don't block saves)
    const schema = getStepSchema(stepNumber)
    const parsed = schema.safeParse(data)
    const validData = parsed.success ? parsed.data : data

    // Upsert step
    const step = await prisma.step.upsert({
      where: { projectId_stepNumber: { projectId: id, stepNumber } },
      create: {
        projectId: id,
        stepNumber,
        status: status || 'in_progress',
        data: validData,
      },
      update: {
        data: validData,
        ...(status && { status }),
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    })

    // KPI sync: step 4 → current_rate, step 5 → target_rate, step 9 → post metrics
    await syncKpi(id, stepNumber, validData)

    // Log change
    await prisma.stepChangeLog.create({
      data: {
        projectId: id,
        stepNumber,
        changeType: 'update',
        changeSummary: `步驟 ${stepNumber} 資料更新`,
        changedBy: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        stepNumber: step.stepNumber,
        status: step.status,
        updatedAt: step.updatedAt,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: '儲存步驟失敗' },
      { status: 500 }
    )
  }
}

// KPI sync logic
async function syncKpi(projectId: string, stepNumber: number, data: Record<string, unknown>) {
  if (stepNumber === 4 && data.current_rate != null) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentRate: data.current_rate as number },
    })
  }

  if (stepNumber === 5 && data.target_value != null) {
    await prisma.project.update({
      where: { id: projectId },
      data: { targetRate: data.target_value as number },
    })
  }

  if (stepNumber === 9) {
    const update: Record<string, unknown> = {}
    if (data.post_rate != null) update.postRate = data.post_rate
    if (data.improvement_rate != null) update.improvementRate = data.improvement_rate
    if (data.goal_achievement_rate != null) update.goalAchievementRate = data.goal_achievement_rate
    if (Object.keys(update).length > 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: update,
      })
    }
  }
}
