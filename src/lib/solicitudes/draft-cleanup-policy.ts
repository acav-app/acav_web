import { DATOS_INGRESO_VACIOS } from './types'

export const BORRADOR_VACIO_INACTIVIDAD_MS = 2 * 24 * 60 * 60 * 1000

// Compare raw data rather than migrating it: unknown/legacy fields with content
// must also protect a draft from automatic deletion.
function hasContent(value: unknown, initial?: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') {
    const text = value.trim()
    return text !== '' && text !== initial
  }
  if (typeof value === 'number') return String(value) !== initial
  if (Array.isArray(value)) {
    return value.some((item, index) => hasContent(item, Array.isArray(initial) ? initial[index] : undefined))
  }
  if (typeof value === 'object') {
    const defaults = initial && typeof initial === 'object' ? initial as Record<string, unknown> : {}
    return Object.entries(value).some(([key, item]) => hasContent(item, defaults[key]))
  }
  return true
}

function timestampMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string') return Date.parse(value)
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis()
  }
  return NaN
}

export function esBorradorVacioInactivo(data: Record<string, unknown>, now = Date.now()): boolean {
  if (data.estado !== 'BORRADOR' || data.eliminando) return false
  if (hasContent(data.datos, DATOS_INGRESO_VACIOS)) return false
  // Never delete a draft with files, pending uploads, signatures or admin notes.
  if (['documentos', 'pendingUploads', 'firmas', 'invites', 'notificaciones', 'pdfKey', 'notas'].some((key) => hasContent(data[key]))) return false

  const lastActivity = timestampMillis(data.updatedAt ?? data.createdAt)
  if (!Number.isFinite(lastActivity)) return false
  const createdAt = data.createdAt == null ? lastActivity : timestampMillis(data.createdAt)
  if (!Number.isFinite(createdAt)) return false
  return now - Math.max(lastActivity, createdAt) >= BORRADOR_VACIO_INACTIVIDAD_MS
}
