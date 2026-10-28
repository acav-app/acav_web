'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiLoader, FiSave, FiSend } from 'react-icons/fi'

import { validarCuit, solicitudIngresoSchema } from '@/lib/solicitudes/schema'
import { esUrlValida, validarFechaNacimiento, validarTelefonoArgentino, validarUrls } from '@/lib/solicitudes/validation'
import {
  DATOS_INGRESO_VACIOS,
  DOCUMENTOS_INGRESO,
  ETIQUETAS_DOCUMENTO,
  migrarDatosIngreso,
  nombreCompleto,
  type DatosIngreso,
  type DocumentoGuardado,
  type DocumentoIngreso,
  type PersonaTitular,
  type RepresentanteIngreso,
} from '@/lib/solicitudes/types'
import PrivateDocumentInput from './private-document-input'
import SignaturePad from './signature-pad'

type DocumentoUI = Omit<DocumentoGuardado, 'key'>
type DraftCredentials = { id: string; numero: string }
type InitializedDraft = { credentials: DraftCredentials; data: DatosIngreso; documents: Partial<Record<DocumentoIngreso, DocumentoUI>> }
type FieldError = Record<string, string>

const STEPS = ['Agencia', 'Personas', 'Avales', 'Documentación', 'Revisión y firma']
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
const DRAFT_STORAGE_KEY = 'acav-ingreso-borrador'

function readDraftCredentials() {
  let cached: string | null = null
  try { cached = window.localStorage.getItem(DRAFT_STORAGE_KEY) } catch { /* Storage may be disabled. */ }
  if (!cached) {
    try { cached = window.sessionStorage.getItem(DRAFT_STORAGE_KEY) } catch { /* Storage may be disabled. */ }
  }
  if (cached) persistDraftCredentials(cached)
  return cached
}

function persistDraftCredentials(value: string) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, value)
    try { window.sessionStorage.removeItem(DRAFT_STORAGE_KEY) } catch { /* Ignore unavailable session storage. */ }
    return
  } catch {
    try { window.sessionStorage.setItem(DRAFT_STORAGE_KEY, value) } catch { /* The in-memory draft still works for this visit. */ }
  }
}

function clearDraftCredentials() {
  try { window.localStorage.removeItem(DRAFT_STORAGE_KEY) } catch { /* Ignore unavailable local storage. */ }
  try { window.sessionStorage.removeItem(DRAFT_STORAGE_KEY) } catch { /* Ignore unavailable session storage. */ }
}

function Campo({ label, required, error, hint, children }: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required ? <span className="text-accent-500"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600" role="alert">{error}</span> : null}
    </label>
  )
}

function TextField({ label, value, onChange, required = true, error, type = 'text', placeholder, hint, inputMode, maxLength, onBlur }: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  type?: string
  placeholder?: string
  hint?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  onBlur?: () => void
}) {
  return (
    <Campo label={label} required={required} error={error} hint={hint}>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className={inputClass}
        autoComplete="off"
      />
    </Campo>
  )
}

function fechaIsoAArgentina(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

function fechaArgentinaAIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return ''
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function FechaArgentina({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  const [displayValue, setDisplayValue] = useState(() => fechaIsoAArgentina(value))

  useEffect(() => {
    setDisplayValue(fechaIsoAArgentina(value))
  }, [value])

  return (
    <Campo label="Fecha de nacimiento" required error={error} hint="Día / mes / año.">
      <input
        type="text"
        value={displayValue}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, 8)
          const formatted = digits.length > 4
            ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
            : digits.length > 2
              ? `${digits.slice(0, 2)}/${digits.slice(2)}`
              : digits
          setDisplayValue(formatted)
          onChange(fechaArgentinaAIso(formatted) || formatted)
        }}
        inputMode="numeric"
        autoComplete="bday"
        maxLength={10}
        placeholder="DD/MM/AAAA"
        aria-invalid={Boolean(error)}
        className={inputClass}
      />
    </Campo>
  )
}

function SelectField({ label, value, onChange, options, required = true, error, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  required?: boolean
  error?: string
  hint?: string
}) {
  return (
    <Campo label={label} required={required} error={error} hint={hint}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        <option value="">Seleccioná una opción</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Campo>
  )
}

