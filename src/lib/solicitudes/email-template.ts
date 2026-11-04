const BRAND = 'Asociación Cordobesa de Agencias de Viajes'

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

export function emailParagraph(text: string) {
  return `<p style="margin:0 0 20px;font-size:16px;line-height:26px;color:#334155;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(text).replace(/\r?\n/g, '<br>')}</p>`
}

export function emailSummary(fields: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;background:#f1f6fc;border:1px solid #dce6f0;border-radius:8px;margin:4px 0 24px">
    <tr><td style="padding:20px 24px">
      <p style="margin:0 0 16px;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.2px;color:#52657e">RESUMEN DEL TRÁMITE</p>
      ${fields.map(([label, value], index) => `<p style="margin:${index ? '14px' : '0'} 0 3px;font-size:12px;line-height:18px;color:#52657e">${escapeHtml(label)}</p><p style="margin:0;font-size:16px;line-height:24px;font-weight:bold;color:#081b45;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(value)}</p>`).join('')}
    </td></tr>
  </table>`
}

export function emailAction(label: string, url: string) {
  const href = escapeHtml(url)
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin:8px 0 24px"><tr>
    <td bgcolor="#006eaf" align="center" style="background:#006eaf;border-radius:6px;mso-padding-alt:16px 28px">
      <a href="${href}" style="display:inline-block;padding:16px 28px;border:1px solid #006eaf;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;text-align:center;color:#ffffff;text-decoration:none;mso-padding-alt:0"><!--[if mso]><i style="mso-font-width:140%;mso-text-raise:24pt" hidden>&emsp;</i><span style="mso-text-raise:12pt"><![endif]-->${escapeHtml(label)}<!--[if mso]></span><i style="mso-font-width:140%" hidden>&emsp;&#8203;</i><![endif]--></a>
    </td>
  </tr></table>
  <p style="margin:0 0 8px;font-size:13px;line-height:20px;color:#64748b">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
  <p style="margin:0 0 24px;font-size:13px;line-height:20px;word-break:break-all;overflow-wrap:anywhere"><a href="${href}" style="color:#006eaf;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere">${href}</a></p>`
}

export function emailNotice(title: string, text: string, completed = false) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;margin:0 0 24px;border-collapse:collapse"><tr>
    <td style="padding:16px 18px;background:${completed ? '#f0fdf4' : '#fff7ed'};border-left:3px solid ${completed ? '#15803d' : '#f94910'}">
      <p style="margin:0 0 4px;font-size:14px;line-height:21px;font-weight:bold;color:#081b45">${escapeHtml(title)}</p>
      <p style="margin:0;font-size:14px;line-height:22px;color:#475569;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(text)}</p>
    </td>
  </tr></table>`
}

export function renderSolicitudEmail(input: {
  title: string
  preheader: string
  eyebrow: string
  content: string
  siteUrl: string
  footerReason: string
}) {
  const site = escapeHtml(input.siteUrl)
  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${escapeHtml(input.title)} · ACAV</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
    @media only screen and (max-width:620px){
      .email-outer{padding:16px 8px!important}
      .email-padding{padding-left:24px!important;padding-right:24px!important}
      .email-title{font-size:25px!important;line-height:32px!important}
    }
  </style>
</head>
<body style="width:100%;margin:0;padding:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#334155">
  <div aria-hidden="true" style="display:none;font-size:1px;line-height:1px;color:#eef2f6;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef2f6" style="width:100%;table-layout:fixed;border-collapse:collapse;background:#eef2f6">
    <tr><td class="email-outer" align="center" style="padding:32px 16px">
      <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#ffffff" style="width:100%;max-width:600px;table-layout:fixed;border-collapse:separate;background:#ffffff;border:1px solid #dce4ed;border-radius:12px">
        <tr><td class="email-padding" bgcolor="#0088d8" style="padding:28px 36px 24px;background:#0088d8;border-bottom:4px solid #f94910;border-radius:11px 11px 0 0">
          <a href="${site}" style="display:inline-block;color:#ffffff;font-size:26px;font-weight:bold;text-decoration:none"><img src="${site}/images/logo.png" width="142" height="48" alt="ACAV" style="display:block;width:142px;max-width:100%;height:auto;color:#ffffff;font-size:26px;font-weight:bold"></a>
          <p style="margin:16px 0 0;font-size:12px;line-height:19px;color:#ffffff">${BRAND}</p>
          <p style="margin:6px 0 0;font-size:10px;line-height:16px;font-weight:bold;letter-spacing:1.8px;color:#ffffff">SOLICITUDES DE INGRESO</p>
        </td></tr>
        <tr><td class="email-padding" style="padding:32px 36px 12px">
          <p style="margin:0 0 12px;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1.4px;color:#006eaf">${escapeHtml(input.eyebrow)}</p>
          <h1 class="email-title" style="margin:0 0 20px;font-size:28px;line-height:36px;font-weight:bold;color:#081b45;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(input.title)}</h1>
          ${input.content}
        </td></tr>
        <tr><td class="email-padding" style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 11px 11px">
          <p style="margin:0 0 8px;font-size:13px;line-height:20px;font-weight:bold;color:#081b45">ACAV · ${BRAND}</p>
          <p style="margin:0 0 12px;font-size:12px;line-height:19px;color:#64748b;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(input.footerReason)}</p>
          <p style="margin:0;font-size:12px;line-height:19px"><a href="${site}" style="color:#006eaf;text-decoration:underline">Visitar el portal de ACAV</a></p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`
}

export function solicitudEmailText(lines: string[]) {
  return [...lines, '', `ACAV · ${BRAND}`].join('\n\n')
}
