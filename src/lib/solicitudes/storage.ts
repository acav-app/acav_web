import 'server-only'

import { randomUUID } from 'node:crypto'

import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let s3: S3Client | null = null

function solicitudesBucket() {
  const bucket = process.env.R2_BUCKET
  if (!bucket) throw new Error('Falta configurar R2_BUCKET para guardar archivos de solicitudes.')
  return bucket
}

function client() {
  if (s3) return s3
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('Faltan las credenciales de R2 para los archivos de solicitudes.')
  }
  s3 = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })
  return s3
}

export function detectDocumentType(bytes: Uint8Array): { mime: string; extension: string } | null {
  const pdfHeader = [0x25, 0x50, 0x44, 0x46, 0x2d]
  for (let offset = 0; offset <= Math.min(bytes.length - pdfHeader.length, 1024 - pdfHeader.length); offset++) {
    if (pdfHeader.every((byte, index) => bytes[offset + index] === byte)) {
      return { mime: 'application/pdf', extension: 'pdf' }
    }
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg' }
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return { mime: 'image/png', extension: 'png' }
  return null
}

export async function crearSubidaSolicitud(input: {
  solicitudId: string
  slot: string
  contentType: string
  size: number
}) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(input.contentType)) throw new Error('Formato no permitido. Usá PDF, JPG o PNG.')
  if (!Number.isInteger(input.size) || input.size < 1 || input.size > 10 * 1024 * 1024) {
    throw new Error('Cada archivo puede pesar hasta 10 MB.')
  }
  const extension = input.contentType === 'application/pdf' ? 'pdf' : input.contentType === 'image/jpeg' ? 'jpg' : 'png'
  const key = `solicitudes-ingreso-tmp/${input.solicitudId}/${input.slot}/${randomUUID()}.${extension}`
  const uploadUrl = await getSignedUrl(client(), new PutObjectCommand({
    Bucket: solicitudesBucket(),
    Key: key,
    ContentType: input.contentType,
    CacheControl: 'private, no-store',
  }), { expiresIn: 300 })
  return { key, uploadUrl, expiresIn: 300, headers: { 'Content-Type': input.contentType, 'Cache-Control': 'private, no-store' } }
}

export async function confirmarSubidaSolicitud(input: {
  key: string
  solicitudId: string
  slot: string
  contentType: string
  size: number
}) {
  const prefix = `solicitudes-ingreso-tmp/${input.solicitudId}/${input.slot}/`
  if (!input.key.startsWith(prefix) || input.key.includes('..')) throw new Error('La referencia del archivo no es válida.')
  const head = await client().send(new HeadObjectCommand({ Bucket: solicitudesBucket(), Key: input.key }))
  if (head.ContentLength !== input.size || head.ContentType !== input.contentType) throw new Error('No se pudo verificar el archivo cargado. Volvé a intentarlo.')
  if (input.size < 1 || input.size > 10 * 1024 * 1024) throw new Error('Cada archivo puede pesar hasta 10 MB.')
  const sample = await client().send(new GetObjectCommand({ Bucket: solicitudesBucket(), Key: input.key, Range: 'bytes=0-1023' }))
  if (!sample.Body) throw new Error('No se pudo verificar el contenido del archivo.')
  const bytes = await sample.Body.transformToByteArray()
  const detected = detectDocumentType(bytes)
  if (!detected || detected.mime !== input.contentType) throw new Error('El contenido del archivo no coincide con el formato indicado.')
  const finalKey = `solicitudes-ingreso/${input.solicitudId}/${input.slot}/${randomUUID()}.${detected.extension}`
  const bucket = solicitudesBucket()
  const copySource = `${bucket}/${input.key.split('/').map(encodeURIComponent).join('/')}`
  await client().send(new CopyObjectCommand({
    Bucket: bucket,
    Key: finalKey,
    CopySource: copySource,
    MetadataDirective: 'REPLACE',
    ContentType: detected.mime,
    CacheControl: 'private, no-store',
  }))
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: input.key })).catch((error) => {
    console.warn('[solicitud-upload-temp-cleanup]', error)
  })
  return { key: finalKey, contentType: detected.mime, size: input.size }
}

export async function saveSolicitudPdf(solicitudId: string, bytes: Uint8Array): Promise<string> {
  const key = `solicitudes-ingreso/${solicitudId}/expediente/${randomUUID()}.pdf`
  await client().send(new PutObjectCommand({
    Bucket: solicitudesBucket(),
    Key: key,
    Body: Buffer.from(bytes),
    ContentType: 'application/pdf',
    CacheControl: 'private, no-store',
    Metadata: { 'application-id': solicitudId, 'document-slot': 'expediente' },
  }))
  return key
}

export async function signedSolicitudDownload(key: string, filename: string, contentType: string) {
  const safeFilename = filename.replace(/[\r\n"\\]/g, '_').slice(0, 150)
  return getSignedUrl(client(), new GetObjectCommand({
    Bucket: solicitudesBucket(),
    Key: key,
    ResponseContentType: contentType,
    ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
    ResponseCacheControl: 'private, no-store',
  }), { expiresIn: 60 })
}

export async function readSolicitudFile(key: string): Promise<Uint8Array> {
  const response = await client().send(new GetObjectCommand({ Bucket: solicitudesBucket(), Key: key }))
  if (!response.Body) throw new Error('No se pudo leer el archivo de la solicitud.')
  return response.Body.transformToByteArray()
}

export async function deleteSolicitudFile(key: string) {
  const allowedPrefix = key.startsWith('solicitudes-ingreso/') || key.startsWith('solicitudes-ingreso-tmp/')
  if (!allowedPrefix || key.includes('..') || key.includes('\\')) {
    throw new Error('La ruta del documento no es válida.')
  }
  await client().send(new DeleteObjectCommand({ Bucket: solicitudesBucket(), Key: key }))
}