function formatCuit(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

function emailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

function validateStep(step: number, data: DatosIngreso, docs: Partial<Record<DocumentoIngreso, DocumentoUI>>) {
  const errors: FieldError = {}
  const required = (path: string, value: string, label: string) => {
    if (!value.trim()) errors[path] = `${label} es obligatorio.`
  }
  if (step === 0) {
    const requiredFields: Array<[keyof DatosIngreso, string, string]> = [
      ['categoria', data.categoria, 'El tipo de asociado'], ['razonSocial', data.razonSocial, 'La razón social'],
      ['designacionComercial', data.designacionComercial, 'La designación comercial'], ['actividadPrincipal', data.actividadPrincipal, 'La actividad principal'],
      ['legajo', data.legajo, 'El legajo'], ['domicilioFisico', data.domicilioFisico, 'El domicilio físico'],
      ['esFranquicia', data.esFranquicia, 'La respuesta de franquicia'],
      ['esSucursal', data.esSucursal, 'La respuesta de sucursal'], ['poseeSucursales', data.poseeSucursales, 'La respuesta de sucursales'],
      ['cuit', data.cuit, 'El CUIT'], ['condicionIva', data.condicionIva, 'La condición ante el IVA'], ['whatsapp', data.whatsapp, 'El WhatsApp'],
      ['email', data.email, 'El email principal'], ['sitioWeb', data.sitioWeb, 'El sitio web'], ['redesSociales', data.redesSociales, 'Las redes sociales'],
    ]
    requiredFields.forEach(([key, value, label]) => required(String(key), value, label))
    if (data.email && !emailValid(data.email)) errors.email = 'Ingresá un email válido.'
    if (data.sitioWeb && !esUrlValida(data.sitioWeb)) errors.sitioWeb = 'Ingresá una URL válida.'
    if (data.redesSociales && !validarUrls(data.redesSociales)) errors.redesSociales = 'Ingresá URLs válidas separadas por coma.'
    if (data.whatsapp && !validarTelefonoArgentino(data.whatsapp)) errors.whatsapp = 'Usá un celular argentino de 10 dígitos, con código de área y sin 0 ni 15.'
    if (data.cuit && !validarCuit(data.cuit.replace(/\D/g, ''))) errors.cuit = 'El CUIT no es válido; revisá sus dígitos.'
    if (data.poseeSucursales === 'Sí' && Number(data.cantidadSucursales) < 1) errors.cantidadSucursales = 'Indicá cuántas sucursales tiene.'
    if (data.poseeSucursales === 'No' && Number(data.cantidadSucursales) !== 0) errors.cantidadSucursales = 'Indicá 0 si no posee sucursales.'
  }
  if (step === 1) {
    data.titulares.forEach((person, index) => {
      const prefix = `titulares.${index}`
      required(`${prefix}.apellidos`, person.apellidos, `Los apellidos del titular ${index + 1}`)
      required(`${prefix}.nombres`, person.nombres, `Los nombres del titular ${index + 1}`)
      required(`${prefix}.fechaNacimiento`, person.fechaNacimiento, `La fecha de nacimiento del titular ${index + 1}`)
      required(`${prefix}.dni`, person.dni, `El DNI del titular ${index + 1}`)
      required(`${prefix}.telefono`, person.telefono, `El celular del titular ${index + 1}`)
      required(`${prefix}.email`, person.email, `El email del titular ${index + 1}`)
      required(`${prefix}.ocupacion`, person.ocupacion, `La profesión del titular ${index + 1}`)
      if (person.dni && !/^\d{7,8}$/.test(person.dni.replace(/\D/g, ''))) errors[`${prefix}.dni`] = 'El DNI debe tener 7 u 8 números.'
      if (person.email && !emailValid(person.email)) errors[`${prefix}.email`] = 'Ingresá un email válido.'
      if (person.telefono && !validarTelefonoArgentino(person.telefono)) errors[`${prefix}.telefono`] = 'Ingresá un celular argentino válido, sin 0 ni 15.'
      if (person.fechaNacimiento && !validarFechaNacimiento(person.fechaNacimiento)) errors[`${prefix}.fechaNacimiento`] = 'Ingresá una fecha válida en formato DD/MM/AAAA, anterior a hoy.'
    })
    ;(['delegado', 'subdelegado'] as const).forEach((role) => {
      const person = data[role]
      const prefix = role
      required(`${prefix}.apellidos`, person.apellidos, `Los apellidos del ${role}`)
      required(`${prefix}.nombres`, person.nombres, `Los nombres del ${role}`)
      required(`${prefix}.dni`, person.dni, `El DNI del ${role}`)
      required(`${prefix}.telefono`, person.telefono, `El celular del ${role}`)
      required(`${prefix}.email`, person.email, `El email del ${role}`)
      if (person.dni && !/^\d{7,8}$/.test(person.dni.replace(/\D/g, ''))) errors[`${prefix}.dni`] = 'El DNI debe tener 7 u 8 números.'
      if (person.email && !emailValid(person.email)) errors[`${prefix}.email`] = 'Ingresá un email válido.'
      if (person.telefono && !validarTelefonoArgentino(person.telefono)) errors[`${prefix}.telefono`] = 'Ingresá un celular argentino válido, sin 0 ni 15.'
    })
  }
  if (step === 2) {
    data.avales.forEach((aval, index) => {
      required(`avales.${index}.agencia`, aval.agencia, `La agencia del Aval ${index + 1}`)
      required(`avales.${index}.email`, aval.email, `El email del Aval ${index + 1}`)
      if (aval.email && !emailValid(aval.email)) errors[`avales.${index}.email`] = 'Ingresá un email válido.'
      if (aval.email.toLowerCase() === data.email.toLowerCase() && data.email) errors[`avales.${index}.email`] = 'Debe ser distinto al email del solicitante.'
    })
    if (data.avales[0].email && data.avales[0].email.toLowerCase() === data.avales[1].email.toLowerCase()) {
      errors['avales.1.email'] = 'Cada aval debe tener un email diferente.'
    }
  }
  if (step === 3) {
    DOCUMENTOS_INGRESO.forEach((slot) => {
      if (!docs[slot]) errors[`documentos.${slot}`] = `Falta adjuntar ${ETIQUETAS_DOCUMENTO[slot].toLowerCase()}.`
    })
  }
  return errors
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-[22px] border border-slate-200 bg-white p-6 md:p-8" aria-label="Cargando el formulario">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-7 w-2/3 rounded bg-slate-200" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => <div key={index}><div className="mb-2 h-3 w-28 rounded bg-slate-200" /><div className="h-12 rounded-xl bg-slate-100" /></div>)}
      </div>
      <div className="mt-8 h-12 rounded-full bg-slate-200" />
    </div>
  )
}

