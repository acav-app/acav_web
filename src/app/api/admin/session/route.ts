import { NextResponse } from 'next/server'

import { verifyIdTokenREST } from '@/lib/firebase/admin'
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, isAllowedEmail } from '@/lib/admin/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string }
    if (!idToken) {
      return NextResponse.json({ error: 'Falta el token de acceso.' }, { status: 400 })
    }

    const decoded = await verifyIdTokenREST(idToken)

    if (!decoded || !isAllowedEmail(decoded.email)) {
      return NextResponse.json({ error: 'Esta cuenta no tiene acceso al panel.' }, { status: 403 })
    }

    const response = NextResponse.json({ ok: true, email: decoded.email ?? null })

    // Guardar el idToken del cliente directamente en la cookie de sesión sin crear una cookie de sesión del Admin SDK
    response.cookies.set(SESSION_COOKIE, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    })

    return response
  } catch (error) {
    console.error('[admin-session] Error al iniciar sesión:', error instanceof Error ? error.message : error, error)
    return NextResponse.json({ error: 'No se pudo iniciar sesión.' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
