import { NextResponse } from 'next/server'

import { allowRequest, clientKey } from '@/lib/admin/rate-limit'
import { draftTokenFromRequest, setDraftCookie } from '@/lib/solicitudes/draft-cookie'
import { enviarAvisoAdministrativo, enviarInvitacionAval } from '@/lib/solicitudes/email'
import { guardarNotificacion, enviarSolicitudIngreso } from '@/lib/solicitudes/service'
import { INSCRIPCIONES_HABILITADAS, MENSAJE_INSCRIPCIONES_PAUSADAS } from '@/lib/solicitudes/availability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconocida'
}

export async function POST(request: Request, { params }: Params) {
  if (!INSCRIPCIONES_HABILITADAS) {
    return NextResponse.json({ error: MENSAJE_INSCRIPCIONES_PAUSADAS }, { status: 503 })
  }

  if (!allowRequest(`ingreso-submit:${clientKey(request)}`)) {
    return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento y volvé a intentar.' }, { status: 429 })
  }
  try {
    const body = (await request.json()) as {
      datos?: unknown; firmaApellidos?: string; firmaNombres?: string; firmaImagen?: string; aceptaDeclaracion?: boolean
    }
    if (JSON.stringify(body).length > 1_000_000) return NextResponse.json({ error: 'La solicitud supera el tamaño permitido.' }, { status: 413 })
    const invite = await enviarSolicitudIngreso({
      id: params.id,
      token: draftTokenFromRequest(request, params.id),
      datos: body.datos,
      firmaApellidos: body.firmaApellidos ?? '',
      firmaNombres: body.firmaNombres ?? '',
      firmaImagen: body.firmaImagen ?? '',
      aceptaDeclaracion: body.aceptaDeclaracion === true,
      ip: clientIp(request),
      userAgent: request.headers.get('user-agent') ?? '',
    })

    let emailEnviado = false
    try {
      await enviarInvitacionAval({ ...invite, paso: 1 })
      emailEnviado = true
    } catch (error) {
      console.error('[resend-aval-1]', error)
    }
    await guardarNotificacion(params.id, 'aval1', emailEnviado).catch((error) => console.error('[save-notification-aval1]', error))
    const adminEmail = process.env.SOLICITUD_ADMIN_EMAIL
    if (adminEmail) {
      await enviarAvisoAdministrativo({ email: adminEmail, numero: invite.numero, agencia: invite.agencia, etapa: 'Pendiente de firma del Aval 1' }).catch((error) => console.error('[resend-admin-solicitud]', error))
    }

    const response = NextResponse.json({
      ok: true,
      numero: invite.numero,
      emailEnviado,
      message: emailEnviado
        ? 'Solicitud recibida. El Aval 1 ya recibió un enlace seguro para firmar.'
        : 'Solicitud recibida. El aviso por email está demorado; el equipo de ACAV podrá reenviarlo desde el panel.',
    }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
    setDraftCookie(response, params.id, '', 0)
    return response
  } catch (error) {
    console.error('[solicitud-ingreso-enviar]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo enviar la solicitud.' }, { status: 400 })
  }
}
