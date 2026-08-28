import { NextResponse } from 'next/server'

import { createSolicitud, normalizeSolicitud } from '@/lib/admin/repository'
import { allowRequest, clientKey } from '@/lib/admin/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!allowRequest(clientKey(request))) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Probá de nuevo más tarde.' },
        { status: 429 }
      )
    }

    const payload = (await request.json()) as Record<string, unknown>

    // Campo trampa: si viene completo, es un bot.
    if (typeof payload.website === 'string' && payload.website.trim()) {
      return NextResponse.json({ ok: true })
    }

    await createSolicitud(normalizeSolicitud(payload))

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo enviar la solicitud.'
    console.error('[solicitudes]', error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
