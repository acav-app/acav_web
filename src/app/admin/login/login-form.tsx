'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import { signOut } from 'firebase/auth'

import { firebaseAuth } from '@/lib/firebase/client'
import { adminReturnPath } from '@/lib/admin/session-config'
import { resetAdminSession, startAdminSession } from '@/lib/admin/session-client'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
  'auth/network-request-failed': 'Sin conexión con el servidor de autenticación.',
  'auth/user-token-expired': 'El acceso anterior venció. Volvé a ingresar con tu email y contraseña.',
  'auth/invalid-user-token': 'El acceso anterior ya no es válido. Volvé a ingresar.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada. Contactá a la administración.',
}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [notice, setNotice] = useState<string | null>(searchParams.get('reason') === 'expired'
    ? 'Tu sesión venció. Ingresá nuevamente; no hace falta borrar la caché.'
    : searchParams.get('reason') === 'forbidden' ? 'Esta cuenta no tiene acceso al panel. Ingresá con una cuenta autorizada.' : null)

  const nextParam = searchParams.get('next')
  const redirectTo = adminReturnPath(nextParam)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15_000)
    let active = true
    async function checkPreviousSession() {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal })
        if (!active) return
        if (response.ok) {
          window.location.replace(redirectTo)
          return
        }
        if (response.status === 401 || response.status === 403) {
          // The endpoint removes only the invalid ACAV cookie. Firebase clears
          // its own old auth state without touching any other browser storage.
          const auth = firebaseAuth()
          await auth.authStateReady()
          if (!active) return
          await signOut(auth)
          if (response.status === 403) setError('Esta cuenta no tiene acceso al panel. Usá una cuenta autorizada.')
        } else {
          setError('No pudimos verificar la sesión anterior. Podés volver a intentar sin borrar la caché.')
        }
      } catch {
        if (active) setError('No se pudo conectar con el servicio de acceso. Revisá tu conexión.')
      } finally {
        window.clearTimeout(timeout)
        if (active) setChecking(false)
      }
    }
    void checkPreviousSession()
    return () => { active = false; window.clearTimeout(timeout); controller.abort() }
  }, [redirectTo])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading || checking || resetting) return
    setError(null)
    setNotice(null)
    setLoading(true)

    try {
      await startAdminSession(email, password)
      // A full navigation drops stale Next.js router data from the old session.
      window.location.replace(redirectTo)
    } catch (err) {
      const code = (err as { code?: string })?.code
      setError(
        (code && ERROR_MESSAGES[code]) ||
          (err instanceof TypeError || (err instanceof Error && ['TimeoutError', 'AbortError'].includes(err.name))
            ? 'No se pudo conectar con el servicio de acceso. Revisá tu conexión e intentá de nuevo.'
            : err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
      )
      setLoading(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    setError(null)
    try {
      await resetAdminSession()
      setPassword('')
      setNotice('Acceso restablecido. Ingresá nuevamente con tu cuenta; no se borró la caché del navegador.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo restablecer el acceso.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {notice ? <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</p> : null}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <div className="relative">
          <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@acav.com.ar"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Contraseña
        </label>
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading || checking || resetting}
        className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checking ? 'Verificando acceso…' : loading ? 'Ingresando…' : 'Ingresar'}
      </button>
      <div className="border-t border-slate-100 pt-4 text-center">
        <p className="mb-2 text-xs leading-5 text-slate-500">¿El acceso quedó bloqueado o la sesión anterior no responde?</p>
        <button type="button" onClick={() => void handleReset()} disabled={loading || checking || resetting} className="text-sm font-semibold text-primary-600 underline-offset-4 hover:underline disabled:cursor-wait disabled:opacity-60">
          {resetting ? 'Restableciendo acceso…' : 'Restablecer acceso'}
        </button>
      </div>
    </form>
  )
}