export default function SolicitudIngresoWizard() {
  const [draft, setDraft] = useState<DraftCredentials | null>(null)
  const [data, setData] = useState<DatosIngreso>(DATOS_INGRESO_VACIOS)
  const [documents, setDocuments] = useState<Partial<Record<DocumentoIngreso, DocumentoUI>>>({})
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<FieldError>({})
  const [signature, setSignature] = useState('')
  const [signerApellidos, setSignerApellidos] = useState('')
  const [signerNombres, setSignerNombres] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState<{ numero: string; emailEnviado: boolean } | null>(null)
  const initPromise = useRef<Promise<InitializedDraft> | null>(null)
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve())
  const initialized = useRef(false)
  const dirtyRevision = useRef(0)
  const savedRevision = useRef(0)
  const inFlightRevision = useRef<number | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    let active = true
    if (!initPromise.current) {
      initPromise.current = (async () => {
        const cached = readDraftCredentials()
        if (cached) {
          try {
            const value = JSON.parse(cached) as DraftCredentials
            const response = await fetch(`/api/solicitudes/ingreso/${value.id}`, { cache: 'no-store' })
            if (response.ok) {
              const body = await response.json()
              persistDraftCredentials(JSON.stringify(value))
              return {
                credentials: value,
                data: migrarDatosIngreso(body.datos),
                documents: body.documentos ?? {},
              }
            }
          } catch {
            // The old draft is no longer usable. A clean draft is created below.
          }
          clearDraftCredentials()
        }
        const response = await fetch('/api/solicitudes/ingreso/borradores', { method: 'POST' })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error ?? 'No se pudo iniciar el formulario.')
        const credentials = { id: body.id as string, numero: body.numero as string }
        persistDraftCredentials(JSON.stringify(credentials))
        return { credentials, data: DATOS_INGRESO_VACIOS, documents: {} }
      })()
    }
    initPromise.current.then((initializedDraft) => {
      if (active) {
        setDraft(initializedDraft.credentials)
        setData(initializedDraft.data)
        setDocuments(initializedDraft.documents)
        dirtyRevision.current = 0
        savedRevision.current = 0
        initialized.current = true
        setLoading(false)
      }
    }).catch((error: unknown) => {
      if (active) {
        setFormError(error instanceof Error ? error.message : 'No se pudo iniciar el formulario.')
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  const saveData = useCallback((payload: DatosIngreso, revision = dirtyRevision.current) => {
    if (!draft) return Promise.resolve()
    if (revision === dirtyRevision.current) {
      setSaveError('')
    }
    const task = saveQueue.current.catch(() => undefined).then(async () => {
      inFlightRevision.current = revision
      try {
        const response = await fetch(`/api/solicitudes/ingreso/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error ?? 'No se pudo guardar el borrador.')
        savedRevision.current = Math.max(savedRevision.current, revision)
        if (revision === dirtyRevision.current) setSaved(true)
      } finally {
        if (inFlightRevision.current === revision) inFlightRevision.current = null
      }
    })
    saveQueue.current = task
    return task
  }, [draft])

  useEffect(() => {
    if (!draft || !initialized.current || success) return
    const revision = dirtyRevision.current
    const timer = window.setTimeout(() => {
      if (revision <= savedRevision.current) return
      void saveData(data, revision).catch((error: unknown) => {
        if (revision === dirtyRevision.current) {
          setSaved(false)
          setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el borrador.')
        }
      })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [data, draft, saveData, success])

  useEffect(() => {
    if (!draft || success) return
    const savePendingOnExit = () => {
      const revision = dirtyRevision.current
      if (revision <= savedRevision.current || inFlightRevision.current === revision) return
      void fetch(`/api/solicitudes/ingreso/${draft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataRef.current),
        keepalive: true,
      }).catch(() => undefined)
    }
    window.addEventListener('pagehide', savePendingOnExit)
    return () => window.removeEventListener('pagehide', savePendingOnExit)
  }, [draft, success])

  const documentCount = useMemo(() => DOCUMENTOS_INGRESO.filter((slot) => documents[slot]).length, [documents])
  const progress = success ? 100 : ((step + 1) / STEPS.length) * 100

  function updateData(updater: (current: DatosIngreso) => DatosIngreso) {
    dirtyRevision.current += 1
    setSaved(false)
    setSaveError('')
    setData(updater)
  }

  function setField<K extends keyof DatosIngreso>(key: K, value: DatosIngreso[K]) {
    updateData((current) => ({ ...current, [key]: value }))
    setErrors((current) => { const next = { ...current }; delete next[String(key)]; return next })
  }

  function setPersona(index: 0 | 1, key: keyof PersonaTitular, value: string) {
    updateData((current) => {
      const titulares = [...current.titulares] as DatosIngreso['titulares']
      titulares[index] = { ...titulares[index], [key]: value }
      return { ...current, titulares }
    })
    setErrors((current) => { const next = { ...current }; delete next[`titulares.${index}.${key}`]; return next })
  }

  function setRepresentante(role: 'delegado' | 'subdelegado', key: keyof RepresentanteIngreso, value: string) {
    updateData((current) => ({ ...current, [role]: { ...current[role], [key]: value } }))
    setErrors((current) => { const next = { ...current }; delete next[`${role}.${key}`]; return next })
  }

  function setAval(index: 0 | 1, key: 'agencia' | 'email', value: string) {
    updateData((current) => {
      const avales = [...current.avales] as DatosIngreso['avales']
      avales[index] = { ...avales[index], [key]: value }
      return { ...current, avales }
    })
    setErrors((current) => { const next = { ...current }; delete next[`avales.${index}.${key}`]; return next })
  }

  async function nextStep() {
    setFormError('')
    const nextErrors = validateStep(step, data, documents)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      const first = Object.values(nextErrors)[0]
      setFormError(first)
      document.getElementById('solicitud-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    try {
      await saveData(data)
      setErrors({})
      setStep((current) => Math.min(current + 1, STEPS.length - 1))
      window.scrollTo({ top: document.getElementById('solicitud')?.offsetTop ?? 0, behavior: 'smooth' })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el borrador.')
      setFormError('No pudimos guardar tus cambios. Revisá tu conexión y volvé a intentar.')
    }
  }

  async function sendApplication() {
    setFormError('')
    const parsed = solicitudIngresoSchema.safeParse(data)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Revisá los campos obligatorios.')
      return
    }
    if (!signature) { setFormError('Agregá tu firma manuscrita para continuar.'); return }
    if (!signerApellidos.trim() || !signerNombres.trim()) { setFormError('Indicá los apellidos y nombres de quien firma por la agencia.'); return }
    if (!accepted) { setFormError('Aceptá la declaración y el tratamiento de datos para enviar.'); return }
    if (documentCount !== DOCUMENTOS_INGRESO.length) { setFormError('Completá los 12 adjuntos requeridos.'); setStep(3); return }
    if (!draft) return

    setSending(true)
    try {
      await saveData(data)
      const response = await fetch(`/api/solicitudes/ingreso/${draft.id}/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datos: data, firmaApellidos: signerApellidos, firmaNombres: signerNombres, firmaImagen: signature, aceptaDeclaracion: accepted }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudo enviar la solicitud.')
      setSuccess({ numero: body.numero, emailEnviado: body.emailEnviado })
      clearDraftCredentials()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo enviar la solicitud. Tus datos guardados siguen disponibles para reintentar.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Skeleton />
  if (formError && !draft) {
    return <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-semibold text-red-700">{formError}</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">Reintentar</button>
    </div>
  }
  if (success) {
    return (
      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-6 py-12 text-center md:px-12">
        <FiCheckCircle className="mx-auto text-4xl text-emerald-600" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-700">Solicitud enviada</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">¡Recibimos tu solicitud!</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">Tu trámite quedó registrado con el número <strong>{success.numero}</strong>. {success.emailEnviado ? 'El primer aval recibirá un correo con un enlace seguro para continuar.' : 'El equipo de ACAV revisará el trámite y gestionará el envío del enlace al primer aval.'}</p>
        <div className="mx-auto mt-7 max-w-md rounded-2xl bg-white p-4 text-left text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-800">Próximos pasos</p>
          <ol className="mt-3 space-y-2">
            <li className="flex gap-2"><span className="font-bold text-primary-600">1.</span> Aval 1 revisa y firma desde su email.</li>
            <li className="flex gap-2"><span className="font-bold text-primary-600">2.</span> Aval 2 recibe su invitación cuando firme el primero.</li>
            <li className="flex gap-2"><span className="font-bold text-primary-600">3.</span> Al finalizar, todas las partes reciben el expediente.</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div id="solicitud" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Solicitud de ingreso</p>
          <p className="mt-1 text-xs text-slate-500">Trámite {draft?.numero} · Borrador privado</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
          {saveError ? <span className="text-red-600">No se pudo guardar automáticamente</span> : saved ? <><FiCheck className="text-emerald-600" /> Guardado</> : <><FiSave /> Cambios pendientes de guardar…</>}
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Paso {step + 1} de {STEPS.length}</span><span>{Math.round(progress)}%</span></div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <ol className="grid grid-cols-5 gap-1" aria-label="Progreso del formulario">
          {STEPS.map((label, index) => (
            <li key={label} className={`text-center text-[10px] font-semibold sm:text-xs ${index === step ? 'text-primary-700' : index < step ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`mx-auto mb-1 flex size-7 items-center justify-center rounded-full text-xs ${index < step ? 'bg-emerald-100' : index === step ? 'bg-primary-100' : 'bg-slate-100'}`}>{index < step ? <FiCheck /> : index + 1}</span>
              <span className="hidden sm:block">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 md:p-9">
        <div id="solicitud-error" aria-live="assertive">
          {formError ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{formError}</div> : null}
          {saveError ? <div className="mb-5 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800"><FiSave className="mt-0.5 shrink-0" />{saveError}. No cierres la página; podés reintentar al avanzar.</div> : null}
        </div>

        {step === 0 ? (
          <section aria-labelledby="step-agencia">
            <h3 id="step-agencia" className="text-xl font-bold text-slate-900">Información de la agencia</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Completá los datos institucionales y fiscales de la agencia solicitante.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <SelectField label="Tipo de asociado" value={data.categoria} onChange={(value) => setField('categoria', value as DatosIngreso['categoria'])} options={[{ value: 'Activo', label: 'Asociado activo' }, { value: 'Adherente', label: 'Asociado adherente' }, { value: 'Honorario', label: 'Asociado honorario' }]} error={errors.categoria} />
              <TextField label="Razón social" value={data.razonSocial} onChange={(value) => setField('razonSocial', value)} error={errors.razonSocial} placeholder="Razón social registrada" />
              <TextField label="Designación comercial" value={data.designacionComercial} onChange={(value) => setField('designacionComercial', value)} error={errors.designacionComercial} />
              <TextField label="Actividad principal" value={data.actividadPrincipal} onChange={(value) => setField('actividadPrincipal', value)} error={errors.actividadPrincipal} />
              <TextField label="Legajo" value={data.legajo} onChange={(value) => setField('legajo', value)} error={errors.legajo} />
              <TextField label="CUIT" value={formatCuit(data.cuit)} onChange={(value) => setField('cuit', value.replace(/\D/g, '').slice(0, 11))} error={errors.cuit} placeholder="XX-XXXXXXXX-X" inputMode="numeric" hint="Se valida el dígito verificador." />
              <TextField label="Domicilio físico" value={data.domicilioFisico} onChange={(value) => setField('domicilioFisico', value)} error={errors.domicilioFisico} placeholder="Calle, número, piso, depto, CP y localidad" />
              <SelectField label="¿Es franquicia?" value={data.esFranquicia} onChange={(value) => setField('esFranquicia', value as DatosIngreso['esFranquicia'])} options={[{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }]} error={errors.esFranquicia} />
              <SelectField label="¿Es sucursal?" value={data.esSucursal} onChange={(value) => setField('esSucursal', value as DatosIngreso['esSucursal'])} options={[{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }]} error={errors.esSucursal} />
              <SelectField label="¿Posee sucursales?" value={data.poseeSucursales} onChange={(value) => {
                setField('poseeSucursales', value as DatosIngreso['poseeSucursales'])
                if (value === 'No') setField('cantidadSucursales', '0')
                else if (data.cantidadSucursales === '0') setField('cantidadSucursales', '')
              }} options={[{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }]} error={errors.poseeSucursales} />
              <TextField label="Cantidad de sucursales" value={data.cantidadSucursales} onChange={(value) => setField('cantidadSucursales', value.replace(/\D/g, '').slice(0, 3))} error={errors.cantidadSucursales} inputMode="numeric" hint="Ingresá 0 si no posee sucursales." />
              <TextField label="Empleados en Córdoba" value={data.empleadosCordoba} onChange={(value) => setField('empleadosCordoba', value.replace(/\D/g, '').slice(0, 5))} required={false} error={errors.empleadosCordoba} inputMode="numeric" />
              <SelectField label="Condición ante el IVA" value={data.condicionIva} onChange={(value) => setField('condicionIva', value)} options={[
                { value: 'Responsable Inscripto', label: 'Responsable Inscripto' }, { value: 'Exento', label: 'Exento' },
                { value: 'Monotributista', label: 'Monotributista' }, { value: 'No Responsable', label: 'No Responsable' }, { value: 'Otro', label: 'Otro' },
              ]} error={errors.condicionIva} />
              <TextField label="WhatsApp principal" value={data.whatsapp} onChange={(value) => setField('whatsapp', value)} error={errors.whatsapp} placeholder="3512345678" inputMode="tel" hint="Código de área sin 0 y sin 15." />
              <TextField label="Email principal" value={data.email} onChange={(value) => setField('email', value)} error={errors.email} type="email" placeholder="agencia@ejemplo.com.ar" />
              <TextField label="Sitio web" value={data.sitioWeb} onChange={(value) => setField('sitioWeb', value)} error={errors.sitioWeb} placeholder="https://www.ejemplo.com.ar" />
              <TextField label="Redes sociales" value={data.redesSociales} onChange={(value) => setField('redesSociales', value)} error={errors.redesSociales} placeholder="URLs de perfiles institucionales" hint="Podés ingresar varias URLs separadas por coma." />
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section aria-labelledby="step-personas">
            <h3 id="step-personas" className="text-xl font-bold text-slate-900">Titulares y representantes</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Todos los datos de titulares, delegado y subdelegado son obligatorios.</p>
            <div className="mt-6 space-y-6">
              {data.titulares.map((person, index) => (
                <div key={index} className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                  <h4 className="font-bold text-slate-800">Titular {index + 1}</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <TextField label="Apellidos" value={person.apellidos} onChange={(value) => setPersona(index as 0 | 1, 'apellidos', value)} error={errors[`titulares.${index}.apellidos`]} />
                    <TextField label="Nombres" value={person.nombres} onChange={(value) => setPersona(index as 0 | 1, 'nombres', value)} error={errors[`titulares.${index}.nombres`]} />
                    <FechaArgentina value={person.fechaNacimiento} onChange={(value) => setPersona(index as 0 | 1, 'fechaNacimiento', value)} error={errors[`titulares.${index}.fechaNacimiento`]} />
                    <TextField label="DNI" value={person.dni} onChange={(value) => setPersona(index as 0 | 1, 'dni', value.replace(/\D/g, '').slice(0, 8))} error={errors[`titulares.${index}.dni`]} inputMode="numeric" />
                    <TextField label="Celular" value={person.telefono} onChange={(value) => setPersona(index as 0 | 1, 'telefono', value)} error={errors[`titulares.${index}.telefono`]} inputMode="tel" />
                    <TextField label="Email" type="email" value={person.email} onChange={(value) => setPersona(index as 0 | 1, 'email', value)} error={errors[`titulares.${index}.email`]} />
                    <TextField label="Profesión / ocupación" value={person.ocupacion} onChange={(value) => setPersona(index as 0 | 1, 'ocupacion', value)} error={errors[`titulares.${index}.ocupacion`]} />
                  </div>
                </div>
              ))}
              {(['delegado', 'subdelegado'] as const).map((role) => (
                <div key={role} className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                  <h4 className="font-bold capitalize text-slate-800">{role === 'delegado' ? 'Delegado ante ACAV' : 'Subdelegado ante ACAV'}</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <TextField label="Apellidos" value={data[role].apellidos} onChange={(value) => setRepresentante(role, 'apellidos', value)} error={errors[`${role}.apellidos`]} />
                    <TextField label="Nombres" value={data[role].nombres} onChange={(value) => setRepresentante(role, 'nombres', value)} error={errors[`${role}.nombres`]} />
                    <TextField label="DNI" value={data[role].dni} onChange={(value) => setRepresentante(role, 'dni', value.replace(/\D/g, '').slice(0, 8))} error={errors[`${role}.dni`]} inputMode="numeric" />
                    <TextField label="Celular" value={data[role].telefono} onChange={(value) => setRepresentante(role, 'telefono', value)} error={errors[`${role}.telefono`]} inputMode="tel" />
                    <TextField label="Email" type="email" value={data[role].email} onChange={(value) => setRepresentante(role, 'email', value)} error={errors[`${role}.email`]} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section aria-labelledby="step-avales">
            <h3 id="step-avales" className="text-xl font-bold text-slate-900">Avales de asociados</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Cada aval recibirá un enlace de un solo uso para revisar y firmar en su turno.</p>
            <div className="mt-6 grid gap-4">
              {data.avales.map((aval, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <h4 className="font-bold text-slate-800">Aval {index + 1}</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <TextField label="Nombre de la agencia" value={aval.agencia} onChange={(value) => setAval(index as 0 | 1, 'agencia', value)} error={errors[`avales.${index}.agencia`]} />
                    <TextField label="Email del aval" type="email" value={aval.email} onChange={(value) => setAval(index as 0 | 1, 'email', value)} error={errors[`avales.${index}.email`]} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">Los emails de ambos avales deben ser diferentes entre sí y del email principal de la agencia.</p>
          </section>
        ) : null}

        {step === 3 && draft ? (
          <section aria-labelledby="step-documentos">
            <h3 id="step-documentos" className="text-xl font-bold text-slate-900">Documentación requerida</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Cargá cada documento en R2. Para cada DNI pedimos frente y dorso por separado. En celular podés sacar la foto directamente.</p>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3 text-sm">
              <span className="font-semibold text-primary-900">Archivos listos</span><span className="font-bold text-primary-700">{documentCount} / {DOCUMENTOS_INGRESO.length}</span>
            </div>
            <div className="mt-5 space-y-6">
              <div>
                <h4 className="mb-3 font-bold text-slate-800">DNI — frente y dorso</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DOCUMENTOS_INGRESO.slice(0, 8).map((slot) => (
                    <div key={slot}>
                      <PrivateDocumentInput solicitudId={draft.id} slot={slot} label={ETIQUETAS_DOCUMENTO[slot]} dni value={documents[slot]} onChange={(value) => setDocuments((current) => ({ ...current, [slot]: value }))} />
                      {errors[`documentos.${slot}`] ? <p className="mt-1 text-xs text-red-600">{errors[`documentos.${slot}`]}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-3 font-bold text-slate-800">Documentación de la agencia</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DOCUMENTOS_INGRESO.slice(8).map((slot) => (
                    <div key={slot}>
                      <PrivateDocumentInput solicitudId={draft.id} slot={slot} label={ETIQUETAS_DOCUMENTO[slot]} value={documents[slot]} onChange={(value) => setDocuments((current) => ({ ...current, [slot]: value }))} />
                      {errors[`documentos.${slot}`] ? <p className="mt-1 text-xs text-red-600">{errors[`documentos.${slot}`]}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section aria-labelledby="step-revision">
            <h3 id="step-revision" className="text-xl font-bold text-slate-900">Revisá y firmá la solicitud</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Antes de enviar, confirmá los datos, los archivos y la persona que firma.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ReviewCard title="Agencia" onEdit={() => setStep(0)}>
                <p><strong>{data.razonSocial || '—'}</strong> · {data.designacionComercial || '—'}</p>
                <p>{data.categoria} · Legajo {data.legajo}</p><p>{data.email}</p><p>CUIT {formatCuit(data.cuit)}</p>
              </ReviewCard>
              <ReviewCard title="Titulares y representantes" onEdit={() => setStep(1)}>
                {data.titulares.map((person, index) => <p key={index}>Titular {index + 1}: {nombreCompleto(person) || '—'}</p>)}
                <p>Delegado: {nombreCompleto(data.delegado) || '—'}</p><p>Subdelegado: {nombreCompleto(data.subdelegado) || '—'}</p>
              </ReviewCard>
              <ReviewCard title="Avales" onEdit={() => setStep(2)}>
                {data.avales.map((aval, index) => <p key={index}>Aval {index + 1}: {aval.agencia || '—'} · {aval.email || '—'}</p>)}
              </ReviewCard>
              <ReviewCard title={`Documentos (${documentCount}/${DOCUMENTOS_INGRESO.length})`} onEdit={() => setStep(3)}>
                <ul className="space-y-1">{DOCUMENTOS_INGRESO.map((slot) => <li key={slot} className="flex gap-1.5">{documents[slot] ? <FiCheck className="mt-0.5 shrink-0 text-emerald-600" /> : <span className="text-red-500">•</span>}{ETIQUETAS_DOCUMENTO[slot]}</li>)}</ul>
              </ReviewCard>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Apellidos de quien firma por la agencia" value={signerApellidos} onChange={setSignerApellidos} placeholder="Apellidos" />
                <TextField label="Nombres de quien firma por la agencia" value={signerNombres} onChange={setSignerNombres} placeholder="Nombres" />
                <div className="text-xs leading-5 text-slate-500 sm:col-span-2">La firma quedará asociada al nombre completo y se registrarán fecha, hora, IP y navegador.</div>
              </div>
              <div className="mt-5"><SignaturePad value={signature} onChange={setSignature} label="Firma manuscrita del solicitante" /></div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span>Declaro que la información y documentación aportadas son correctas, solicito el ingreso a ACAV y acepto que esta firma manuscrita electrónica se incorpore al expediente digital. También autorizo el tratamiento de los datos para gestionar este trámite.</span>
              </label>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><FiAlertTriangle className="mt-0.5 shrink-0" />Los documentos se guardan en el bucket R2 configurado. Si el bucket tiene acceso público, podrían ser accesibles mediante su URL. Los avales reciben enlaces temporales de firma.</div>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" disabled={sending} onClick={() => { setStep((current) => Math.max(0, current - 1)); setFormError(''); setErrors({}) }} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"><FiArrowLeft /> Volver</button>
          ) : <span className="hidden text-xs text-slate-400 sm:block">Los campos con * son obligatorios.</span>}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => void nextStep()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-500 px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(249,73,16,0.25)] transition hover:-translate-y-0.5 hover:bg-accent-600">Guardar y continuar <FiArrowRight /></button>
          ) : (
            <button type="button" onClick={() => void sendApplication()} disabled={sending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-500 px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(249,73,16,0.25)] transition hover:-translate-y-0.5 hover:bg-accent-600 disabled:cursor-wait disabled:opacity-60">
              {sending ? <><FiLoader className="animate-spin" /> Validando y enviando…</> : <><FiSend /> Enviar solicitud</>}
            </button>
          )}
        </div>
        {step === 4 ? <p className="mt-3 text-center text-xs text-slate-400">Al enviar se inicia el circuito de firmas: solicitante → Aval 1 → Aval 2.</p> : null}
      </div>
    </div>
  )
}

function ReviewCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-primary-600 hover:underline">Editar</button>
      </div>
      <div className="space-y-1 break-words text-xs leading-5 text-slate-600">{children}</div>
    </div>
  )
}
