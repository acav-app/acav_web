import { NextResponse } from 'next/server'

import { allowRequest, clientKey } from '@/lib/admin/rate-limit'
import { crearBorradorIngreso } from '@/lib/solicitudes/service'
import { setDraftCookie } from '@/lib/solicitudes/draft-cookie'
import { INSCRIPCIONES_HABILITADAS, MENSAJE_INSCRIPCIONES_PAUSADAS } from '@/lib/solicitudes/availability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!INSCRIPCIONES_HABILITADAS) {
    return NextResponse.json({ error: MENSAJE_INSCRIPCIONES_PAUSADAS }, { status: 503 })
  }

  if (!allowRequest(`ingreso:${clientKey(request)}`)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Probá de nuevo más tarde.' }, { status: 429 })
  }
  try {
    const item = await crearBorradorIngreso()
    const response = NextResponse.json({ id: item.id, numero: item.numero }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
    setDraftCookie(response, item.id, item.token)
    return response
  } catch (error) {
    console.error('[solicitudes-ingreso-borrador]', error)
    return NextResponse.json({ error: 'No se pudo iniciar el formulario. Probá de nuevo.' }, { status: 503 })
  }
}
