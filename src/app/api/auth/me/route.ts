import { NextResponse } from 'next/server'
import { MOCK_MODE, mockDb } from '@/lib/mock-db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  if (MOCK_MODE) {
    const user = mockDb.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
    }
    return NextResponse.json({ success: true, data: user })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: '未登入' },
      { status: 401 }
    )
  }
  return NextResponse.json({ success: true, data: user })
}
