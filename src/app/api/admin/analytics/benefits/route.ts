import { NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics/benefits — aggregate benefits
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: { summary: [], total: 0 } })
  }

  const benefits = await prisma.projectBenefit.findMany({
    include: { project: { select: { name: true, department: true } } },
  })

  const byType: Record<string, { count: number; totalValue: number; descriptions: string[] }> = {}

  for (const b of benefits) {
    if (!byType[b.benefitType]) {
      byType[b.benefitType] = { count: 0, totalValue: 0, descriptions: [] }
    }
    byType[b.benefitType].count++
    if (b.estimatedValue) byType[b.benefitType].totalValue += Number(b.estimatedValue)
    if (b.description) byType[b.benefitType].descriptions.push(b.description)
  }

  const typeLabels: Record<string, string> = {
    time_saving: '時間節省',
    cost_saving: '成本節省',
    quality_improvement: '品質提升',
    satisfaction: '滿意度提升',
    other: '其他',
  }

  const summary = Object.entries(byType).map(([type, data]) => ({
    type,
    label: typeLabels[type] || type,
    ...data,
  }))

  return NextResponse.json({ success: true, data: { summary, total: benefits.length } })
}
