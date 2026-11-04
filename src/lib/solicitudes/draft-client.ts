import { SolicitudApiError, solicitudApiRequest } from './api-client'
import { DATOS_INGRESO_VACIOS, migrarDatosIngreso, type DatosIngreso, type DocumentoGuardado, type DocumentoIngreso } from './types'

export type DraftCredentials = { id: string; numero: string }
export type InitializedDraft = { credentials: DraftCredentials; data: DatosIngreso; documents: Partial<Record<DocumentoIngreso, Omit<DocumentoGuardado, 'key'>>> }

interface DraftStorage {
  read: () => string | null
  write: (value: string) => void
  clear: () => void
}

function isCredentials(value: unknown): value is DraftCredentials {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(item.id) && typeof item.numero === 'string' && item.numero.trim() !== ''
}

export async function initializeSolicitudDraft(storage: DraftStorage): Promise<InitializedDraft> {
  const cached = storage.read()
  let credentials: DraftCredentials | undefined
  if (cached) {
    try {
      const parsed: unknown = JSON.parse(cached)
      if (isCredentials(parsed)) credentials = { id: parsed.id, numero: parsed.numero }
    } catch { /* A malformed local reference cannot be used as a draft ID. */ }
    if (!credentials) storage.clear()
  }
  if (credentials) {
    try {
      const body = await solicitudApiRequest(`/api/solicitudes/ingreso/${credentials.id}`, {}, 'No se pudo recuperar el borrador.')
      if (!body.datos || typeof body.datos !== 'object' || Array.isArray(body.datos)) {
        throw new SolicitudApiError('No se pudo recuperar el contenido del borrador. Reintentá en unos instantes.', 200, 'INVALID_API_RESPONSE')
      }
      storage.write(JSON.stringify(credentials))
      return {
        credentials, data: migrarDatosIngreso(body.datos),
        documents: body.documentos && typeof body.documentos === 'object' ? body.documentos as InitializedDraft['documents'] : {},
      }
    } catch (error) {
      // HTTP errors, HTML pages, network failures and malformed responses are
      // never evidence that an existing draft can safely be discarded.
      const terminalStatuses: Record<string, number[]> = {
        DRAFT_NOT_FOUND: [404, 410], DRAFT_ACCESS_DENIED: [401, 403], DRAFT_EXPIRED: [410], DRAFT_ALREADY_SUBMITTED: [409],
      }
      const discard = error instanceof SolicitudApiError && terminalStatuses[error.code]?.includes(error.status)
      if (!discard) throw error
      storage.clear()
    }
  }

  const body = await solicitudApiRequest('/api/solicitudes/ingreso/borradores', { method: 'POST' }, 'No se pudo iniciar el formulario.')
  if (!isCredentials(body)) throw new SolicitudApiError('No se pudo confirmar el inicio del formulario. Volvé a intentar en unos instantes.', 200, 'INVALID_API_RESPONSE')
  const created = { id: body.id, numero: body.numero }
  storage.write(JSON.stringify(created))
  return { credentials: created, data: structuredClone(DATOS_INGRESO_VACIOS), documents: {} }
}
