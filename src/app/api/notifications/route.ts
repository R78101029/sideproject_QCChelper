import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/notifications — current user's notifications
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: [], unreadCount: 0 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return NextResponse.json({ success: true, data: notifications, unreadCount })
}

// PUT /api/notifications — mark as read
export async function PUT(request: NextRequest) {
  if (MOCK_MODE) {
    return NextResponse.json({ success: true })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  const { ids } = await request.json()

  if (ids && Array.isArray(ids)) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { isRead: true },
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}
