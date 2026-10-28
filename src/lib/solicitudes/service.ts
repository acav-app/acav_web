import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import { PNG } from 'pngjs'

import { solicitudesDb, FieldValue, Timestamp } from './firestore'
import { confirmarSubidaSolicitud, crearSubidaSolicitud, deleteSolicitudFile, signedSolicitudDownload } from './storage'

import { borradorIngresoSchema, normalizarDatosIngreso } from './schema'
import {
  DATOS_INGRESO_VACIOS,
  DOCUMENTOS_INGRESO,
  migrarDatosIngreso,
  nombreCompleto,
  type DatosIngreso,
  type DocumentoGuardado,
  type DocumentoIngreso,
  type FirmaGuardada,
  type SolicitudIngreso,
  type SolicitudIngresoResumen,
} from './types'

export const SOLICITUDES_INGRESO_COLLECTION = 'solicitudes_ingreso'
const BORRADOR_VIGENCIA_DIAS = 30
const INVITACION_VIGENCIA_DIAS = 10
// Keep three captured signatures comfortably below Firestore's 1 MiB document limit.
const MAX_FIRMA_BYTES = 128 * 1024

interface StoredInvite {
  hash: string
  expiresAt: string
  usedAt?: string | null
}

interface StoredSolicitudIngreso {
  id: string
  numero: string
  estado: string
  datos: DatosIngreso
  documentos: Partial<Record<DocumentoIngreso, DocumentoGuardado>>
  firmas: Partial<Record<'solicitante' | 'aval1' | 'aval2', FirmaGuardada>>
  pdfKey: string
  notas: string
  createdAt: unknown
  updatedAt: unknown
  expiresAt: string | null
  notificaciones: SolicitudIngreso['notificaciones']
  draftHash?: string
  draftExpiresAt?: string
  invites?: Partial<Record<'aval1' | 'aval2', StoredInvite>>
  pendingUploads?: Partial<Record<DocumentoIngreso, { key: string; contentType: string; size: number; expiresAt: string }>>
}

function collection() {
  return solicitudesDb().collection(SOLICITUDES_INGRESO_COLLECTION)
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function validarTokenAval(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('El enlace de firma es inválido, ya se usó o venció.')
}

function tokenSeguro() {
  return randomBytes(32).toString('base64url')
}

function fecha(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function asIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  return typeof value === 'string' ? value : null
}

function asStored(data: Record<string, unknown>, id: string): StoredSolicitudIngreso {
  return {
    ...(data as unknown as StoredSolicitudIngreso),
    id,
    numero: typeof data.numero === 'string' ? data.numero : `ACAV-${id.slice(0, 8).toUpperCase()}`,
    estado: typeof data.estado === 'string' ? data.estado : 'BORRADOR',
    datos: migrarDatosIngreso(data.datos),
    documentos: (data.documentos as StoredSolicitudIngreso['documentos']) ?? {},
    firmas: (data.firmas as StoredSolicitudIngreso['firmas']) ?? {},
    pdfKey: typeof data.pdfKey === 'string' ? data.pdfKey : '',
    notas: typeof data.notas === 'string' ? data.notas : '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : null,
    notificaciones: (data.notificaciones as StoredSolicitudIngreso['notificaciones']) ?? {},
  }
}

function publicRecord(stored: StoredSolicitudIngreso): SolicitudIngreso {
  let estado = stored.estado as SolicitudIngreso['estado']
  const expiracion = stored.expiresAt ? new Date(stored.expiresAt).getTime() : NaN
  const draftExpiracion = stored.draftExpiresAt ? new Date(stored.draftExpiresAt).getTime() : NaN
  if (
    (['PENDIENTE_AVAL_1', 'PENDIENTE_AVAL_2'].includes(estado) && Number.isFinite(expiracion) && expiracion < Date.now()) ||
    (estado === 'BORRADOR' && Number.isFinite(draftExpiracion) && draftExpiracion < Date.now())
  ) {
    estado = 'VENCIDO'
  }
  return {
    id: stored.id,
    numero: stored.numero,
    estado,
    datos: stored.datos,
    documentos: stored.documentos,
    firmas: stored.firmas,
    pdfKey: stored.pdfKey,
    notas: stored.notas,
    createdAt: asIso(stored.createdAt),
    updatedAt: asIso(stored.updatedAt),
    expiresAt: stored.expiresAt,
    notificaciones: stored.notificaciones,
  }
}

function assertDraft(stored: StoredSolicitudIngreso, token: string) {
  if (!token || !stored.draftHash || stored.draftHash !== hashToken(token)) throw new Error('El borrador no existe o el acceso venció. Iniciá una nueva solicitud.')
  if (!stored.draftExpiresAt || new Date(stored.draftExpiresAt).getTime() < Date.now()) throw new Error('El borrador venció. Iniciá una nueva solicitud.')
  if (stored.estado !== 'BORRADOR') throw new Error('Esta solicitud ya fue enviada y no admite cambios.')
}

export async function crearBorradorIngreso() {
  const ref = collection().doc()
  const token = tokenSeguro()
  const numero = `ACAV-${new Date().getFullYear()}-${ref.id.slice(0, 6).toUpperCase()}`
  await ref.set({
    id: ref.id,
    numero,
    estado: 'BORRADOR',
    datos: DATOS_INGRESO_VACIOS,
    documentos: {},
    firmas: {},
    pdfKey: '',
    notas: '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    expiresAt: null,
    notificaciones: {},
    draftHash: hashToken(token),
    draftExpiresAt: fecha(BORRADOR_VIGENCIA_DIAS),
  })
  return { id: ref.id, numero, token }
}

export async function obtenerBorradorIngreso(id: string, token: string) {
  const snapshot = await collection().doc(id).get()
  if (!snapshot.exists) throw new Error('El borrador no existe o el acceso venció.')
  const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
  assertDraft(stored, token)
  return { id, numero: stored.numero, datos: stored.datos, documentos: stored.documentos, borradorExpira: stored.draftExpiresAt }
}

export async function guardarDatosBorrador(id: string, token: string, input: unknown) {
  const parsed = borradorIngresoSchema.parse(input)
  const serialized = JSON.stringify(parsed)
  if (serialized.length > 60_000) throw new Error('Los datos del borrador superan el tamaño permitido.')
  const ref = collection().doc(id)
  await solicitudesDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) throw new Error('El borrador no existe o el acceso venció.')
    const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
    assertDraft(stored, token)
    const datos = mergeDraftData(stored.datos, parsed as unknown as Partial<DatosIngreso>)
    transaction.update(ref, { datos, updatedAt: FieldValue.serverTimestamp() })
  })
  return { ok: true }
}

