import 'server-only'

import { cookies } from 'next/headers'
import { verifyIdTokenREST, type DecodedIdTokenREST } from '@/lib/firebase/admin'

export const SESSION_COOKIE = 'acav_admin_session'
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000 // 5 días

/** Lista blanca opcional de emails habilitados, separada por comas. */
function allowedEmails(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedEmail(email?: string | null): boolean {
  const list = allowedEmails()
  if (!list.length) return true
  return !!email && list.includes(email.toLowerCase())
}

export async function getSessionUser(): Promise<DecodedIdTokenREST | null> {
  const cookie = cookies().get(SESSION_COOKIE)?.value
  if (!cookie) return null

  try {
    const decoded = await verifyIdTokenREST(cookie)
    return decoded && isAllowedEmail(decoded.email) ? decoded : null
  } catch {
    return null
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado')
    this.name = 'UnauthorizedError'
  }
}

export async function requireSessionUser(): Promise<DecodedIdTokenREST> {
  const user = await getSessionUser()
  if (!user) throw new UnauthorizedError()
  return user
}
