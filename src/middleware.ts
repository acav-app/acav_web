import { NextResponse, type NextRequest } from 'next/server'

import { SESSION_COOKIE } from '@/lib/admin/session-config'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
  const isLogin = pathname === '/admin/login'

  if (!hasSession && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  // Cookie presence is not authentication. The login page verifies it on the
  // server; redirecting here would trap expired cookies in a login/panel loop.
  const headers = new Headers(request.headers)
  headers.set('x-admin-return-to', pathname + search)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/admin/:path*'],
}
