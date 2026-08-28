import 'server-only'

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Inicialización perezosa: las credenciales no están disponibles durante el build.
function getAdminApp(): App {
  const existing = getApps()
  if (existing.length) return existing[0]

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  
  // Limpiar y parsear de forma robusta la private key de Firebase
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (privateKey) {
    privateKey = privateKey.trim()
    // Si viene envuelta en comillas como suele pasar en Vercel, las eliminamos
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1)
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1)
    }
    // Reemplazamos los saltos de línea escapados por saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, '\n')

    // Especial para Vercel: si se copió con espacios u otros caracteres invisibles al final de cada línea,
    // limpiamos el inicio y fin de cada línea individual del certificado PEM de forma robusta.
    privateKey = privateKey
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Faltan credenciales de Firebase Admin (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
    )
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  })
}

export function adminAuth() {
  return getAuth(getAdminApp())
}

export function adminDb() {
  return getFirestore(getAdminApp())
}
