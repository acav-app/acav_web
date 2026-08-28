import 'server-only'

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

function getAdminApp() {
  const existing = firebase.apps
  if (existing.length) return existing[0]

  return firebase.initializeApp(firebaseConfig)
}

export function adminDb() {
  return getAdminApp().firestore()
}

export interface DecodedIdTokenREST {
  uid: string
  email?: string
}

export async function verifyIdTokenREST(idToken: string): Promise<DecodedIdTokenREST | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) {
    console.error('Falta la variable NEXT_PUBLIC_FIREBASE_API_KEY')
    return null
  }

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      try {
        const errorJson = JSON.parse(errorText)
        console.error('[verifyIdTokenREST] Error de Firebase Auth API:', errorJson.error?.message || errorText)
      } catch {
        console.error('[verifyIdTokenREST] Error HTTP:', res.status, errorText)
      }
      return null
    }

    const data = await res.json()
    const user = data.users?.[0]
    if (!user) return null

    return {
      uid: user.localId,
      email: user.email,
    }
  } catch (error) {
    console.error('[verifyIdTokenREST] Error de red o interno:', error)
    return null
  }
}
