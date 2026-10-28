import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

import { DOCUMENTOS_INGRESO, ETIQUETAS_DOCUMENTO, nombreCompleto, type FirmaGuardada, type SolicitudIngreso } from './types'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48

export async function generarExpedientePdf(solicitud: SolicitudIngreso): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Solicitud de ingreso ${solicitud.numero} - ACAV`)
  pdf.setSubject(`Expediente digital ACAV ${solicitud.numero}`)
  pdf.setCreator('Portal ACAV')
  pdf.setProducer('ACAV — Solicitud de ingreso')

  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  let logo: Awaited<ReturnType<typeof pdf.embedPng>> | null = null
  try {
    logo = await pdf.embedPng(await readFile(path.join(process.cwd(), 'public/images/logo-azul.png')))
  } catch {
    // Keep PDF generation functional if the optional brand asset is missing.
  }
  const pages: PDFPage[] = []
  let page = {} as PDFPage
  let y = 0

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    pages.push(page)
    y = PAGE_HEIGHT - MARGIN
    if (logo) page.drawImage(logo, { x: MARGIN, y: y - 7, width: 44, height: 16 })
    page.drawText('A.C.A.V.  |  ASOCIACIÓN CORDOBESA DE AGENCIAS DE VIAJES', {
      x: MARGIN + (logo ? 54 : 0), y, size: 8, font: bold, color: rgb(0.1, 0.25, 0.48),
    })
    y -= 26
  }

  const ensureSpace = (needed = 22) => {
    if (y - needed < MARGIN + 24) newPage()
  }

  const heading = (title: string) => {
    ensureSpace(38)
    page.drawText(title, { x: MARGIN, y, size: 12, font: bold, color: rgb(0.1, 0.25, 0.48) })
    y -= 8
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.8, color: rgb(0.83, 0.87, 0.92) })
    y -= 16
  }

  const text = (value: unknown, font: PDFFont = regular, size = 9) => {
    const raw = pdfSafe(String(value ?? '—').trim() || '—')
    const maxWidth = PAGE_WIDTH - MARGIN * 2
    const words = raw.split(/\s+/)
    let line = ''
    const lines: string[] = []
    for (const word of words) {
      const next = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        lines.push(line)
        line = word
      } else line = next
    }
    if (line) lines.push(line)
    ensureSpace(lines.length * (size + 4) + 3)
    for (const valueLine of lines) {
      page.drawText(valueLine, { x: MARGIN, y, size, font, color: rgb(0.15, 0.18, 0.23) })
      y -= size + 4
    }
  }

  const field = (label: string, value: unknown) => {
    const valueText = String(value ?? '').trim() || '—'
    text(`${label}: ${valueText}`)
  }

  newPage()
  page.drawText('SOLICITUD DE INGRESO', { x: MARGIN, y, size: 19, font: bold, color: rgb(0.05, 0.1, 0.22) })
  y -= 26
  text(`Número de solicitud: ${solicitud.numero}`, bold, 10)
  text(`Inicio: ${formatDate(solicitud.createdAt)}  ·  Finalización: ${formatDate(solicitud.firmas.aval2?.firmadaEn ?? null)}`)
  text(`Categoría: ${solicitud.datos.categoria}  ·  Estado: ${solicitud.estado}`)
  y -= 10

  const d = solicitud.datos
  heading('A. INFORMACIÓN DE LA AGENCIA')
  field('Razón social', d.razonSocial)
  field('Designación comercial', d.designacionComercial)
  field('Actividad principal', d.actividadPrincipal)
  field('Legajo', d.legajo)
  field('Domicilio físico', d.domicilioFisico)
  field('Franquicia / Sucursal / Posee sucursales', `${d.esFranquicia} / ${d.esSucursal} / ${d.poseeSucursales}`)
  field('Cantidad de sucursales', d.cantidadSucursales)
  field('Empleados en Córdoba', d.empleadosCordoba || 'No informado')
  field('CUIT', d.cuit)
  field('Condición ante IVA', d.condicionIva)
  field('WhatsApp', d.whatsapp)
  field('Email principal', d.email)
  field('Sitio web', d.sitioWeb)
  field('Redes sociales', d.redesSociales)

  heading('B. TITULARES')
  for (let index = 0; index < d.titulares.length; index++) {
    const titular = d.titulares[index]
    text(`Titular ${index + 1}`, bold)
    field('Nombre y apellido', nombreCompleto(titular))
    field('Fecha de nacimiento', titular.fechaNacimiento)
    field('DNI', titular.dni)
    field('Celular', titular.telefono)
    field('Email', titular.email)
    field('Profesión / ocupación', titular.ocupacion)
    y -= 4
  }

  heading('C. REPRESENTANTES ANTE ACAV')
  for (const [label, persona] of [['Delegado', d.delegado], ['Subdelegado', d.subdelegado]] as const) {
    text(label, bold)
    field('Nombre y apellido', nombreCompleto(persona))
    field('DNI', persona.dni)
    field('Celular', persona.telefono)
    field('Email', persona.email)
    y -= 4
  }

  heading('D. AVALES DE ASOCIADOS')
  for (let index = 0; index < d.avales.length; index++) {
    const aval = d.avales[index]
    field(`Aval ${index + 1} — agencia`, aval.agencia)
    field(`Aval ${index + 1} — email`, aval.email)
  }

  heading('E. DOCUMENTACIÓN PRESENTADA')
  for (const slot of DOCUMENTOS_INGRESO) {
    const documento = solicitud.documentos[slot]
    field(ETIQUETAS_DOCUMENTO[slot], documento ? `${documento.nombre} (${formatBytes(documento.size)})` : 'No adjuntado')
  }

  heading('F. REGISTRO DE FIRMAS')
  const signers: Array<{ label: string; key: 'solicitante' | 'aval1' | 'aval2'; context: string }> = [
    { label: 'SOLICITANTE', key: 'solicitante', context: `${solicitud.firmas.solicitante?.nombre ?? '—'} · DNI ${d.delegado.dni} · ${d.razonSocial}` },
    { label: 'AVAL 1', key: 'aval1', context: `${solicitud.firmas.aval1?.nombre ?? '—'} · ${d.avales[0].agencia}` },
    { label: 'AVAL 2', key: 'aval2', context: `${solicitud.firmas.aval2?.nombre ?? '—'} · ${d.avales[1].agencia}` },
  ]
  const colGap = 12
  const colWidth = (PAGE_WIDTH - MARGIN * 2 - colGap * 2) / 3
  const blockHeight = 142
  ensureSpace(blockHeight + 24)
  const blockTop = y
  for (let index = 0; index < signers.length; index++) {
    const signer = signers[index]
    const x = MARGIN + index * (colWidth + colGap)
    page.drawRectangle({ x, y: blockTop - blockHeight, width: colWidth, height: blockHeight, borderWidth: 0.8, borderColor: rgb(0.78, 0.82, 0.88) })
    page.drawText(signer.label, { x: x + 8, y: blockTop - 16, size: 8, font: bold, color: rgb(0.1, 0.25, 0.48) })
    const signature = solicitud.firmas[signer.key]
    if (signature) await drawSignature(pdf, page, signature, x + 8, blockTop - 93, colWidth - 16, 58)
    else page.drawText('Firma pendiente', { x: x + 8, y: blockTop - 56, size: 8, font: regular, color: rgb(0.55, 0.58, 0.62) })
    drawWrappedInBox(page, signer.context, x + 8, blockTop - 106, colWidth - 16, regular, 7)
    page.drawText(signature?.firmadaEn ? `UTC ${signature.firmadaEn}` : 'Sin fecha', {
      x: x + 8, y: blockTop - blockHeight + 8, size: 6.5, font: regular, color: rgb(0.4, 0.43, 0.47),
    })
  }
  y = blockTop - blockHeight - 18

  text('Registro generado automáticamente por el portal de ACAV. Los archivos probatorios se conservan en el bucket R2 configurado y se encuentran referenciados en el expediente.', regular, 8)

  pages.forEach((item, index) => {
    item.drawText(`Solicitud ${solicitud.numero}  ·  Página ${index + 1} de ${pages.length}`, {
      x: MARGIN, y: 22, size: 7, font: regular, color: rgb(0.48, 0.51, 0.55),
    })
  })
  return pdf.save()
}

async function drawSignature(pdf: PDFDocument, page: PDFPage, signature: FirmaGuardada, x: number, y: number, width: number, height: number) {
  try {
    const base64 = signature.imagen.split(',')[1]
    if (!base64) return
    const image = await pdf.embedPng(Buffer.from(base64, 'base64'))
    const scale = Math.min(width / image.width, height / image.height)
    page.drawImage(image, { x, y: y + (height - image.height * scale) / 2, width: image.width * scale, height: image.height * scale })
  } catch {
    page.drawText('Firma registrada', { x, y: y + 24, size: 8, font: await pdf.embedFont(StandardFonts.Helvetica), color: rgb(0.35, 0.38, 0.42) })
  }
}

function drawWrappedInBox(page: PDFPage, value: string, x: number, y: number, width: number, font: PDFFont, size: number) {
  const words = pdfSafe(value).split(/\s+/)
  let line = ''
  let currentY = y
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) > width && line) {
      page.drawText(line, { x, y: currentY, size, font, color: rgb(0.25, 0.28, 0.32) })
      line = word
      currentY -= 9
    } else line = next
    if (currentY < y - 24) break
  }
  if (line && currentY >= y - 24) page.drawText(line, { x, y: currentY, size, font, color: rgb(0.25, 0.28, 0.32) })
}

function formatDate(value: string | null) {
  return value ? new Date(value).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC') : '—'
}

function formatBytes(value: number) {
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

function pdfSafe(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').normalize('NFC').replace(/[^\u0020-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u20ac]/g, '?')
}
