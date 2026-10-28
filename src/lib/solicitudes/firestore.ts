import 'server-only'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

let firestore: ReturnType<typeof getFirestore> | null = null

export function solicitudesDb() {
  if (firestore) return firestore
  const name = 'acav-solicitudes-admin'
  const existing = getApps().find((app) => app.name === name)
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY para operar el trámite seguro.')
  }
  const app = existing ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  }, name)
  firestore = getFirestore(app)
  return firestore
}

export { FieldValue, Timestamp }
