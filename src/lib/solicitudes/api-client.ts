export class SolicitudApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) {
    super(message)
    this.name = 'SolicitudApiError'
  }
}

export async function solicitudApiRequest<T = Record<string, unknown>>(url: string, options: RequestInit = {}, fallback = 'No se pudo completar la operación.'): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    response = await fetch(url, {
      ...options, headers, cache: 'no-store', credentials: 'same-origin', redirect: 'error',
      signal: options.signal ?? AbortSignal.timeout(25_000),
    })
  } catch {
    throw new SolicitudApiError('No pudimos conectar con el servicio de inscripción. Revisá tu conexión y volvé a intentar; tu borrador no se descartó.', 0, 'NETWORK_ERROR')
  }

  const invalidResponse = () => new SolicitudApiError(
    'El servicio de inscripción devolvió una respuesta inesperada. Intentá nuevamente en unos instantes; tu borrador no se descartó.',
    response.status, 'INVALID_API_RESPONSE',
  )
  if (!/^application\/(?:[\w.+-]+\+)?json(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '')) throw invalidResponse()
  let body: Record<string, unknown>
  try {
    const parsed: unknown = await response.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw invalidResponse()
    body = parsed as Record<string, unknown>
  } catch {
    throw invalidResponse()
  }
  if (!response.ok) {
    throw new SolicitudApiError(typeof body.error === 'string' ? body.error : fallback, response.status, typeof body.code === 'string' ? body.code : 'HTTP_ERROR')
  }
  return body as T
}
