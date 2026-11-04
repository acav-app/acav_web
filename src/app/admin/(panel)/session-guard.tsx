'use client'

import { useEffect, useState } from 'react'

export default function AdminSessionGuard() {
  const [connectionWarning, setConnectionWarning] = useState(false)

  useEffect(() => {
    let active = true
    let pending = false
    let controller: AbortController | undefined
    async function checkSession() {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      controller = new AbortController()
      const timeout = window.setTimeout(() => controller?.abort(), 15_000)
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal })
        if (!active) return
        if (response.status === 401 || response.status === 403) {
          const next = window.location.pathname + window.location.search
          window.location.replace(`/admin/login?reason=${response.status === 403 ? 'forbidden' : 'expired'}&next=${encodeURIComponent(next)}`)
          return
        }
        setConnectionWarning(!response.ok)
      } catch {
        // Never sign out or discard local form state because of an outage.
        if (active) setConnectionWarning(true)
      } finally {
        window.clearTimeout(timeout)
        pending = false
      }
    }
    const onFocus = () => { void checkSession() }
    const interval = window.setInterval(onFocus, 60_000)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    void checkSession()
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  return connectionWarning ? <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">No pudimos verificar tu sesión. Revisá tu conexión; tus cambios locales se mantienen.</p> : null
}
