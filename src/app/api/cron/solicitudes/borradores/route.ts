import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

import { limpiarBorradoresVacios } from '@/lib/solicitudes/draft-cleanup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const headers = { 'Cache-Control': 'no-store' }
  if (!secret) {
    console.error('[solicitudes-cleanup] Falta configurar CRON_SECRET.')
    return NextResponse.json({ error: 'Limpieza automática no configurada.' }, { status: 503, headers })
  }
  const authorization = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  if (authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers })
  }

  try {
    const result = await limpiarBorradoresVacios({ dryRun: new URL(request.url).searchParams.get('dryRun') === '1' })
    return NextResponse.json(result, { status: result.errores ? 500 : 200, headers })
  } catch (error) {
    console.error('[solicitudes-cleanup]', error)
    return NextResponse.json({ error: 'No se pudo completar la limpieza de borradores.' }, { status: 500, headers })
  }
}
