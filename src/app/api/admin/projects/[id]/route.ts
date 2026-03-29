import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// PUT /api/admin/projects/:id — admin update (featured, public)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (MOCK_MODE) {
    return NextResponse.json({ success: true })
  }

  try {
    await requireRole(['qcc_admin', 'sys_admin'])
  } catch {
    return NextResponse.json({ success: false, error: '無權限' }, { status: 403 })
  }

  const body = await request.json()
  const { isFeatured, isPublic } = body

  await prisma.project.update({
    where: { id },
    data: {
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isPublic !== undefined && { isPublic }),
    },
  })

  return NextResponse.json({ success: true })
}
