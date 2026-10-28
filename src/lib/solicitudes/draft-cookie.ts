import 'server-only'

import type { NextResponse } from 'next/server'

export function draftCookieName(id: string) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new Error('Identificador de borrador inválido.')
  return `acav_ingreso_${id}`
}

export function draftTokenFromRequest(request: Request, id: string) {
  const name = draftCookieName(id)
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : ''
}

export function setDraftCookie(response: NextResponse, id: string, token: string, maxAge = 60 * 60 * 24 * 30) {
  response.cookies.set(draftCookieName(id), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: `/api/solicitudes/ingreso/${id}`,
    maxAge,
  })
}
