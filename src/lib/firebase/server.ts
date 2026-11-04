import 'server-only'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export function firebaseAdminApp() {
  const name = 'acav-solicitudes-admin'
  const existing = getApps().find((app) => app.name === name)
  if (existing) return existing
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Faltan las credenciales de Firebase Admin en el servidor.')
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, name)
}

export function firebaseAdminAuth() {
  return getAuth(firebaseAdminApp())
}
