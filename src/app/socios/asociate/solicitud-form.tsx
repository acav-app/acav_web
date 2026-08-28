'use client'

import { useState } from 'react'
import { FiCheckCircle, FiSend } from 'react-icons/fi'

import { CATEGORIAS_SOCIO, emptySolicitud, type SolicitudInput } from '@/lib/admin/types'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

function Campo({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-accent-500"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

export default function SolicitudForm() {
  const [form, setForm] = useState<SolicitudInput>({ ...emptySolicitud })
  const [website, setWebsite] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function set<K extends keyof SolicitudInput>(key: K, value: SolicitudInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError(null)

    try {
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'No se pudo enviar la solicitud.')

      setSent(true)
      setForm({ ...emptySolicitud })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-8 py-12 text-center">
        <FiCheckCircle className="mx-auto text-[34px] text-emerald-600" />
        <h3 className="mt-4 text-[20px] font-bold text-slate-900">¡Recibimos tu solicitud!</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
          El equipo de ACAV la va a revisar y se va a contactar con vos por email para continuar con el proceso.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-[11px] font-bold uppercase text-primary-600 hover:text-primary-700"
        >
          Enviar otra solicitud
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[22px] border border-slate-200 bg-white p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nombre de la agencia" required>
          <input
            required
            value={form.agencia}
            onChange={(event) => set('agencia', event.target.value)}
            placeholder="Mi Agencia de Viajes"
            className={fieldClass}
          />
        </Campo>

        <Campo label="Categoría" required>
          <select
            value={form.categoria}
            onChange={(event) => set('categoria', event.target.value)}
            className={fieldClass}
          >
            {CATEGORIAS_SOCIO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Responsable / Delegado" required>
          <input
            required
            value={form.responsable}
            onChange={(event) => set('responsable', event.target.value)}
            placeholder="Nombre y apellido"
            className={fieldClass}
          />
        </Campo>

        <Campo label="Legajo RNAV">
          <input
            value={form.legajo}
            onChange={(event) => set('legajo', event.target.value)}
            placeholder="15220"
            className={fieldClass}
          />
        </Campo>

        <Campo label="Email" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => set('email', event.target.value)}
            placeholder="info@miagencia.com.ar"
            className={fieldClass}
          />
        </Campo>

        <Campo label="Teléfono / WhatsApp" required>
          <input
            required
            value={form.telefono}
            onChange={(event) => set('telefono', event.target.value)}
            placeholder="+54 9 351 000-0000"
            className={fieldClass}
          />
        </Campo>

        <Campo label="Localidad">
          <input
            value={form.localidad}
            onChange={(event) => set('localidad', event.target.value)}
            placeholder="Córdoba, Córdoba"
            className={fieldClass}
          />
        </Campo>

        <Campo label="Sitio web / Redes">
          <input
            value={form.sitio}
            onChange={(event) => set('sitio', event.target.value)}
            placeholder="miagencia.com.ar"
            className={fieldClass}
          />
        </Campo>
      </div>

      <div className="mt-4">
        <Campo label="Contanos sobre tu agencia">
          <textarea
            rows={4}
            value={form.mensaje}
            onChange={(event) => set('mensaje', event.target.value)}
            placeholder="Años de trayectoria, servicios que ofrecen, consultas…"
            className={fieldClass}
          />
        </Campo>
      </div>

      {/* Campo trampa para bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_12px_30px_rgba(249,73,16,0.28)] transition hover:-translate-y-0.5 hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FiSend />
        {sending ? 'Enviando…' : 'Enviar solicitud'}
      </button>

      <p className="mt-3 text-xs text-slate-400">
        Los campos marcados con <span className="text-accent-500">*</span> son obligatorios.
      </p>
    </form>
  )
}
