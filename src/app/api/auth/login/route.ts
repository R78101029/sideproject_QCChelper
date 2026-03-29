import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { prisma } from '@/lib/prisma'
import { verifyPassword, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '請輸入帳號和密碼' },
        { status: 400 }
      )
    }

    // Mock mode
    if (MOCK_MODE) {
      const user = mockDb.login(username, password)
      if (!user) {
        return NextResponse.json({ success: false, error: '帳號或密碼錯誤' }, { status: 401 })
      }
      await setAuthCookie({ userId: user.id, username: user.username, role: user.role as 'team_rep' | 'qcc_admin' | 'sys_admin' })
      return NextResponse.json({ success: true, data: user })
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    await setAuthCookie({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        department: user.department,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: '登入失敗' },
      { status: 500 }
    )
  }
}
