'use client'

import { useRef, useState } from 'react'
import { FiTrash2, FiUploadCloud } from 'react-icons/fi'

interface PublicImageUploaderProps {
  value: string
  folder: 'socios' | 'blog' | 'aliados'
  onChange: (url: string) => void
  label?: string
}

export default function PublicImageUploader({
  value,
  folder,
  onChange,
  label = 'Subir imagen',
}: PublicImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', folder)

      const response = await fetch('/api/uploads', { method: 'POST', body })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'No se pudo subir la imagen.')

      onChange(data.url as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Vista previa"
            className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-300">
            <FiUploadCloud className="text-xl" />
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
              onClick={() => onChange('')}
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
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
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
