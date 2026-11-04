import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

import { DOCUMENTOS_INGRESO, DOCUMENTOS_OPCIONALES, ETIQUETAS_DOCUMENTO, nombreCompleto, redesSocialesComoTexto, type FirmaGuardada, type SolicitudIngreso } from './types'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const HEADER_HEIGHT = 70
const FOOTER_SAFE = 56

const COLORS = {
  primary: rgb(0, 136 / 255, 216 / 255),
  navy: rgb(8 / 255, 27 / 255, 69 / 255),
  text: rgb(30 / 255, 41 / 255, 59 / 255),
  muted: rgb(100 / 255, 116 / 255, 139 / 255),
  border: rgb(226 / 255, 232 / 255, 240 / 255),
  surface: rgb(248 / 255, 250 / 255, 252 / 255),
  blueSurface: rgb(239 / 255, 246 / 255, 255 / 255),
  green: rgb(21 / 255, 128 / 255, 61 / 255),
  greenSurface: rgb(240 / 255, 253 / 255, 244 / 255),
  orange: rgb(249 / 255, 73 / 255, 16 / 255),
  orangeSurface: rgb(255 / 255, 247 / 255, 237 / 255),
  red: rgb(185 / 255, 28 / 255, 28 / 255),
  redSurface: rgb(254 / 255, 242 / 255, 242 / 255),
  white: rgb(1, 1, 1),
}

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
    logo = await pdf.embedPng(await readFile(path.join(process.cwd(), 'public/images/logo.png')))
  } catch {
    // The textual brand remains visible if the optional logo asset is unavailable.
  }

  const pages: PDFPage[] = []
  let page = {} as PDFPage
  let y = 0
  let activeSection: { title: string; letter: string } | null = null
  const headerBottom = PAGE_HEIGHT - HEADER_HEIGHT

  const drawSectionHeading = (title: string, letter: string) => {
    page.drawText(letter, { x: MARGIN, y: y - 1, size: 8, font: bold, color: COLORS.primary })
    page.drawText(pdfSafe(title), { x: MARGIN + 22, y: y - 2, size: 12, font: bold, color: COLORS.navy })
    page.drawLine({
      start: { x: MARGIN + 22, y: y - 10 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 10 },
      thickness: 0.7, color: COLORS.border,
    })
    y -= 28
  }

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    pages.push(page)
    page.drawRectangle({ x: 0, y: headerBottom, width: PAGE_WIDTH, height: HEADER_HEIGHT, color: COLORS.primary })
    page.drawRectangle({ x: 0, y: headerBottom - 3, width: PAGE_WIDTH, height: 3, color: COLORS.orange })

    if (logo) {
      const scale = Math.min(100 / logo.width, 32 / logo.height)
      const logoWidth = logo.width * scale
      const logoHeight = logo.height * scale
      page.drawImage(logo, {
        x: MARGIN,
        y: headerBottom + 25,
        width: logoWidth,
        height: logoHeight,
      })
    } else {
      page.drawText('ACAV', { x: MARGIN, y: headerBottom + 32, size: 20, font: bold, color: COLORS.white })
    }

    const rightX = PAGE_WIDTH - MARGIN
    const eyebrow = 'EXPEDIENTE DIGITAL'
    page.drawText(eyebrow, {
      x: rightX - bold.widthOfTextAtSize(eyebrow, 8), y: headerBottom + 45,
      size: 8, font: bold, color: rgb(0.86, 0.94, 1),
    })
    const numberText = solicitud.numero
    page.drawText(numberText, {
      x: rightX - bold.widthOfTextAtSize(numberText, 14), y: headerBottom + 24,
      size: 14, font: bold, color: COLORS.white,
    })
    page.drawText('ASOCIACIÓN CORDOBESA DE AGENCIAS DE VIAJES', {
      x: MARGIN, y: headerBottom + 10, size: 6.5, font: regular, color: rgb(0.86, 0.94, 1),
    })
    y = headerBottom - 27
    if (activeSection) drawSectionHeading(`${activeSection.title} (continuación)`, activeSection.letter)
  }

  const ensureSpace = (needed: number) => {
    if (y - needed < FOOTER_SAFE) newPage()
  }

  const drawSection = (title: string, letter: string, followingSpace = 52) => {
    activeSection = null
    ensureSpace(Math.min(followingSpace + 40, headerBottom - 27 - FOOTER_SAFE))
    y -= 12
    activeSection = { title, letter }
    drawSectionHeading(title, letter)
  }

  type Field = { label: string; value: unknown }
  const fieldGap = 7
  const fieldWidth = (CONTENT_WIDTH - 10) / 2
  const fieldRows = (items: Field[]) => {
    const rows = []
    for (let index = 0; index < items.length; index += 2) {
      const row = items.slice(index, index + 2).map((item) => ({
        ...item,
        lines: wrapText(String(item.value ?? '').trim() || '—', regular, 9, fieldWidth - 22),
        labelLines: wrapText(item.label, bold, 7, fieldWidth - 22),
      }))
      rows.push({ row, height: Math.max(...row.map((item) => 16 + item.labelLines.length * 9 + item.lines.length * 11)) })
    }
    return rows
  }
  const fieldGridHeight = (items: Field[]) => fieldRows(items).reduce((total, row) => total + row.height + fieldGap, 0)

  const drawFieldGrid = (
    items: Field[],
    fillColor: typeof COLORS.surface = COLORS.surface,
  ) => {
    const gap = 10
    const columnWidth = (CONTENT_WIDTH - gap) / 2
    for (const { row, height: rowHeight } of fieldRows(items)) {
      ensureSpace(rowHeight + fieldGap)
      row.forEach((item, column) => {
        const x = MARGIN + column * (columnWidth + gap)
        const top = y
        page.drawRectangle({
          x, y: top - rowHeight, width: columnWidth, height: rowHeight,
          color: fillColor, borderColor: COLORS.border, borderWidth: 0.55,
        })
        item.labelLines.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: x + 11, y: top - 12 - lineIndex * 9, size: 7, font: bold, color: COLORS.muted,
          })
        })
        item.lines.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: x + 11, y: top - 16 - item.labelLines.length * 9 - lineIndex * 11, size: 9, font: regular, color: COLORS.text,
          })
        })
      })
      y -= rowHeight + fieldGap
    }
  }

  const drawSubheading = (title: string, followingSpace: number) => {
    // Keep a person's fields together unless the block itself exceeds a page.
    ensureSpace(Math.min(followingSpace + 25, headerBottom - 27 - 28 - FOOTER_SAFE))
    y -= 8
    page.drawText(pdfSafe(title), { x: MARGIN, y: y - 1, size: 9, font: bold, color: COLORS.primary })
    y -= 17
  }

  const drawEmptyPerson = (label: string) => {
    ensureSpace(28)
    page.drawText(`${label}: no informado.`, { x: MARGIN, y: y - 12, size: 9, font: regular, color: COLORS.muted })
    y -= 28
  }

  newPage()
  page.drawText('SOLICITUD DE INGRESO', { x: MARGIN, y, size: 18, font: bold, color: COLORS.navy })
  y -= 18
  page.drawText('Resumen del trámite y documentación registrada', {
    x: MARGIN, y, size: 9, font: regular, color: COLORS.muted,
  })
  y -= 25

  const d = solicitud.datos
  drawFieldGrid([
    { label: 'NÚMERO DE SOLICITUD', value: solicitud.numero },
    { label: 'CATEGORÍA', value: d.categoria },
    { label: 'ESTADO', value: estadoLegible(solicitud.estado) },
    { label: 'FECHA DE INICIO', value: formatDate(solicitud.createdAt) },
    { label: 'FINALIZACIÓN', value: formatDate(solicitud.firmas.aval2?.firmadaEn ?? null) },
  ], COLORS.blueSurface)

  const agencyFields: Field[] = [
    { label: 'RAZÓN SOCIAL', value: d.razonSocial },
    { label: 'DESIGNACIÓN COMERCIAL', value: d.designacionComercial },
    { label: 'ACTIVIDAD PRINCIPAL', value: d.actividadPrincipal },
    { label: 'LEGAJO', value: d.legajo },
    { label: 'DOMICILIO FÍSICO', value: d.domicilioFisico },
    { label: 'ES FRANQUICIA', value: d.esFranquicia },
    { label: 'ES SUCURSAL', value: d.esSucursal },
    { label: 'POSEE SUCURSALES', value: d.poseeSucursales },
    { label: 'CANTIDAD DE SUCURSALES', value: d.cantidadSucursales },
    { label: 'EMPLEADOS EN CÓRDOBA', value: d.empleadosCordoba || 'No informado' },
    { label: 'CUIT', value: d.cuit },
    { label: 'CONDICIÓN ANTE IVA', value: d.condicionIva },
    { label: 'WHATSAPP', value: d.whatsapp },
    { label: 'EMAIL PRINCIPAL', value: d.email },
    { label: 'SITIO WEB', value: d.sitioWeb },
    { label: 'REDES SOCIALES', value: redesSocialesComoTexto(d.redesSociales) },
  ]
  drawSection('Información de la agencia', 'A', fieldGridHeight(agencyFields))
  drawFieldGrid(agencyFields)

  const titularFields = (titular: typeof d.titulares[number]): Field[] => [
    { label: 'NOMBRE Y APELLIDO', value: nombreCompleto(titular) },
    { label: 'FECHA DE NACIMIENTO', value: formatBirthDate(titular.fechaNacimiento) },
    { label: 'DNI', value: titular.dni },
    { label: 'CELULAR', value: titular.telefono },
    { label: 'EMAIL', value: titular.email },
    { label: 'PROFESIÓN / OCUPACIÓN', value: titular.ocupacion },
  ]
  drawSection('Titulares', 'B', fieldGridHeight(titularFields(d.titulares[0])) + 25)
  for (let index = 0; index < d.titulares.length; index++) {
    const titular = d.titulares[index]
    if (!Object.values(titular).some((value) => value.trim())) {
      drawEmptyPerson(`Titular ${index + 1}`)
      continue
    }
    const fields = titularFields(titular)
    drawSubheading(`Titular ${index + 1}`, fieldGridHeight(fields))
    drawFieldGrid(fields)
  }

  const representativeFields = (persona: typeof d.delegado): Field[] => [
    { label: 'NOMBRE Y APELLIDO', value: nombreCompleto(persona) },
    { label: 'DNI', value: persona.dni },
    { label: 'CELULAR', value: persona.telefono },
    { label: 'EMAIL', value: persona.email },
  ]
  drawSection('Representantes ante ACAV', 'C', fieldGridHeight(representativeFields(d.delegado)) + 25)
  for (const [label, persona] of [['Delegado', d.delegado], ['Subdelegado', d.subdelegado]] as const) {
    if (!Object.values(persona).some((value) => value.trim())) {
      drawEmptyPerson(label)
      continue
    }
    const fields = representativeFields(persona)
    drawSubheading(label, fieldGridHeight(fields))
    drawFieldGrid(fields)
  }

  drawSection('Avales de asociados', 'D', fieldGridHeight(d.avales.flatMap((aval) => [
    { label: 'AGENCIA', value: aval.agencia }, { label: 'EMAIL', value: aval.email },
  ])))
  drawFieldGrid(d.avales.flatMap((aval, index) => [
    { label: `AVAL ${index + 1} · AGENCIA`, value: aval.agencia },
    { label: `AVAL ${index + 1} · EMAIL`, value: aval.email },
  ]))

  const docGap = 10
  const docWidth = (CONTENT_WIDTH - docGap) / 2
  for (let index = 0; index < DOCUMENTOS_INGRESO.length; index += 2) {
    const row = DOCUMENTOS_INGRESO.slice(index, index + 2).map((slot) => {
      const documento = solicitud.documentos[slot]
      const optional = (DOCUMENTOS_OPCIONALES as readonly string[]).includes(slot)
      const labelLines = wrapText(ETIQUETAS_DOCUMENTO[slot], bold, 8, docWidth - 22)
      const fileLines = wrapText(documento?.nombre ?? 'No adjuntado', regular, 8, docWidth - 22)
      return { documento, optional, labelLines, fileLines }
    })
    const rowHeight = Math.max(...row.map(({ labelLines, fileLines }) => 50 + (labelLines.length + fileLines.length) * 9))
    if (index === 0) drawSection('Documentación presentada', 'E', rowHeight + 9)
    ensureSpace(rowHeight + 9)
    row.forEach(({ documento, optional, labelLines, fileLines }, column) => {
      const x = MARGIN + column * (docWidth + docGap)
      const top = y
      const accent = documento ? COLORS.green : optional ? COLORS.muted : COLORS.orange
      page.drawRectangle({
        x, y: top - rowHeight, width: docWidth, height: rowHeight,
        color: documento ? COLORS.greenSurface : optional ? COLORS.surface : COLORS.orangeSurface,
        borderColor: COLORS.border, borderWidth: 0.55,
      })
      page.drawRectangle({ x, y: top - rowHeight, width: 2.5, height: rowHeight, color: accent })
      labelLines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 10, y: top - 14 - lineIndex * 9, size: 8, font: bold, color: COLORS.text,
        })
      })
      const status = documento ? 'ADJUNTADO' : optional ? 'OPCIONAL NO PRESENTADO' : 'PENDIENTE'
      page.drawText(status, {
        x: x + docWidth - 10 - bold.widthOfTextAtSize(status, 6), y: top - rowHeight + 7,
        size: 6, font: bold, color: accent,
      })
      fileLines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 10, y: top - 27 - labelLines.length * 9 - lineIndex * 9,
          size: 8, font: regular, color: documento ? COLORS.text : COLORS.muted,
        })
      })
      if (documento) {
        const metadata = `${formatBytes(documento.size)} · ${formatDate(documento.uploadedAt)}`
        page.drawText(pdfSafe(metadata), {
          x: x + 10, y: top - rowHeight + 18, size: 6.5, font: regular, color: COLORS.muted,
        })
      }
    })
    y -= rowHeight + 9
  }

  const signers: Array<{ label: string; key: 'solicitante' | 'aval1' | 'aval2'; context: string }> = [
    { label: 'SOLICITANTE', key: 'solicitante', context: d.razonSocial },
    { label: 'AVAL 1', key: 'aval1', context: d.avales[0].agencia },
    { label: 'AVAL 2', key: 'aval2', context: d.avales[1].agencia },
  ]
  const signerGap = 10
  const signerWidth = (CONTENT_WIDTH - signerGap * 2) / 3
  for (let index = 0; index < signers.length; index += 3) {
    const row = signers.slice(index, index + 3).map((signer) => {
      const signature = solicitud.firmas[signer.key]
      return {
        signer,
        signature,
        nameLines: wrapText(signature?.nombre ?? 'Sin firma registrada', bold, 8.5, signerWidth - 22),
        contextLines: wrapText(signer.context, regular, 7.5, signerWidth - 20),
        signedLines: wrapText(signature?.firmadaEn ? `Firmada · ${formatDate(signature.firmadaEn)}` : 'Pendiente de firma', regular, 6.5, signerWidth - 22),
      }
    })
    const cardHeight = Math.max(125, ...row.map(({ nameLines, contextLines, signedLines }) => 98 + nameLines.length * 10 + contextLines.length * 9 + signedLines.length * 9))
    if (index === 0) drawSection('Registro de firmas', 'F', cardHeight + 46)
    ensureSpace(cardHeight + 10)
    for (let column = 0; column < row.length; column++) {
      const { signer, signature, nameLines, contextLines, signedLines } = row[column]
      const x = MARGIN + column * (signerWidth + signerGap)
      const top = y
      page.drawRectangle({
        x, y: top - cardHeight, width: signerWidth, height: cardHeight,
        color: COLORS.white, borderColor: COLORS.border, borderWidth: 0.7,
      })
      page.drawText(signer.label, {
        x: x + 11, y: top - 17, size: 7, font: bold, color: COLORS.primary,
      })
      page.drawLine({
        start: { x: x + 11, y: top - 23 }, end: { x: x + signerWidth - 11, y: top - 23 },
        thickness: 0.5, color: COLORS.border,
      })
      if (signature) {
        await drawSignature(pdf, page, signature, x + 11, top - 68, signerWidth - 22, 38, regular)
      } else {
        page.drawText('Firma pendiente', {
          x: x + 11, y: top - 49, size: 8, font: regular, color: COLORS.muted,
        })
      }
      nameLines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 11, y: top - 82 - lineIndex * 10, size: 8.5, font: bold, color: COLORS.text,
        })
      })
      contextLines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 11, y: top - 82 - nameLines.length * 10 - 2 - lineIndex * 9,
          size: 7.5, font: regular, color: COLORS.muted,
        })
      })
      signedLines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 11, y: top - cardHeight + 9 + (signedLines.length - 1 - lineIndex) * 9,
          size: 6.5, font: regular, color: signature ? COLORS.green : COLORS.orange,
        })
      })
    }
    y -= cardHeight + 10
  }

  activeSection = null
  const closingNote = 'Resumen generado automáticamente por el portal de ACAV. Refleja los datos y firmas registrados al momento de su emisión; no incluye el contenido de los archivos adjuntos. Horarios de Argentina (UTC-3).'
  const closingLines = wrapText(closingNote, regular, 7, CONTENT_WIDTH)
  ensureSpace(closingLines.length * 10 + 12)
  y -= 4
  closingLines.forEach((line, index) => {
    page.drawText(line, {
      x: MARGIN, y: y - index * 10, size: 7, font: regular, color: COLORS.muted,
    })
  })

  pages.forEach((item, index) => {
    item.drawLine({
      start: { x: MARGIN, y: 40 }, end: { x: PAGE_WIDTH - MARGIN, y: 40 },
      thickness: 0.6, color: COLORS.border,
    })
    const leftText = 'ACAV · Expediente digital'
    const rightText = `Página ${index + 1} de ${pages.length}`
    item.drawText(leftText, { x: MARGIN, y: 25, size: 7, font: regular, color: COLORS.muted })
    item.drawText(rightText, {
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(rightText, 7),
      y: 25, size: 7, font: regular, color: COLORS.muted,
    })
  })

  return pdf.save()
}

