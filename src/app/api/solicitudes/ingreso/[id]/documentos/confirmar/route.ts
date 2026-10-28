import { NextResponse } from 'next/server'

import { confirmarDocumentoIngreso, esDocumentoIngreso } from '@/lib/solicitudes/service'
import { draftTokenFromRequest } from '@/lib/solicitudes/draft-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function POST(request: Request, { params }: Params) {
  try {
    const body = (await request.json()) as { slot?: string; nombre?: string; key?: string }
    if (!body.slot || !esDocumentoIngreso(body.slot) || !body.nombre || !body.key) {
      return NextResponse.json({ error: 'No se pudo confirmar el archivo.' }, { status: 400 })
    }
    const documento = await confirmarDocumentoIngreso({
      id: params.id,
      token: draftTokenFromRequest(request, params.id),
      slot: body.slot,
      nombre: body.nombre,
      key: body.key,
    })
    return NextResponse.json({ documento }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo confirmar el archivo.' }, { status: 400 })
  }
}
