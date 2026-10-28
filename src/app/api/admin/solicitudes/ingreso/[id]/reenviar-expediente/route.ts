import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { enviarExpediente } from '@/lib/solicitudes/email'
import { agregarExpedienteYNotificacion, obtenerSolicitudIngreso } from '@/lib/solicitudes/service'
import { generarExpedientePdf } from '@/lib/solicitudes/pdf'
import { readSolicitudFile, saveSolicitudPdf } from '@/lib/solicitudes/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireIngresoAdmin()
    const item = await obtenerSolicitudIngreso(params.id)
    if (!item || item.estado !== 'COMPLETADO_APROBADO') throw new Error('El expediente solo se distribuye cuando el trámite está completo.')
    const adminEmail = process.env.SOLICITUD_ADMIN_EMAIL
    if (!adminEmail) throw new Error('Falta configurar SOLICITUD_ADMIN_EMAIL para distribuir el expediente completo.')
    let pdf = item.pdfKey ? await readSolicitudFile(item.pdfKey) : await generarExpedientePdf(item)
    const key = item.pdfKey || await saveSolicitudPdf(item.id, pdf)
    await agregarExpedienteYNotificacion(item.id, key, false)
    await enviarExpediente({
      emails: [item.datos.email, item.datos.avales[0].email, item.datos.avales[1].email, adminEmail],
      numero: item.numero,
      agencia: item.datos.razonSocial,
      pdf,
    })
    await agregarExpedienteYNotificacion(item.id, key, true)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
