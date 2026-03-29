import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export function middleware(request: NextRequest) {
  // Mock mode: bypass all auth checks
  if (process.env.MOCK_MODE === 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check for auth cookie existence (full JWT verification happens in API routes)
  const token = request.cookies.get('qcc_token')?.value
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Basic JWT structure check (3 parts separated by dots)
  const parts = token.split('.')
  if (parts.length !== 3) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Token 無效' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Decode payload for role check (without signature verification — API routes do full verify)
  try {
    const payload = JSON.parse(atob(parts[1]))

    // Admin routes require qcc_admin or sys_admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (payload.role === 'team_rep') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ success: false, error: '無權限' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Token 無效' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
