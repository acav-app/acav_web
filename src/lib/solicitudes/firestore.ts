import 'server-only'

import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

import { firebaseAdminApp } from '@/lib/firebase/server'

let firestore: ReturnType<typeof getFirestore> | null = null

export function solicitudesDb() {
  if (firestore) return firestore
  firestore = getFirestore(firebaseAdminApp())
  return firestore
}

export { FieldValue, Timestamp }
