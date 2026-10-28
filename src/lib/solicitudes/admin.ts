import 'server-only'

import { UnauthorizedError, requireSessionUser } from '@/lib/admin/session'

export async function requireIngresoAdmin() {
  const allowlist = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  // Sensitive DNI, fiscal documents and signature audit data must never be exposed
  // when the production allowlist has not been configured.
  if (!allowlist.length) throw new UnauthorizedError()
  const user = await requireSessionUser()
  if (!user.email || !allowlist.includes(user.email.toLowerCase())) throw new UnauthorizedError()
  return user
}
