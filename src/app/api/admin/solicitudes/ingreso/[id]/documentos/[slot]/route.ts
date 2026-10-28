import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { esDocumentoIngreso, urlDocumentoIngreso } from '@/lib/solicitudes/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string; slot: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireIngresoAdmin()
    if (!esDocumentoIngreso(params.slot)) return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 })
    return NextResponse.json({ url: await urlDocumentoIngreso(params.id, params.slot) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return handleApiError(error)
  }
}
