'use client'

import { useEffect, useRef, useState } from 'react'
import { FiCheckCircle, FiEye, FiLoader, FiRefreshCw, FiUploadCloud } from 'react-icons/fi'

import type { DocumentoGuardado, DocumentoIngreso } from '@/lib/solicitudes/types'

type DocumentoUI = Omit<DocumentoGuardado, 'key'>

interface Props {
  solicitudId: string
  slot: DocumentoIngreso
  label: string
  dni?: boolean
  value?: DocumentoUI
  onChange: (value: DocumentoUI) => void
}

export default function PrivateDocumentInput({ solicitudId, slot, label, dni = false, value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [cameraBusy, setCameraBusy] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      void videoRef.current.play().catch(() => undefined)
    }
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  async function handleFile(file?: File) {
    if (!file) return
    setError('')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Usá un archivo PDF, JPG o PNG.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo supera el máximo de 10 MB.')
      return
    }
    setBusy(true)
    setProgress(0)
    try {
      const presignResponse = await fetch(`/api/solicitudes/ingreso/${solicitudId}/documentos/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, contentType: file.type, size: file.size }),
      })
      const presignData = await presignResponse.json()
      if (!presignResponse.ok) throw new Error(presignData.error ?? 'No se pudo preparar la carga segura.')

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', presignData.uploadUrl)
        Object.entries(presignData.headers as Record<string, string>).forEach(([key, value]) => xhr.setRequestHeader(key, value))
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100))
        }
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Falló la carga segura. Revisá tu conexión y reintentá.'))
        xhr.onerror = () => reject(new Error('Se interrumpió la carga. Revisá tu conexión y reintentá.'))
        xhr.onabort = () => reject(new Error('La carga fue cancelada.'))
        xhr.send(file)
      })

      const confirmResponse = await fetch(`/api/solicitudes/ingreso/${solicitudId}/documentos/confirmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, nombre: file.name, key: presignData.key }),
      })
      const confirmData = await confirmResponse.json()
      if (!confirmResponse.ok) throw new Error(confirmData.error ?? 'No se pudo verificar el archivo.')
      onChange(confirmData.documento as DocumentoUI)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el archivo.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
      if (cameraRef.current) cameraRef.current.value = ''
    }
  }

  async function openCamera() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      cameraRef.current?.click()
      return
    }
    setCameraBusy(true)
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      setStream(cameraStream)
      setCameraOpen(true)
    } catch {
      setError('No se pudo acceder a la cámara. Podés volver a intentar o elegir una foto del dispositivo.')
      cameraRef.current?.click()
    } finally {
      setCameraBusy(false)
    }
  }

  function closeCamera() {
    stream?.getTracks().forEach((track) => track.stop())
    setStream(null)
    setCameraOpen(false)
  }

  async function takePhoto() {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) {
      setError('La cámara todavía no está lista. Esperá un momento y volvé a intentar.')
      return
    }
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 2400 / Math.max(video.videoWidth, video.videoHeight))
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) { setError('No se pudo procesar la foto.'); return }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) { setError('No se pudo generar la foto.'); return }
    const file = new File([blob], `${slot}-${new Date().toISOString().slice(0, 10)}.jpg`, { type: 'image/jpeg' })
    closeCamera()
    await handleFile(file)
  }

  async function openSavedFile() {
    if (!value) return
    setError('')
    const tab = window.open('about:blank', '_blank')
    if (tab) tab.opener = null
    try {
      const response = await fetch(`/api/solicitudes/ingreso/${solicitudId}/documentos/${slot}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'No se pudo abrir el documento.')
      if (tab) tab.location.href = data.url
      else window.location.href = data.url
    } catch (err) {
      tab?.close()
      setError(err instanceof Error ? err.message : 'No se pudo abrir el documento.')
    }
  }

  return (
    <div className={`rounded-2xl border p-4 transition ${value ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{label} <span className="text-accent-500">*</span></p>
          <p className="mt-1 truncate text-xs text-slate-500">{value ? value.nombre : 'PDF, JPG o PNG · máximo 10 MB'}</p>
        </div>
        {value ? <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-600" aria-label="Archivo cargado" /> : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {dni ? (
          <button type="button" onClick={() => void openCamera()} disabled={busy || cameraBusy} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary-50 px-3.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-60">
            {busy || cameraBusy ? <FiLoader className="animate-spin" /> : <span aria-hidden>📷</span>} Sacar foto
          </button>
        ) : null}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          {busy ? <FiLoader className="animate-spin" /> : value ? <FiRefreshCw /> : <FiUploadCloud />}
          {busy ? `Subiendo ${progress}%` : value ? 'Reemplazar' : 'Elegir archivo'}
        </button>
        {value ? <button type="button" onClick={openSavedFile} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"><FiEye /> Ver</button> : null}
        <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/jpeg,image/png" capture="environment" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
      </div>
      {busy ? (
        <div className="mt-3" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${Math.max(progress, 4)}%` }} /></div>
          <p className="mt-1.5 text-xs text-slate-500">Cargando y verificando el archivo…</p>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs font-medium text-red-600" role="alert">{error}</p> : null}
      {cameraOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4" role="dialog" aria-modal="true" aria-label={`Sacar foto: ${label}`}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="font-bold text-slate-900">Sacar foto</p><p className="text-xs text-slate-500">{label} · verificá que se lea completo</p></div><button type="button" onClick={closeCamera} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cerrar</button></div>
            <video ref={videoRef} autoPlay muted playsInline className="max-h-[65vh] min-h-52 w-full bg-slate-950 object-contain" />
            <div className="flex items-center justify-between gap-3 p-4"><p className="text-xs text-slate-500">La imagen se envía directamente al bucket R2 configurado.</p><button type="button" onClick={() => void takePhoto()} className="shrink-0 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-white hover:bg-accent-600">Tomar foto</button></div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
