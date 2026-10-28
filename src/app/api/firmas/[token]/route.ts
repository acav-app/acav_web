import { NextResponse } from 'next/server'

import { enviarAvisoAdministrativo, enviarExpediente, enviarInvitacionAval } from '@/lib/solicitudes/email'
import { generarExpedientePdf } from '@/lib/solicitudes/pdf'
import {
  agregarExpedienteYNotificacion,
  buscarAval,
  firmarAval,
  guardarNotificacion,
} from '@/lib/solicitudes/service'
import { saveSolicitudPdf } from '@/lib/solicitudes/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { token: string } }

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconocida'
}

const noStore = { 'Cache-Control': 'no-store, private', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' }

export async function GET(_request: Request, { params }: Params) {
  try {
    const aval = await buscarAval(params.token)
    return NextResponse.json(aval, { headers: noStore })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'El enlace no está disponible.' }, { status: 400, headers: noStore })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const declaredLength = Number(request.headers.get('content-length') ?? 0)
    if (declaredLength > 300_000) return NextResponse.json({ error: 'La firma supera el tamaño permitido.' }, { status: 413, headers: noStore })
    const body = (await request.json()) as { apellidos?: string; nombres?: string; imagen?: string; acepta?: boolean }
    if (JSON.stringify(body).length > 300_000) return NextResponse.json({ error: 'La firma supera el tamaño permitido.' }, { status: 413, headers: noStore })
    const result = await firmarAval({
      token: params.token,
      apellidos: body.apellidos ?? '',
      nombres: body.nombres ?? '',
      imagen: body.imagen ?? '',
      acepta: body.acepta === true,
      ip: clientIp(request),
      userAgent: request.headers.get('user-agent') ?? '',
    })

    if (result.next) {
      let sent = false
      try {
        await enviarInvitacionAval({ ...result.next, paso: 2 })
        sent = true
      } catch (error) {
        console.error('[resend-aval-2]', error)
      }
      await guardarNotificacion(result.solicitud.id, 'aval2', sent).catch((error) => console.error('[save-notification-aval2]', error))
      const adminEmail = process.env.SOLICITUD_ADMIN_EMAIL
      if (adminEmail) {
        await enviarAvisoAdministrativo({
          email: adminEmail,
          numero: result.next.numero,
          agencia: result.next.agencia,
          etapa: sent ? 'Pendiente de firma del Aval 2' : 'Aval 1 firmó; el aviso al Aval 2 está pendiente de reenvío',
        }).catch((error) => console.error('[resend-admin-solicitud]', error))
      }
      return NextResponse.json({ ok: true, completed: false, nextEmailSent: sent }, { headers: noStore })
    }

    if (result.completed) {
      let pdfKey = ''
      let pdf: Uint8Array | null = null
      try {
        pdf = await generarExpedientePdf(result.solicitud)
        pdfKey = await saveSolicitudPdf(result.solicitud.id, pdf)
      } catch (error) {
        console.error('[pdf-solicitud]', error)
      }
      if (pdf && pdfKey) {
        const adminEmail = process.env.SOLICITUD_ADMIN_EMAIL
        let sent = false
        try {
          if (!adminEmail) throw new Error('Falta configurar SOLICITUD_ADMIN_EMAIL para distribuir el expediente completo.')
          const recipients = [result.solicitud.datos.email, result.solicitud.datos.avales[0].email, result.solicitud.datos.avales[1].email, adminEmail]
          await enviarExpediente({ emails: recipients, numero: result.solicitud.numero, agencia: result.solicitud.datos.razonSocial, pdf })
          sent = true
        } catch (error) {
          console.error('[resend-expediente]', error)
        }
        await agregarExpedienteYNotificacion(result.solicitud.id, pdfKey, sent).catch((error) => console.error('[save-final-pdf-reference]', error))
        return NextResponse.json({ ok: true, completed: true, pdfGenerated: true, emailSent: sent }, { headers: noStore })
      }
      await agregarExpedienteYNotificacion(result.solicitud.id, '', false).catch((error) => console.error('[save-final-pdf-error]', error))
      return NextResponse.json({ ok: true, completed: true, pdfGenerated: false, emailSent: false }, { headers: noStore })
    }

    return NextResponse.json({ ok: true, completed: false }, { headers: noStore })
  } catch (error) {
    console.error('[firma-aval]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo registrar la firma.' }, { status: 400, headers: noStore })
  }
}