function mergeDraftData(existing: DatosIngreso, patch: Partial<DatosIngreso>): DatosIngreso {
  const merged = { ...existing, ...patch }
  if (patch.titulares) merged.titulares = patch.titulares.map((item, index) => ({ ...existing.titulares[index], ...item })) as DatosIngreso['titulares']
  if (patch.delegado) merged.delegado = { ...existing.delegado, ...patch.delegado }
  if (patch.subdelegado) merged.subdelegado = { ...existing.subdelegado, ...patch.subdelegado }
  if (patch.avales) merged.avales = patch.avales.map((item, index) => ({ ...existing.avales[index], ...item })) as DatosIngreso['avales']
  return migrarDatosIngreso(merged)
}

export async function iniciarSubidaDocumento(input: {
  id: string
  token: string
  slot: DocumentoIngreso
  contentType: string
  size: number
}) {
  const ref = collection().doc(input.id)
  const snapshot = await ref.get()
  if (!snapshot.exists) throw new Error('El borrador no existe o el acceso venció.')
  const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
  assertDraft(stored, input.token)
  const upload = await crearSubidaSolicitud({ solicitudId: input.id, slot: input.slot, contentType: input.contentType, size: input.size })
  const expiresAt = new Date(Date.now() + upload.expiresIn * 1000).toISOString()
  await solicitudesDb().runTransaction(async (transaction) => {
    const fresh = await transaction.get(ref)
    if (!fresh.exists) throw new Error('El borrador no existe o el acceso venció.')
    const latest = asStored(fresh.data() as Record<string, unknown>, fresh.id)
    assertDraft(latest, input.token)
    transaction.update(ref, {
      [`pendingUploads.${input.slot}`]: { key: upload.key, contentType: input.contentType, size: input.size, expiresAt },
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
  return upload
}

export async function confirmarDocumentoIngreso(input: {
  id: string
  token: string
  slot: DocumentoIngreso
  nombre: string
  key: string
}) {
  const ref = collection().doc(input.id)
  const snapshot = await ref.get()
  if (!snapshot.exists) throw new Error('El borrador no existe o el acceso venció.')
  const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
  assertDraft(stored, input.token)
  const pending = stored.pendingUploads?.[input.slot]
  if (!pending || pending.key !== input.key || new Date(pending.expiresAt).getTime() < Date.now()) {
    throw new Error('La carga expiró o no corresponde a esta solicitud. Volvé a seleccionar el archivo.')
  }
  const verified = await confirmarSubidaSolicitud({
    key: pending.key,
    solicitudId: input.id,
    slot: input.slot,
    contentType: pending.contentType,
    size: pending.size,
  })
  const documento: DocumentoGuardado = {
    key: verified.key,
    nombre: input.nombre.trim().slice(0, 180),
    contentType: verified.contentType,
    size: verified.size,
    uploadedAt: new Date().toISOString(),
  }
  let previousKey = ''
  try {
    previousKey = await solicitudesDb().runTransaction(async (transaction) => {
      const fresh = await transaction.get(ref)
      if (!fresh.exists) throw new Error('El borrador no existe o el acceso venció.')
      const latest = asStored(fresh.data() as Record<string, unknown>, fresh.id)
      assertDraft(latest, input.token)
      if (latest.pendingUploads?.[input.slot]?.key !== input.key) throw new Error('La carga fue reemplazada. Volvé a seleccionar el archivo.')
      const previous = latest.documentos[input.slot]?.key ?? ''
      transaction.update(ref, {
        [`documentos.${input.slot}`]: documento,
        [`pendingUploads.${input.slot}`]: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      return previous
    })
  } catch (error) {
    await deleteSolicitudFile(documento.key).catch((cleanupError) => console.error('[solicitud-document-orphan-cleanup]', cleanupError))
    throw error
  }
  if (previousKey && previousKey !== documento.key) await deleteSolicitudFile(previousKey).catch((error) => console.error('[delete-replaced-solicitud-document]', error))
  return { nombre: documento.nombre, contentType: documento.contentType, size: documento.size, uploadedAt: documento.uploadedAt }
}

export async function urlDocumentoIngreso(id: string, slot: DocumentoIngreso) {
  const solicitud = await obtenerSolicitudIngreso(id)
  const stored = await collection().doc(id).get()
  if (!solicitud || !stored.exists) throw new Error('No se encontró la solicitud.')
  const documento = solicitud.documentos[slot]
  if (!documento?.key) throw new Error('El documento no está disponible.')
  return signedSolicitudDownload(documento.key, documento.nombre, documento.contentType)
}

export async function urlDocumentoBorrador(id: string, token: string, slot: DocumentoIngreso) {
  const snapshot = await collection().doc(id).get()
  if (!snapshot.exists) throw new Error('El borrador no existe o el acceso venció.')
  const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
  assertDraft(stored, token)
  const documento = stored.documentos[slot]
  if (!documento?.key) throw new Error('El documento todavía no está cargado.')
  return signedSolicitudDownload(documento.key, documento.nombre, documento.contentType)
}

export async function urlExpedienteIngreso(id: string) {
  const storedSnapshot = await collection().doc(id).get()
  if (!storedSnapshot.exists) throw new Error('No se encontró la solicitud.')
  const stored = asStored(storedSnapshot.data() as Record<string, unknown>, storedSnapshot.id)
  if (!stored.pdfKey) throw new Error('El expediente PDF todavía no está disponible.')
  return signedSolicitudDownload(stored.pdfKey, `${stored.numero}-expediente.pdf`, 'application/pdf')
}

export async function enviarSolicitudIngreso(input: {
  id: string
  token: string
  datos: unknown
  firmaApellidos: string
  firmaNombres: string
  firmaImagen: string
  aceptaDeclaracion: boolean
  ip: string
  userAgent: string
}) {
  const datos = normalizarDatosIngreso(input.datos)
  const firmaApellidos = input.firmaApellidos.trim().slice(0, 100)
  const firmaNombres = input.firmaNombres.trim().slice(0, 100)
  if (!firmaApellidos || !firmaNombres) throw new Error('Ingresá los apellidos y nombres de quien firma por la agencia.')
  const firmaNombre = `${firmaNombres} ${firmaApellidos}`.slice(0, 160)
  if (input.aceptaDeclaracion !== true) throw new Error('Debés aceptar la declaración para enviar la solicitud.')
  const signatureBytes = validarImagenFirma(input.firmaImagen)
  const ref = collection().doc(input.id)
  const result = await solicitudesDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) throw new Error('El borrador no existe o el acceso venció.')
    const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
    assertDraft(stored, input.token)
    const missing = DOCUMENTOS_INGRESO.filter((slot) => !stored.documentos[slot])
    if (missing.length) throw new Error(`Falta adjuntar: ${missing.map((slot) => slot.replaceAll('_', ' ')).join(', ')}.`)
    if (!stored.datos) throw new Error('Completá los datos antes de enviar la solicitud.')
    const invite = tokenSeguro()
    const firmas: StoredSolicitudIngreso['firmas'] = {
      solicitante: {
        nombre: firmaNombre,
        imagen: input.firmaImagen,
        firmadaEn: new Date().toISOString(),
        ip: input.ip.slice(0, 80),
        userAgent: input.userAgent.slice(0, 500),
      },
    }
    transaction.update(ref, {
      datos,
      estado: 'PENDIENTE_AVAL_1',
      firmas,
      draftHash: FieldValue.delete(),
      draftExpiresAt: FieldValue.delete(),
      expiresAt: fecha(INVITACION_VIGENCIA_DIAS),
      invites: { aval1: { hash: hashToken(invite), expiresAt: fecha(INVITACION_VIGENCIA_DIAS), usedAt: null } },
      notificaciones: { aval1: 'fallida' },
      updatedAt: FieldValue.serverTimestamp(),
    })
    return { token: invite, email: datos.avales[0].email, numero: stored.numero, agencia: datos.razonSocial }
  })

  // `signatureBytes` validates the PNG data URL and intentionally is not persisted separately.
  void signatureBytes
  return { id: input.id, ...result }
}

export async function buscarAval(token: string) {
  validarTokenAval(token)
  const tokenHash = hashToken(token)
  const snapshot = await collection().where('invites.aval1.hash', '==', tokenHash).limit(1).get()
    .catch(() => collection().where('invites.aval2.hash', '==', tokenHash).limit(1).get())
  // The first query may return an empty result rather than throw. Search the second stage as needed.
  const found = snapshot.empty
    ? await collection().where('invites.aval2.hash', '==', tokenHash).limit(1).get()
    : snapshot
  if (found.empty) throw new Error('El enlace de firma es inválido, ya se usó o venció.')
  const doc = found.docs[0]
  const stored = asStored(doc.data() as Record<string, unknown>, doc.id)
  const step: 1 | 2 = stored.estado === 'PENDIENTE_AVAL_2' ? 2 : 1
  const invite = stored.invites?.[`aval${step}`]
  if (!invite || invite.hash !== tokenHash || invite.usedAt) throw new Error('El enlace de firma es inválido o ya se usó.')
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    await doc.ref.update({ estado: 'VENCIDO', updatedAt: FieldValue.serverTimestamp() })
    throw new Error('El enlace de firma venció. Contactá a ACAV para solicitar uno nuevo.')
  }
  const aval = stored.datos.avales[step - 1]
  return {
    solicitudId: stored.id,
    numero: stored.numero,
    paso: step,
    agencia: stored.datos.razonSocial,
    categoria: stored.datos.categoria,
    legajo: stored.datos.legajo,
    actividad: stored.datos.actividadPrincipal,
    localidad: stored.datos.domicilioFisico,
    titulares: stored.datos.titulares.map(nombreCompleto),
    delegado: nombreCompleto(stored.datos.delegado),
    subdelegado: nombreCompleto(stored.datos.subdelegado),
    firmaSolicitante: stored.firmas.solicitante?.imagen ?? '',
    firmaAval1: step === 2 ? stored.firmas.aval1?.imagen ?? '' : '',
    nombreAval: aval.agencia,
    emailAval: aval.email,
    expira: invite.expiresAt,
  }
}

export async function firmarAval(input: {
  token: string
  apellidos: string
  nombres: string
  imagen: string
  acepta: boolean
  ip: string
  userAgent: string
}) {
  if (!input.acepta) throw new Error('Debés aceptar la declaración de aval antes de firmar.')
  validarTokenAval(input.token)
  const apellidos = input.apellidos.trim().slice(0, 100)
  const nombres = input.nombres.trim().slice(0, 100)
  if (!apellidos || !nombres) throw new Error('Ingresá tus apellidos y nombres.')
  const nombre = `${nombres} ${apellidos}`.slice(0, 160)
  validarImagenFirma(input.imagen)
  const hashed = hashToken(input.token)
  const first = await collection().where('invites.aval1.hash', '==', hashed).limit(1).get()
  const query = first.empty ? await collection().where('invites.aval2.hash', '==', hashed).limit(1).get() : first
  if (query.empty) throw new Error('El enlace de firma es inválido, ya se usó o venció.')
  const ref = query.docs[0].ref
  const transition = await solicitudesDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) throw new Error('La solicitud ya no está disponible.')
    const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
    const step: 0 | 1 | 2 = stored.estado === 'PENDIENTE_AVAL_1' ? 1 : stored.estado === 'PENDIENTE_AVAL_2' ? 2 : 0
    if (!step) throw new Error('Esta solicitud ya no admite firmas.')
    const key = `aval${step}` as 'aval1' | 'aval2'
    const invite = stored.invites?.[key]
    if (!invite || invite.hash !== hashed || invite.usedAt) throw new Error('El enlace de firma es inválido o ya se usó.')
    if (new Date(invite.expiresAt).getTime() < Date.now()) return { expired: true as const, next: null, completed: false }
    const signature: FirmaGuardada = {
      nombre,
      imagen: input.imagen,
      firmadaEn: new Date().toISOString(),
      ip: input.ip.slice(0, 80),
      userAgent: input.userAgent.slice(0, 500),
    }
    const updatedInvites = { ...(stored.invites ?? {}), [key]: { ...invite, usedAt: new Date().toISOString(), hash: '' } }
    const updatedSignatures = { ...stored.firmas, [key]: signature }
    if (step === 1) {
      const nextToken = tokenSeguro()
      const nextInviteExpiry = fecha(INVITACION_VIGENCIA_DIAS)
      updatedInvites.aval2 = { hash: hashToken(nextToken), expiresAt: nextInviteExpiry, usedAt: null }
      transaction.update(ref, {
        estado: 'PENDIENTE_AVAL_2',
        firmas: updatedSignatures,
        invites: updatedInvites,
        expiresAt: nextInviteExpiry,
        notificaciones: { ...stored.notificaciones, aval2: 'fallida' },
        updatedAt: FieldValue.serverTimestamp(),
      })
      return { expired: false as const, next: { token: nextToken, email: stored.datos.avales[1].email, numero: stored.numero, agencia: stored.datos.razonSocial }, completed: false }
    } else {
      transaction.update(ref, {
        estado: 'COMPLETADO_APROBADO',
        firmas: updatedSignatures,
        invites: updatedInvites,
        expiresAt: null,
        updatedAt: FieldValue.serverTimestamp(),
      })
      return { expired: false as const, next: null, completed: true }
    }
  })
  if (transition.expired) {
    await ref.update({ estado: 'VENCIDO', updatedAt: FieldValue.serverTimestamp() })
    throw new Error('El enlace de firma venció. Contactá a ACAV para solicitar uno nuevo.')
  }
  const solicitud = await obtenerSolicitudIngreso(ref.id)
  if (!solicitud) throw new Error('No se encontró la solicitud después de registrar la firma.')
  return { next: transition.next, completed: transition.completed, solicitud }
}

