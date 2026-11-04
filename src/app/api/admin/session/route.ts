import { NextResponse } from 'next/server'

import { firebaseAdminAuth } from '@/lib/firebase/server'
import { authErrorCode, ForbiddenError, getSessionUser, isInvalidSessionError, SESSION_COOKIE, SESSION_MAX_AGE_MS, isAllowedEmail } from '@/lib/admin/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store, max-age=0' }

function failure(error: string, code: string, status: number, clearCookie = false) {
  const response = NextResponse.json({ error, code }, { status, headers })
  if (clearCookie) response.cookies.delete(SESSION_COOKIE)
  return response
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return (!origin || origin === new URL(request.url).origin) && request.headers.get('sec-fetch-site') !== 'cross-site'
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return failure('Tu sesión venció. Volvé a ingresar.', 'SESSION_EXPIRED', 401, true)
    return NextResponse.json({ ok: true, email: user.email ?? null, expiresAt: user.exp * 1000 }, { headers })
  } catch (error) {
    if (error instanceof ForbiddenError) return failure(error.message, 'ACCESS_DENIED', 403, true)
    return failure('No se pudo verificar tu sesión. Intentá de nuevo en unos instantes.', 'AUTH_UNAVAILABLE', 503)
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return failure('Origen no autorizado.', 'INVALID_ORIGIN', 403)
  let idToken: unknown
  try {
    idToken = (await request.json()).idToken
  } catch {
    return failure('El pedido de acceso no es válido.', 'INVALID_REQUEST', 400)
  }
  if (typeof idToken !== 'string' || !idToken || idToken.length > 8192) return failure('Falta un token de acceso válido.', 'INVALID_TOKEN', 400)

  try {
    const auth = await firebaseAdminAuth()
    const decoded = await auth.verifyIdToken(idToken, true)
    if (!isAllowedEmail(decoded.email)) return failure('Esta cuenta no tiene acceso al panel.', 'ACCESS_DENIED', 403, true)
    // A stolen old ID token must not be exchanged for a fresh five-day session.
    if (!decoded.auth_time || Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return failure('Volvé a ingresar tu email y contraseña para iniciar una sesión nueva.', 'RECENT_LOGIN_REQUIRED', 401, true)
    }
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS })
    const response = NextResponse.json({ ok: true, email: decoded.email ?? null }, { headers })
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    })
    return response
  } catch (error) {
    if (isInvalidSessionError(error)) {
      const code = authErrorCode(error)
      return failure('El acceso caducó o fue revocado. Volvé a ingresar.', code === 'auth/id-token-expired' ? 'TOKEN_EXPIRED' : 'INVALID_SESSION', 401, true)
    }
    console.error('[admin-session-create]', authErrorCode(error) || 'service-unavailable')
    return failure('El servicio de acceso no está disponible en este momento. Intentá de nuevo.', 'AUTH_UNAVAILABLE', 503)
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return failure('Origen no autorizado.', 'INVALID_ORIGIN', 403)
  const response = NextResponse.json({ ok: true }, { headers })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
