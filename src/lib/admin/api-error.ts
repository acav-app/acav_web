import { NextResponse } from 'next/server'

import { AuthServiceUnavailableError, ForbiddenError, UnauthorizedError, SESSION_COOKIE } from '@/lib/admin/session'

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    const response = NextResponse.json({ error: 'Tu sesión venció. Volvé a ingresar.', code: 'SESSION_EXPIRED' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message, code: 'ACCESS_DENIED' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  if (error instanceof AuthServiceUnavailableError) return NextResponse.json({ error: error.message, code: 'AUTH_UNAVAILABLE' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })

  const message = error instanceof Error ? error.message : 'Error inesperado'
  console.error('[admin-api]', error)
  return NextResponse.json({ error: message }, { status: 400 })
}
