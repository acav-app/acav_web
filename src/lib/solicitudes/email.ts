import 'server-only'

import { Resend } from 'resend'

import { emailAction, emailNotice, emailParagraph, emailSummary, renderSolicitudEmail, solicitudEmailText } from './email-template'

export { escapeHtml } from './email-template'

function resend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Falta configurar RESEND_API_KEY.')
  return new Resend(key)
}

function fromEmail() {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) throw new Error('Falta configurar RESEND_FROM_EMAIL con un remitente verificado en Resend.')
  return from
}

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  if (!configured && process.env.NODE_ENV === 'production') {
    throw new Error('Falta NEXT_PUBLIC_SITE_URL para generar enlaces seguros del trámite.')
  }
  return (configured || 'http://localhost:3000').replace(/\/$/, '')
}

export async function enviarInvitacionAval(input: {
  email: string
  agencia: string
  numero: string
  paso: 1 | 2
  token: string
}) {
  const link = `${siteUrl()}/firmar/${encodeURIComponent(input.token)}`
  const intro = `La agencia ${input.agencia} te incluyó como Aval ${input.paso} en su solicitud de ingreso a ACAV.`
  const security = 'El enlace es personal, de un solo uso y vence en 10 días. No lo compartas con otras personas.'
  const reason = 'Recibís este correo porque una agencia indicó tu email como aval. Si no reconocés esta solicitud, podés ignorarlo.'
  const { error } = await resend().emails.send({
    from: fromEmail(),
    to: [input.email],
    subject: `Firma de aval ${input.paso} — Solicitud ${input.numero}`,
    html: renderSolicitudEmail({
      title: 'Te invitaron a avalar una solicitud',
      preheader: `${input.agencia} solicita tu firma como Aval ${input.paso}. Revisá la solicitud ${input.numero}.`,
      eyebrow: `AVAL ${input.paso} · FIRMA PENDIENTE`,
      siteUrl: siteUrl(), footerReason: reason,
      content: emailParagraph(intro)
        + emailSummary([['Agencia solicitante', input.agencia], ['Número de solicitud', input.numero], ['Tu participación', `Aval ${input.paso}`]])
        + emailParagraph('Revisá los datos de la agencia y, si corresponde, registrá tu firma desde el siguiente enlace seguro.')
        + emailNotice('Enlace personal · válido por 10 días', security)
        + emailAction('Revisar y firmar', link),
    }),
    text: solicitudEmailText([intro, `Solicitud: ${input.numero}`, security, `Revisar y firmar: ${link}`, reason]),
  })
  if (error) throw new Error(error.message)
}

export async function enviarResumenSolicitante(input: {
  email: string
  numero: string
  agencia: string
  tipo: 'recibida' | 'avance'
  estado: string
  mensaje: string
}) {
  const recibida = input.tipo === 'recibida'
  const title = recibida ? 'Recibimos tu solicitud' : 'Tu solicitud tiene novedades'
  const intro = recibida ? 'Tu solicitud de ingreso fue registrada correctamente. Te acompañamos durante los próximos pasos del trámite.' : 'Te compartimos una actualización sobre tu solicitud de ingreso a ACAV.'
  const reference = `Conservá este correo como referencia. Para consultar por tu solicitud, indicá el número ${input.numero}.`
  const { error } = await resend().emails.send({
    from: fromEmail(),
    to: [input.email],
    subject: recibida ? `Solicitud recibida — ${input.numero}` : `Actualización de solicitud — ${input.numero}`,
    html: renderSolicitudEmail({
      title, preheader: `${input.numero} · ${input.estado}. ${input.mensaje}`,
      eyebrow: recibida ? 'SOLICITUD REGISTRADA' : 'SEGUIMIENTO DEL TRÁMITE',
      siteUrl: siteUrl(), footerReason: 'Recibís esta notificación porque tu email está asociado a una solicitud de ingreso a ACAV.',
      content: emailParagraph(intro)
        + emailSummary([['Agencia', input.agencia], ['Número de solicitud', input.numero], ['Estado actual', input.estado]])
        + emailNotice('Próximos pasos', input.mensaje)
        + emailParagraph(reference),
    }),
    text: solicitudEmailText([title, intro, `Agencia: ${input.agencia}`, `Solicitud: ${input.numero}`, `Estado: ${input.estado}`, input.mensaje, reference]),
  })
  if (error) throw new Error(error.message)
}

