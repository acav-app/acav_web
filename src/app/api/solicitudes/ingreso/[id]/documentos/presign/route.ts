import { NextResponse } from 'next/server'

import { iniciarSubidaDocumento, esDocumentoIngreso } from '@/lib/solicitudes/service'
import { draftTokenFromRequest } from '@/lib/solicitudes/draft-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function POST(request: Request, { params }: Params) {
  try {
    const body = (await request.json()) as { slot?: string; contentType?: string; size?: number }
    if (!body.slot || !esDocumentoIngreso(body.slot) || !body.contentType || typeof body.size !== 'number') {
      return NextResponse.json({ error: 'Datos del archivo incompletos.' }, { status: 400 })
    }
    const result = await iniciarSubidaDocumento({
      id: params.id,
      token: draftTokenFromRequest(request, params.id),
      slot: body.slot,
      contentType: body.contentType,
      size: body.size,
    })
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo iniciar la carga.' }, { status: 400 })
  }
}
