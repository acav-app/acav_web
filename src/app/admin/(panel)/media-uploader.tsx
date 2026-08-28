'use client'

import { useRef, useState } from 'react'
import { FiFilm, FiTrash2, FiUploadCloud } from 'react-icons/fi'

type Folder = 'socios' | 'blog' | 'aliados' | 'banner'

interface MediaUploaderProps {
  value: string
  folder: Folder
  accept: 'image' | 'video' | 'both'
  onChange: (url: string, kind: 'imagen' | 'video') => void
  label?: string
}

const ACCEPT_ATTR = {
  image: 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml',
  video: 'video/mp4,video/webm,video/quicktime',
  both: 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml,video/mp4,video/webm,video/quicktime',
}

const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024

async function subirPorServidor(file: File, folder: Folder): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)

  const response = await fetch('/api/admin/uploads', { method: 'POST', body })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'No se pudo subir el archivo.')
  return data.url as string
}

async function subirDirecto(file: File, folder: Folder): Promise<string> {
  const presign = await fetch('/api/admin/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: file.type, size: file.size, folder }),
  })

  const data = await presign.json().catch(() => ({}))
  if (!presign.ok) throw new Error(data.error ?? 'No se pudo preparar la subida.')

  const put = await fetch(data.uploadUrl as string, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  }).catch(() => {
    throw new Error(
      'No se pudo subir el archivo a R2. Verificá que el bucket tenga habilitado CORS para PUT desde este dominio.'
    )
  })

  if (!put.ok) throw new Error('R2 rechazó la subida del archivo.')

  return data.publicUrl as string
}

export default function MediaUploader({
  value,
  folder,
  accept,
  onChange,
  label = 'Subir archivo',
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esVideo = /\.(mp4|webm|mov)$/i.test(value)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)

    try {
      // Los archivos chicos van por el servidor (no requiere CORS); los grandes, directo a R2.
      const url =
        file.size <= SERVER_UPLOAD_LIMIT
          ? await subirPorServidor(file, folder)
          : await subirDirecto(file, folder)

      onChange(url, file.type.startsWith('video/') ? 'video' : 'imagen')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          esVideo ? (
            <video
              src={value}
              muted
              playsInline
              className="h-20 w-32 shrink-0 rounded-xl border border-slate-200 bg-slate-900 object-cover"
            />
          ) : (
            // Los archivos viven en R2; se sirven sin el optimizador de Next.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Vista previa"
              className="h-20 w-32 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
            />
          )
        ) : (
          <span className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-300">
            {accept === 'video' ? <FiFilm className="text-xl" /> : <FiUploadCloud className="text-xl" />}
          </span>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FiUploadCloud />
            {uploading ? 'Subiendo…' : value ? 'Reemplazar' : label}
          </button>

          {value ? (
            <button
              type="button"
              onClick={() => onChange('', 'imagen')}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            >
              <FiTrash2 />
              Quitar
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR[accept]}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
