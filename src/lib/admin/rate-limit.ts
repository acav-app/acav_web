import 'server-only'

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 5

const hits = new Map<string, number[]>()

/** Rate limit en memoria; suficiente para un formulario público de bajo volumen. */
export function allowRequest(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 5000) hits.clear()

  return true
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'anon'
}
