import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { obtenerSolicitudIngreso } from '@/lib/solicitudes/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireIngresoAdmin()
    const item = await obtenerSolicitudIngreso(params.id)
    if (!item) return NextResponse.json({ error: 'No se encontró la solicitud.' }, { status: 404 })
    return NextResponse.json({ item }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return handleApiError(error)
  }
}