export async function enviarExpediente(input: {
  emails: string[]
  numero: string
  agencia: string
  pdf: Uint8Array
}) {
  const recipients = Array.from(new Set(input.emails.map((email) => email.trim().toLowerCase()).filter(Boolean)))
  if (!recipients.length) throw new Error('No hay destinatarios para el expediente.')
  const intro = 'El circuito de firmas de la solicitud de ingreso finalizó correctamente. El expediente reúne los datos y las firmas registrados durante el trámite.'
  const attachmentNote = 'Adjuntamos el expediente PDF consolidado a este correo. Descargalo y guardalo para futuras consultas.'
  const html = renderSolicitudEmail({
    title: 'El expediente está completo',
    preheader: `${input.numero} · Finalizó el circuito de firmas. Encontrá el expediente PDF adjunto.`,
    eyebrow: 'CIRCUITO DE FIRMAS FINALIZADO', siteUrl: siteUrl(),
    footerReason: 'Recibís este correo porque participaste como solicitante o aval en este trámite. El mensaje se envía individualmente para proteger los datos de los participantes.',
    content: emailParagraph(intro)
      + emailSummary([['Agencia', input.agencia], ['Número de solicitud', input.numero], ['Estado', 'Completado']])
      + emailNotice('Expediente PDF adjunto', attachmentNote, true)
      + emailParagraph(`Para cualquier consulta sobre este expediente, indicá el número ${input.numero}.`),
  })
  const text = solicitudEmailText(['El expediente está completo', intro, `Agencia: ${input.agencia}`, `Solicitud: ${input.numero}`, 'Estado: Completado', attachmentNote])
  const client = resend()
  const failures: string[] = []
  // Send separate messages so the parties do not see one another's email addresses.
  for (const recipient of recipients) {
    try {
      const { error } = await client.emails.send({
        from: fromEmail(),
        to: [recipient],
        subject: `Solicitud ${input.numero} completada — ${input.agencia}`,
        html,
        text,
        attachments: [{ filename: `${input.numero}-expediente.pdf`, content: Buffer.from(input.pdf) }],
      })
      if (error) failures.push(`${recipient}: ${error.message}`)
    } catch (error) {
      failures.push(`${recipient}: ${error instanceof Error ? error.message : 'Error de conexión con Resend.'}`)
    }
  }
  if (failures.length) throw new Error(`No se pudieron entregar todos los emails: ${failures.join('; ')}`)
}

export async function enviarAvisoAdministrativo(input: { email: string; numero: string; agencia: string; etapa: string }) {
  const adminLink = `${siteUrl()}/admin/solicitudes`
  const { error } = await resend().emails.send({
    from: fromEmail(),
    to: [input.email],
    subject: `Solicitud ${input.numero}: ${input.etapa}`,
    html: renderSolicitudEmail({
      title: 'Una solicitud tiene novedades',
      preheader: `${input.numero} · ${input.agencia} · ${input.etapa}`,
      eyebrow: 'NOTIFICACIÓN ADMINISTRATIVA', siteUrl: siteUrl(),
      footerReason: 'Notificación interna enviada a la cuenta administrativa configurada en el portal de ACAV. El acceso al panel requiere autorización.',
      content: emailParagraph('Se registró una nueva actividad en una solicitud de ingreso. Ingresá al panel para consultar los datos y revisar la documentación.')
        + emailSummary([['Agencia', input.agencia], ['Número de solicitud', input.numero], ['Etapa actual', input.etapa]])
        + emailAction('Revisar en el administrador', adminLink),
    }),
    text: solicitudEmailText(['Nueva actividad en una solicitud', `Agencia: ${input.agencia}`, `Solicitud: ${input.numero}`, `Etapa: ${input.etapa}`, `Revisar en el administrador: ${adminLink}`]),
  })
  if (error) throw new Error(error.message)
}
