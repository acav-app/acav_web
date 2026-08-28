'use client'

import { useState } from 'react'
import { FiCheckCircle, FiSend } from 'react-icons/fi'

import type { ContactoInput } from '@/lib/admin/types'

const emptyForm: ContactoInput = {
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: '',
  origen: '',
}

const inputClass =
  'w-full border-0 border-b border-slate-300 bg-transparent pb-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-0'

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
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
        {required ? <span className="text-accent-500"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

export default function ContactForm() {
  const [form, setForm] = useState<ContactoInput>({ ...emptyForm })
  const [website, setWebsite] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function set<K extends keyof ContactoInput>(key: K, value: ContactoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError(null)

    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'No se pudo enviar el mensaje.')

      setSent(true)
      setForm({ ...emptyForm })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="py-12 text-center">
        <FiCheckCircle className="mx-auto text-[30px] text-emerald-600" />
        <h3 className="mt-4 text-xl font-semibold text-slate-900">¡Gracias! Tu mensaje fue enviado.</h3>
        <p className="mt-2 text-sm text-slate-600">
          Nos contactaremos a la brevedad posible.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-xs font-medium text-primary-600 uppercase hover:text-primary-700"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <Campo label="Nombre" required>
          <input
            required
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Nombre y apellido"
            className={inputClass}
          />
        </Campo>

        <Campo label="Email" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="tu@email.com"
            className={inputClass}
          />
        </Campo>

        <Campo label="Teléfono">
          <input
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            placeholder="+54 9 351 000-0000"
            className={inputClass}
          />
        </Campo>

        <Campo label="Asunto">
          <input
            value={form.asunto}
            onChange={(e) => set('asunto', e.target.value)}
            placeholder="¿Sobre qué querés consultar?"
            className={inputClass}
          />
        </Campo>
      </div>

      <div className="mt-6">
        <Campo label="Mensaje" required>
          <textarea
            required
            rows={5}
            value={form.mensaje}
            onChange={(e) => set('mensaje', e.target.value)}
            placeholder="Escribí tu mensaje..."
            className={inputClass}
          />
        </Campo>
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent-500 px-8 text-[11px] font-bold uppercase text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiSend className="text-[13px]" />
        {sending ? 'Enviando…' : 'Enviar'}
      </button>

      <p className="mt-3 text-xs text-slate-400">
        Los campos marcados con <span className="text-accent-500">*</span> son obligatorios.
      </p>
    </form>
  )
}
