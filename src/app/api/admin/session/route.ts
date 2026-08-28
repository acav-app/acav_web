import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { adminAuth } from '@/lib/firebase/admin'
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, isAllowedEmail } from '@/lib/admin/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string }
    if (!idToken) {
      return NextResponse.json({ error: 'Falta el token de acceso.' }, { status: 400 })
    }

    const decoded = await adminAuth().verifyIdToken(idToken, true)

    if (!isAllowedEmail(decoded.email)) {
      return NextResponse.json({ error: 'Esta cuenta no tiene acceso al panel.' }, { status: 403 })
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    })

    cookies().set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    })

    return NextResponse.json({ ok: true, email: decoded.email ?? null })
  } catch (error) {
    console.error('[admin-session]', error)
    return NextResponse.json({ error: 'No se pudo iniciar sesión.' }, { status: 401 })
  }
}

export async function DELETE() {
  cookies().delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
