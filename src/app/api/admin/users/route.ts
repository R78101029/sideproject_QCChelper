import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { requireRole, hashPassword } from '@/lib/auth'

// GET /api/admin/users — list all users
export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json({ success: true, data: mockDb.getUsers() })
  }

  try {
    await requireRole(['qcc_admin', 'sys_admin'])
  } catch {
    return NextResponse.json({ success: false, error: '無權限' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      department: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: users })
}

// POST /api/admin/users — create user
export async function POST(request: NextRequest) {
  const { username, password, displayName, role, department, email } = await request.json()

  if (!username || !password || !displayName || !role) {
    return NextResponse.json(
      { success: false, error: '請填寫必要欄位' },
      { status: 400 }
    )
  }

  if (MOCK_MODE) {
    const result = mockDb.createUser({ username, displayName, role, department })
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  }

  try {
    await requireRole(['sys_admin'])
  } catch {
    return NextResponse.json({ success: false, error: '無權限' }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json(
      { success: false, error: '帳號已存在' },
      { status: 409 }
    )
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      displayName,
      role,
      department: department || null,
      email: email || null,
    },
  })

  return NextResponse.json({
    success: true,
    data: { id: user.id, username: user.username },
  }, { status: 201 })
}
