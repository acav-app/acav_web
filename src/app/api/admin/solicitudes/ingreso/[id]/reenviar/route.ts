import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { enviarInvitacionAval } from '@/lib/solicitudes/email'
import { guardarNotificacion, renovarInvitacion } from '@/lib/solicitudes/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireIngresoAdmin()
    const invitation = await renovarInvitacion(params.id)
    let sent = false
    try {
      await enviarInvitacionAval({ ...invitation, paso: invitation.paso })
      sent = true
    } catch (error) {
      console.error('[resend-admin-invitation]', error)
    } finally {
      await guardarNotificacion(params.id, invitation.paso === 1 ? 'aval1' : 'aval2', sent).catch((error) => console.error('[save-resend-notification]', error))
    }
    return NextResponse.json({ ok: sent, message: sent ? 'Enlace reenviado.' : 'No se pudo enviar el email.' }, { status: sent ? 200 : 502 })
  } catch (error) {
    return handleApiError(error)
  }
}
