import 'server-only'

import { FieldPath } from 'firebase-admin/firestore'

import { solicitudesDb, FieldValue } from './firestore'
import { esBorradorVacioInactivo } from './draft-cleanup-policy'

const PAGE_SIZE = 200
const CONCURRENCY = 10

export async function limpiarBorradoresVacios({ dryRun = false }: { dryRun?: boolean } = {}) {
  const db = solicitudesDb()
  const drafts = db.collection('solicitudes_ingreso')
  const query = drafts.where('estado', '==', 'BORRADOR').orderBy(FieldPath.documentId()).limit(PAGE_SIZE)
  const now = Date.now()
  const result = { dryRun, revisados: 0, candidatos: 0, eliminados: 0, omitidos: 0, errores: 0 }
  let cursor: string | undefined

  while (true) {
    const page = await (cursor ? query.startAfter(cursor) : query).get()
    if (page.empty) break
    result.revisados += page.size
    const candidates = page.docs.filter((doc) => esBorradorVacioInactivo(doc.data(), now))
    result.candidatos += candidates.length

    if (!dryRun) {
      for (let index = 0; index < candidates.length; index += CONCURRENCY) {
        await Promise.all(candidates.slice(index, index + CONCURRENCY).map(async (doc) => {
          try {
            const deleted = await db.runTransaction(async (transaction) => {
              const fresh = await transaction.get(doc.ref)
              const data = fresh.data()
              // Concurrent edits/uploads/submissions force a retry and are rechecked.
              if (!data || !esBorradorVacioInactivo(data, now)) return false
              transaction.create(db.collection('solicitudes_ingreso_limpiezas').doc(), {
                solicitudId: doc.id,
                motivo: 'BORRADOR_VACIO_INACTIVO_48H',
                ultimaActividad: data.updatedAt ?? data.createdAt,
                eliminadoEn: FieldValue.serverTimestamp(),
              })
              // No storage cleanup is needed: references to any files protect drafts.
              transaction.delete(doc.ref)
              return true
            })
            if (deleted) result.eliminados++
            else result.omitidos++
          } catch (error) {
            result.errores++
            console.error('[solicitudes-cleanup-draft]', doc.id, error)
          }
        }))
      }
    }

    cursor = page.docs[page.docs.length - 1].id
    if (page.size < PAGE_SIZE) break
  }

  console.info('[solicitudes-cleanup]', result)
  return result
}
