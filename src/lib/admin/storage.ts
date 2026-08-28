import 'server-only'

import { randomUUID } from 'node:crypto'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const MAX_VIDEO_BYTES = 120 * 1024 * 1024

export const UPLOAD_FOLDERS = ['socios', 'blog', 'aliados', 'banner'] as const
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

let client: S3Client | null = null

function getClient(): S3Client {
  if (client) return client

  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('Faltan las credenciales de R2 (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).')
  }

  client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })

  return client
}

function bucketConfig() {
  const bucket = process.env.R2_BUCKET
  const publicBase = process.env.R2_PUBLIC_BASE
  if (!bucket || !publicBase) throw new Error('Faltan R2_BUCKET o R2_PUBLIC_BASE.')
  return { bucket, publicBase: publicBase.replace(/\/+$/, '') }
}

/** Valida tipo y tamaño, y devuelve la key destino. */
function buildKey(contentType: string, size: number, folder: string): string {
  const isVideo = contentType in VIDEO_TYPES
  const extension = IMAGE_TYPES[contentType] ?? VIDEO_TYPES[contentType]

  if (!extension) {
    throw new Error('Formato no permitido. Usá JPG, PNG, WEBP, AVIF, SVG, MP4, WEBM o MOV.')
  }

  const max = isVideo ? MAX_VIDEO_BYTES : MAX_UPLOAD_BYTES
  if (size > max) {
    throw new Error(`El archivo supera el máximo de ${Math.round(max / 1024 / 1024)} MB.`)
  }

  return `${folder}/${randomUUID()}.${extension}`
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const key = buildKey(file.type, file.size, folder)
  const { bucket, publicBase } = bucketConfig()

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return `${publicBase}/${key}`
}

/** URL prefirmada para subir directo a R2 desde el navegador (archivos grandes). */
export async function presignUpload(contentType: string, size: number, folder: string) {
  const key = buildKey(contentType, size, folder)
  const { bucket, publicBase } = bucketConfig()

  const uploadUrl = await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
    { expiresIn: 600 }
  )

  return { uploadUrl, publicUrl: `${publicBase}/${key}` }
}
