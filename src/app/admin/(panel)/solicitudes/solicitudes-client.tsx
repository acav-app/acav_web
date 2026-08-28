'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiExternalLink, FiMail, FiMapPin, FiPhone, FiSearch, FiTrash2 } from 'react-icons/fi'

import { ESTADOS_SOLICITUD, type EstadoSolicitud, type Solicitud } from '@/lib/admin/types'
import { Input, Select, StateMessage, Textarea } from '../ui'

const ESTILO_ESTADO: Record<EstadoSolicitud, string> = {
  nueva: 'bg-sky-50 text-sky-700',
  'en revisión': 'bg-amber-50 text-amber-700',
  aprobada: 'bg-emerald-50 text-emerald-700',
  rechazada: 'bg-red-50 text-red-600',
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SolicitudesClient() {
  const [items, setItems] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todas' | EstadoSolicitud>('todas')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/solicitudes')
      if (response.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'No se pudieron cargar las solicitudes.')
      setItems(data.items as Solicitud[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function guardar(id: string, cambios: { estado: EstadoSolicitud; notas: string }) {
    const previo = items
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...cambios } : item)))

    const response = await fetch(`/api/admin/solicitudes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios),
    })

    if (!response.ok) {
      setItems(previo)
      window.alert('No se pudo actualizar la solicitud.')
    }
  }

  async function eliminar(solicitud: Solicitud) {
    if (!window.confirm(`¿Eliminar la solicitud de "${solicitud.agencia}"?`)) return

    const response = await fetch(`/api/admin/solicitudes/${solicitud.id}`, { method: 'DELETE' })
    if (response.ok) setItems((prev) => prev.filter((item) => item.id !== solicitud.id))
    else window.alert('No se pudo eliminar la solicitud.')
  }

  const filtradas = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((solicitud) => {
      if (filtroEstado !== 'todas' && solicitud.estado !== filtroEstado) return false
      if (!term) return true
      return [solicitud.agencia, solicitud.responsable, solicitud.email, solicitud.localidad]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [items, query, filtroEstado])

  const nuevas = items.filter((item) => item.estado === 'nueva').length

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes de asociación</h1>
        <p className="text-sm text-slate-500">
          {items.length} en total{nuevas ? ` · ${nuevas} sin revisar` : ''}.
        </p>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por agencia, responsable o email"
            className="pl-10"
          />
        </div>

        <Select
          value={filtroEstado}
          onChange={(event) => setFiltroEstado(event.target.value as 'todas' | EstadoSolicitud)}
        >
          <option value="todas">Todos los estados</option>
          {ESTADOS_SOLICITUD.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <StateMessage>Cargando solicitudes…</StateMessage>
      ) : filtradas.length === 0 ? (
        <StateMessage>No hay solicitudes para mostrar.</StateMessage>
      ) : (
        <div className="space-y-3">
          {filtradas.map((solicitud) => (
            <article key={solicitud.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-bold text-slate-900">{solicitud.agencia}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILO_ESTADO[solicitud.estado]}`}
                    >
                      {solicitud.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {solicitud.categoria}
                    {solicitud.legajo ? ` · Legajo ${solicitud.legajo}` : ''} ·{' '}
                    {formatDate(solicitud.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => eliminar(solicitud)}
                  aria-label="Eliminar"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p className="truncate">
                  <span className="font-semibold text-slate-900">{solicitud.responsable}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <FiMail className="shrink-0 text-slate-400" />
                  <a href={`mailto:${solicitud.email}`} className="truncate hover:text-primary-600">
                    {solicitud.email}
                  </a>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <FiPhone className="shrink-0 text-slate-400" />
                  {solicitud.telefono}
                </p>
                {solicitud.localidad ? (
                  <p className="flex items-center gap-2 truncate">
                    <FiMapPin className="shrink-0 text-slate-400" />
                    {solicitud.localidad}
                  </p>
                ) : null}
                {solicitud.sitio ? (
                  <p className="flex items-center gap-2 truncate">
                    <FiExternalLink className="shrink-0 text-slate-400" />
                    <span className="truncate">{solicitud.sitio}</span>
                  </p>
                ) : null}
              </div>

              {solicitud.mensaje ? (
                <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {solicitud.mensaje}
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[200px_minmax(0,1fr)]">
                <Select
                  value={solicitud.estado}
                  onChange={(event) =>
                    guardar(solicitud.id, {
                      estado: event.target.value as EstadoSolicitud,
                      notas: solicitud.notas,
                    })
                  }
                >
                  {ESTADOS_SOLICITUD.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </Select>

                <Textarea
                  rows={2}
                  defaultValue={solicitud.notas}
                  placeholder="Notas internas…"
                  onBlur={(event) =>
                    event.target.value !== solicitud.notas &&
                    guardar(solicitud.id, { estado: solicitud.estado, notas: event.target.value })
                  }
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
