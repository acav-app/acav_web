import { NextResponse } from 'next/server'

import { esDocumentoIngreso, urlDocumentoBorrador } from '@/lib/solicitudes/service'
import { draftTokenFromRequest } from '@/lib/solicitudes/draft-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string; slot: string } }

export async function GET(request: Request, { params }: Params) {
  try {
    if (!esDocumentoIngreso(params.slot)) return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 })
    const url = await urlDocumentoBorrador(params.id, draftTokenFromRequest(request, params.id), params.slot)
    return NextResponse.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo abrir el archivo.' }, { status: 401 })
  }
}
