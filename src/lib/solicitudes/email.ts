import 'server-only'

import { Resend } from 'resend'

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

function shell(title: string, content: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:620px;margin:32px auto;padding:32px;background:#fff;border-radius:18px"><p style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#2563eb">A.C.A.V.</p><h1 style="font-size:24px">${title}</h1>${content}<p style="margin-top:32px;color:#64748b;font-size:12px">Asociación Cordobesa de Agencias de Viajes</p></div></body></html>`
}

export async function enviarInvitacionAval(input: {
  email: string
  agencia: string
  numero: string
  paso: 1 | 2
  token: string
}) {
  const link = `${siteUrl()}/firmar/${encodeURIComponent(input.token)}`
  const { error } = await resend().emails.send({
    from: fromEmail(),
    to: [input.email],
    subject: `Firma de aval ${input.paso} — Solicitud ${input.numero}`,
    html: shell(`Te invitaron a avalar una solicitud`, `
      <p>La agencia <strong>${escapeHtml(input.agencia)}</strong> te incluyó como Aval ${input.paso} en la solicitud <strong>${escapeHtml(input.numero)}</strong>.</p>
      <p>Revisá el resumen y firmá desde el siguiente enlace seguro. El enlace es personal, de un solo uso y vence en 10 días.</p>
      <p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#f97316;color:#fff;text-decoration:none;font-weight:bold">Revisar y firmar</a></p>
      <p style="color:#64748b;font-size:12px">Si no reconocés esta solicitud, podés ignorar este correo.</p>`),
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
  const client = resend()
  const failures: string[] = []
  // Send separate messages so the parties do not see one another's email addresses.
  for (const recipient of recipients) {
    try {
      const { error } = await client.emails.send({
        from: fromEmail(),
        to: [recipient],
        subject: `Solicitud ${input.numero} completada — ${input.agencia}`,
        html: shell('Trámite completado', `<p>El circuito de firmas de la solicitud <strong>${escapeHtml(input.numero)}</strong> de <strong>${escapeHtml(input.agencia)}</strong> finalizó.</p><p>Adjuntamos el expediente PDF consolidado.</p>`),
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
    html: shell('Nueva actividad en una solicitud', `<p>La solicitud <strong>${escapeHtml(input.numero)}</strong> de <strong>${escapeHtml(input.agencia)}</strong> pasó a la etapa: ${escapeHtml(input.etapa)}.</p><p><a href="${adminLink}">Ingresá al panel administrativo</a> para revisar el trámite.</p>`),
  })
  if (error) throw new Error(error.message)
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}
