/**
 * Importa socios desde estructura_socios.json a Firestore.
 * Uso: node scripts/import-socios.mjs [ruta-json]
 */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { config } from 'dotenv'
import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

config({ path: '.env.local' })
config()

const source = resolve(process.argv[2] ?? 'estructura_socios.json')

function parseSocios(raw) {
  const text = raw.trim()
  // El archivo puede venir como fragmento (lista de objetos sin corchetes).
  const json = text.startsWith('[') ? text : `[${text}]`
  const parsed = JSON.parse(json)
  return Array.isArray(parsed) ? parsed : parsed.socios ?? []
}

function normalize(entry) {
  const s = (value) => (typeof value === 'string' ? value.trim() : '')
  return {
    legajo: s(entry.legajo),
    nombre: s(entry.nombre),
    logo: s(entry.logo),
    contacto: {
      email: s(entry.contacto?.email),
      whatsapp: s(entry.contacto?.whatsapp),
    },
    delegado: { email: s(entry.delegado?.email) },
    subdelegado: { email: s(entry.subdelegado?.email) },
    activo: true,
  }
}

// ID determinista para que reejecutar el script actualice en vez de duplicar.
function docId(socio) {
  return `${socio.nombre}-${socio.legajo}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

async function main() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Faltan las credenciales de Firebase Admin en .env.local')
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })

  const db = getFirestore()
  const socios = parseSocios(await readFile(source, 'utf8'))
    .map(normalize)
    .filter((socio) => socio.nombre)

  let batch = db.batch()
  let pending = 0
  let total = 0

  for (const socio of socios) {
    batch.set(
      db.collection('socios').doc(docId(socio)),
      {
        ...socio,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    pending += 1
    total += 1

    if (pending === 400) {
      await batch.commit()
      batch = db.batch()
      pending = 0
    }
  }

  if (pending) await batch.commit()

  console.log(`Importados ${total} socios desde ${source}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
