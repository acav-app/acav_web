'use client'

import { inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'

async function exchangeToken(idToken: string) {
  const response = await fetch('/api/admin/session', {
    method: 'POST', cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }),
    signal: AbortSignal.timeout(20_000),
  })
  const body = await response.json().catch(() => ({}))
  return { response, body }
}

export async function startAdminSession(email: string, password: string) {
  const auth = firebaseAuth()
  await auth.authStateReady()
  // The HttpOnly server cookie owns the session. Do not persist one-hour ID
  // tokens or refresh tokens in localStorage/IndexedDB for the admin login.
  await setPersistence(auth, inMemoryPersistence)
  await signOut(auth)
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
    let result = await exchangeToken(await credential.user.getIdToken(true))
    if (result.response.status === 401 && result.body.code === 'TOKEN_EXPIRED') {
      // Recover from an expiry during exchange once, never in an endless loop.
      result = await exchangeToken(await credential.user.getIdToken(true))
    }
    if (!result.response.ok) throw new Error(result.body.error ?? 'No se pudo iniciar sesión.')
  } finally {
    await signOut(auth).catch(() => undefined)
  }
}

export async function resetAdminSession() {
  const response = await fetch('/api/admin/session', {
    method: 'DELETE', cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error('No se pudo restablecer el acceso. Revisá tu conexión e intentá de nuevo.')
  const auth = firebaseAuth()
  await auth.authStateReady()
  await signOut(auth)
}
