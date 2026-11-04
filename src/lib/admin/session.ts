import 'server-only'

import { cookies } from 'next/headers'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { firebaseAdminAuth } from '@/lib/firebase/server'
import { SESSION_COOKIE } from './session-config'

export { SESSION_COOKIE, SESSION_MAX_AGE_MS } from './session-config'

export function authErrorCode(error: unknown): string {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : ''
}

export function isInvalidSessionError(error: unknown): boolean {
  return [
    'auth/session-cookie-expired', 'auth/session-cookie-revoked', 'auth/invalid-session-cookie',
    'auth/argument-error', 'auth/invalid-id-token', 'auth/id-token-expired', 'auth/id-token-revoked',
    'auth/user-disabled', 'auth/user-not-found',
  ].includes(authErrorCode(error))
}

export class AuthServiceUnavailableError extends Error {
  constructor() {
    super('No se pudo verificar el acceso en este momento. Revisá tu conexión e intentá de nuevo.')
    this.name = 'AuthServiceUnavailableError'
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('Esta cuenta no tiene acceso a esta sección del panel.')
    this.name = 'ForbiddenError'
  }
}

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

export async function getSessionUser(): Promise<DecodedIdToken | null> {
  const cookie = cookies().get(SESSION_COOKIE)?.value
  if (!cookie) return null

  try {
    const auth = await firebaseAdminAuth()
    const decoded = await auth.verifySessionCookie(cookie, true)
    if (!isAllowedEmail(decoded.email)) throw new ForbiddenError()
    return decoded
  } catch (error) {
    if (error instanceof ForbiddenError) throw error
    if (isInvalidSessionError(error)) return null
    console.error('[admin-session-verify]', authErrorCode(error) || 'service-unavailable')
    throw new AuthServiceUnavailableError()
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado')
    this.name = 'UnauthorizedError'
  }
}

export async function requireSessionUser(): Promise<DecodedIdToken> {
  const user = await getSessionUser()
  if (!user) throw new UnauthorizedError()
  return user
}
