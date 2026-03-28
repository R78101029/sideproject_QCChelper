import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: '未登入' },
      { status: 401 }
    )
  }
  return NextResponse.json({ success: true, data: user })
}
