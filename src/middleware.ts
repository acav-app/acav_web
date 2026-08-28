import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'acav_admin_session'

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

  if (hasSession && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/blog'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
