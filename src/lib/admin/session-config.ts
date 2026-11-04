export const SESSION_COOKIE = 'acav_admin_session'
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000 // 5 días, sin renovación indefinida.
export const ADMIN_HOME = '/admin/banner'

export function adminReturnPath(value?: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/admin/') || /[\\\u0000-\u001f\u007f]/.test(value)) return ADMIN_HOME
  try {
    const url = new URL(value, 'https://admin.invalid')
    const pathname = decodeURIComponent(url.pathname).replace(/\/+/g, '/')
    if (url.origin !== 'https://admin.invalid' || !pathname.startsWith('/admin/') || /[\\\u0000-\u001f\u007f]/.test(pathname) || /^\/admin\/login(?:\/|$)/i.test(pathname)) return ADMIN_HOME
    return url.pathname + url.search + url.hash
  } catch {
    return ADMIN_HOME
  }
}