async function drawSignature(
  pdf: PDFDocument,
  page: PDFPage,
  signature: FirmaGuardada,
  x: number,
  y: number,
  width: number,
  height: number,
  regular: PDFFont,
) {
  try {
    const base64 = signature.imagen.split(',')[1]
    if (!base64) return
    const image = await pdf.embedPng(Buffer.from(base64, 'base64'))
    const scale = Math.min(width / image.width, height / image.height)
    page.drawImage(image, {
      x, y: y + (height - image.height * scale) / 2,
      width: image.width * scale, height: image.height * scale,
    })
  } catch {
    page.drawText('Firma registrada', { x, y: y + 15, size: 8, font: regular, color: COLORS.muted })
  }
}

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number) {
  const words = pdfSafe(value).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      if (line) {
        lines.push(line)
        line = ''
      }
      let fragment = ''
      for (const character of word) {
        const next = fragment + character
        if (font.widthOfTextAtSize(next, size) > maxWidth && fragment) {
          lines.push(fragment)
          fragment = character
        } else fragment = next
      }
      line = fragment
      continue
    }
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['—']
}

function estadoLegible(estado: SolicitudIngreso['estado']) {
  const labels: Record<SolicitudIngreso['estado'], string> = {
    BORRADOR: 'Borrador',
    PENDIENTE_AVAL_1: 'Pendiente de firma del Aval 1',
    PENDIENTE_AVAL_2: 'Pendiente de firma del Aval 2',
    COMPLETADO_APROBADO: 'Completado',
    VENCIDO: 'Vencido',
    RECHAZADA: 'Rechazada',
  }
  return labels[estado]
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return pdfSafe(value)
  return `${new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Cordoba',
  }).format(date)}`
}

function formatBirthDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

function pdfSafe(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').normalize('NFC').replace(/[^\u0020-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u20ac]/g, '?')
}