function validarImagenFirma(value: string) {
  if (typeof value !== 'string' || !value.startsWith('data:image/png;base64,')) throw new Error('La firma no tiene un formato válido.')
  const raw = Buffer.from(value.slice('data:image/png;base64,'.length), 'base64')
  if (raw.length < 24 || raw.length > MAX_FIRMA_BYTES || raw[0] !== 0x89 || raw[1] !== 0x50 || raw[2] !== 0x4e || raw[3] !== 0x47) {
    throw new Error('La firma está vacía o excede el tamaño permitido.')
  }
  const width = raw.readUInt32BE(16)
  const height = raw.readUInt32BE(20)
  if (!width || !height || width > 3000 || height > 2000 || width * height > 2_000_000) throw new Error('La imagen de firma tiene dimensiones no válidas.')
  let png: PNG
  try {
    png = PNG.sync.read(raw, { checkCRC: true })
  } catch {
    throw new Error('No se pudo verificar la imagen de firma.')
  }
  let inkPixels = 0
  let minX = png.width
  let minY = png.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const alpha = png.data[(y * png.width + x) * 4 + 3]
      if (alpha > 32) {
        inkPixels++
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (inkPixels < 20 || maxX - minX < 8 || maxY - minY < 2) throw new Error('La firma parece vacía. Dibujá una rúbrica más completa.')
  return raw
}

export async function obtenerSolicitudIngreso(id: string): Promise<SolicitudIngreso | null> {
  const snapshot = await collection().doc(id).get()
  if (!snapshot.exists) return null
  return publicRecord(asStored(snapshot.data() as Record<string, unknown>, snapshot.id))
}

export async function listarSolicitudesIngreso(): Promise<SolicitudIngresoResumen[]> {
  const snapshot = await collection().orderBy('createdAt', 'desc').get()
  const records = snapshot.docs.map((doc) => ({ doc, stored: asStored(doc.data() as Record<string, unknown>, doc.id) }))
  const now = Date.now()
  const expired = records.filter(({ stored }) => {
    if (stored.estado === 'BORRADOR' && stored.draftExpiresAt) return new Date(stored.draftExpiresAt).getTime() < now
    return ['PENDIENTE_AVAL_1', 'PENDIENTE_AVAL_2'].includes(stored.estado) && !!stored.expiresAt && new Date(stored.expiresAt).getTime() < now
  })
  await Promise.all(expired.map(({ doc }) => doc.ref.update({ estado: 'VENCIDO', updatedAt: FieldValue.serverTimestamp() })))
  const expiredIds = new Set(expired.map(({ doc }) => doc.id))
  return records.map(({ doc, stored }) => {
    const record = publicRecord(expiredIds.has(doc.id) ? { ...stored, estado: 'VENCIDO' } : stored)
    const firmas: SolicitudIngresoResumen['firmas'] = {}
    for (const key of ['solicitante', 'aval1', 'aval2'] as const) {
      const firma = record.firmas[key]
      if (!firma) continue
      firmas[key] = { nombre: firma.nombre, firmadaEn: firma.firmadaEn }
    }
    return {
      id: record.id,
      numero: record.numero,
      estado: record.estado,
      datos: {
        razonSocial: record.datos.razonSocial,
        categoria: record.datos.categoria,
        legajo: record.datos.legajo,
        email: record.datos.email,
        whatsapp: record.datos.whatsapp,
      },
      firmas,
      notas: record.notas,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
      documentCount: Object.keys(record.documentos).length,
      pdfDisponible: !!record.pdfKey,
      notificaciones: record.notificaciones,
    }
  })
}

export async function guardarNotificacion(id: string, key: 'aval1' | 'aval2' | 'final', enviada: boolean) {
  await collection().doc(id).update({ [`notificaciones.${key}`]: enviada ? 'enviada' : 'fallida', updatedAt: FieldValue.serverTimestamp() })
}

export async function agregarExpedienteYNotificacion(id: string, pdfKey: string, enviada: boolean) {
  await collection().doc(id).update({ pdfKey, 'notificaciones.final': enviada ? 'enviada' : 'fallida', updatedAt: FieldValue.serverTimestamp() })
}

export async function renovarInvitacion(id: string) {
  const ref = collection().doc(id)
  return solicitudesDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) throw new Error('No se encontró la solicitud.')
    const stored = asStored(snapshot.data() as Record<string, unknown>, snapshot.id)
    if (stored.estado !== 'PENDIENTE_AVAL_1' && stored.estado !== 'PENDIENTE_AVAL_2' && stored.estado !== 'VENCIDO') {
      throw new Error('Solo se pueden reenviar invitaciones pendientes o vencidas.')
    }
    const paso: 1 | 2 = stored.estado === 'PENDIENTE_AVAL_2' || (stored.estado === 'VENCIDO' && Boolean(stored.invites?.aval1?.usedAt)) ? 2 : 1
    const token = tokenSeguro()
    const expiration = fecha(INVITACION_VIGENCIA_DIAS)
    transaction.update(ref, {
      estado: paso === 1 ? 'PENDIENTE_AVAL_1' : 'PENDIENTE_AVAL_2',
      [`invites.aval${paso}`]: { hash: hashToken(token), expiresAt: expiration, usedAt: null },
      expiresAt: expiration,
      [`notificaciones.aval${paso}`]: 'fallida',
      updatedAt: FieldValue.serverTimestamp(),
    })
    const aval = stored.datos.avales[paso - 1]
    return { token, email: aval.email, numero: stored.numero, agencia: stored.datos.razonSocial, paso }
  })
}

export async function guardarNotasIngreso(id: string, notas: string) {
  await collection().doc(id).update({ notas: notas.trim().slice(0, 2000), updatedAt: FieldValue.serverTimestamp() })
}

export function esDocumentoIngreso(value: string): value is DocumentoIngreso {
  return (DOCUMENTOS_INGRESO as readonly string[]).includes(value)
}
