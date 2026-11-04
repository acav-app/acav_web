import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { generarExpedientePdf } from '@/lib/solicitudes/pdf'
import { obtenerSolicitudIngreso } from '@/lib/solicitudes/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireIngresoAdmin()
    const solicitud = await obtenerSolicitudIngreso(params.id)
    if (!solicitud) {
      return NextResponse.json({ error: 'No se encontró la solicitud.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }
    const pdf = await generarExpedientePdf(solicitud)
    const filename = `${solicitud.numero.replace(/[^A-Za-z0-9_-]/g, '_')}-expediente.pdf`
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
