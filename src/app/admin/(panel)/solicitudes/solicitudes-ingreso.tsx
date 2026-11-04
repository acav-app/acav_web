'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiImage,
  FiLoader,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

import {
  DOCUMENTOS_INGRESO,
  redesSocialesComoTexto,
  ETIQUETAS_DOCUMENTO,
  nombreCompleto,
  type DocumentoGuardado,
  type DocumentoIngreso,
  type FirmaGuardada,
  type FirmaIngresoResumen,
  type SolicitudIngreso,
  type SolicitudIngresoResumen,
} from '@/lib/solicitudes/types'

const ESTADO_LABEL: Record<SolicitudIngreso['estado'], string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_AVAL_1: 'Pendiente · Aval 1',
  PENDIENTE_AVAL_2: 'Pendiente · Aval 2',
  COMPLETADO_APROBADO: 'Completado',
  VENCIDO: 'Vencido',
  RECHAZADA: 'Rechazada',
}

const ESTADO_STYLE: Record<SolicitudIngreso['estado'], string> = {
  BORRADOR: 'border-slate-200 bg-slate-50 text-slate-600',
  PENDIENTE_AVAL_1: 'border-sky-200 bg-sky-50 text-sky-700',
  PENDIENTE_AVAL_2: 'border-amber-200 bg-amber-50 text-amber-700',
  COMPLETADO_APROBADO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  VENCIDO: 'border-rose-200 bg-rose-50 text-rose-700',
  RECHAZADA: 'border-rose-200 bg-rose-50 text-rose-700',
}

type FiltroEstado = 'todas' | 'en-curso' | 'completadas' | 'revisar'
type Preview = { itemId: string; slot: DocumentoIngreso; name: string; url: string; contentType: string; size: number }

function date(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
}

function byteSize(value: number) {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

function isPending(state: SolicitudIngreso['estado']) {
  return state === 'PENDIENTE_AVAL_1' || state === 'PENDIENTE_AVAL_2'
}

async function requestDocumentUrl(id: string, slot: DocumentoIngreso, inline: boolean) {
  const endpoint = `/api/admin/solicitudes/ingreso/${id}/documentos/${slot}${inline ? '?inline=1' : ''}`
  const response = await fetch(endpoint, { cache: 'no-store' })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || typeof body.url !== 'string') {
    throw new Error(body.error ?? 'No se pudo preparar la vista previa del archivo.')
  }
  return body.url as string
}

export default function SolicitudesIngresoAdmin() {
  const [items, setItems] = useState<SolicitudIngresoResumen[]>([])
  const [details, setDetails] = useState<Record<string, SolicitudIngreso>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FiltroEstado>('todas')
  const [busy, setBusy] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewBusy, setPreviewBusy] = useState('')

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/solicitudes/ingreso', { cache: 'no-store' })
      if (response.status === 401) {
        setError('No tenés autorización para consultar estos expedientes. Verificá el acceso de tu cuenta administrativa.')
        return
      }
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudieron cargar las solicitudes.')
      const nextItems = body.items as SolicitudIngresoResumen[]
      setItems(nextItems)
      setNotes((current) => ({
        ...Object.fromEntries(nextItems.map((item) => [item.id, item.notas ?? ''])),
        ...current,
      }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las solicitudes.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function loadDetail(id: string) {
    if (details[id] || busy === `${id}:detail`) return
    setBusy(`${id}:detail`)
    setDetailErrors((current) => ({ ...current, [id]: '' }))
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${id}`, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudieron cargar los detalles.')
      setDetails((current) => ({ ...current, [id]: body.item as SolicitudIngreso }))
    } catch (cause) {
      setDetailErrors((current) => ({
        ...current,
        [id]: cause instanceof Error ? cause.message : 'No se pudieron cargar los detalles.',
      }))
    } finally {
      setBusy('')
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es-AR')
    return items.filter((item) => {
      const matchesFilter = filter === 'todas'
        || (filter === 'en-curso' && isPending(item.estado))
        || (filter === 'completadas' && item.estado === 'COMPLETADO_APROBADO')
        || (filter === 'revisar' && (item.estado === 'VENCIDO' || item.estado === 'RECHAZADA'))
      if (!matchesFilter) return false
      return !term || [item.numero, item.datos.razonSocial, item.datos.email, item.datos.legajo]
        .join(' ').toLocaleLowerCase('es-AR').includes(term)
    })
  }, [items, query, filter])

  const inProgressCount = items.filter((item) => isPending(item.estado)).length
  const completedCount = items.filter((item) => item.estado === 'COMPLETADO_APROBADO').length
  const attentionCount = items.filter((item) => item.estado === 'VENCIDO' || item.estado === 'RECHAZADA').length
  const attachedDocumentCount = items.reduce((count, item) => count + item.documentCount, 0)

  async function resend(item: SolicitudIngresoResumen) {
    setBusy(`${item.id}:resend`)
    setMessages((current) => ({ ...current, [item.id]: '' }))
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${item.id}/reenviar`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudo reenviar la invitación.')
      setMessages((current) => ({ ...current, [item.id]: body.message ?? 'La invitación se envió correctamente.' }))
      await load(false)
    } catch (cause) {
      setMessages((current) => ({ ...current, [item.id]: cause instanceof Error ? cause.message : 'No se pudo reenviar la invitación.' }))
    } finally {
      setBusy('')
    }
  }

  async function resendExpediente(item: SolicitudIngresoResumen) {
    setBusy(`${item.id}:final`)
    setMessages((current) => ({ ...current, [item.id]: '' }))
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${item.id}/reenviar-expediente`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudo reenviar el expediente.')
      setMessages((current) => ({ ...current, [item.id]: body.message ?? 'El expediente se envió por correo.' }))
      await load(false)
    } catch (cause) {
      setMessages((current) => ({ ...current, [item.id]: cause instanceof Error ? cause.message : 'No se pudo reenviar el expediente.' }))
    } finally {
      setBusy('')
    }
  }

  async function saveNotes(id: string) {
    setBusy(`${id}:notes`)
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${id}/notas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas: notes[id] ?? '' }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error ?? 'No se pudieron guardar las notas.')
      setItems((current) => current.map((item) => item.id === id ? { ...item, notas: notes[id] ?? '' } : item))
      setMessages((current) => ({ ...current, [id]: 'Nota interna guardada.' }))
    } catch (cause) {
      setMessages((current) => ({ ...current, [id]: cause instanceof Error ? cause.message : 'No se pudieron guardar las notas.' }))
    } finally {
      setBusy('')
    }
  }

  async function remove(item: SolicitudIngresoResumen) {
    const agency = item.datos.razonSocial || item.numero
    if (!window.confirm(`¿Eliminar permanentemente la solicitud de “${agency}”? También se borrarán sus documentos y expediente. Esta acción no se puede deshacer.`)) return
    setBusy(`${item.id}:delete`)
    setMessages((current) => ({ ...current, [item.id]: '' }))
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${item.id}`, { method: 'DELETE' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error ?? 'No se pudo eliminar la solicitud.')
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      setDetails((current) => {
        const next = { ...current }
        delete next[item.id]
        return next
      })
      setNotes((current) => {
        const next = { ...current }
        delete next[item.id]
        return next
      })
      setMessages((current) => {
        const next = { ...current }
        delete next[item.id]
        return next
      })
    } catch (cause) {
      setMessages((current) => ({ ...current, [item.id]: cause instanceof Error ? cause.message : 'No se pudo eliminar la solicitud.' }))
    } finally {
      setBusy('')
    }
  }

  async function exportExpediente(item: SolicitudIngresoResumen) {
    setBusy(`${item.id}:export`)
    setMessages((current) => ({ ...current, [item.id]: '' }))
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${item.id}/expediente`, { cache: 'no-store' })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? 'No se pudo generar el PDF actualizado.')
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `${item.numero.replace(/[^A-Za-z0-9_-]/g, '_')}-expediente.pdf`
      document.body.appendChild(link)
      try {
        link.click()
      } finally {
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (cause) {
      setMessages((current) => ({ ...current, [item.id]: cause instanceof Error ? cause.message : 'No se pudo generar el PDF actualizado.' }))
    } finally {
      setBusy('')
    }
  }

  async function openDownload(url: string) {
    const tab = window.open('about:blank', '_blank')
    if (tab) tab.opener = null
    try {
      const response = await fetch(url, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudo preparar la descarga.')
      if (tab) tab.location.href = body.url
      else window.location.href = body.url
    } catch (cause) {
      tab?.close()
      window.alert(cause instanceof Error ? cause.message : 'No se pudo preparar la descarga.')
    }
  }

  async function openPreview(itemId: string, slot: DocumentoIngreso, document: DocumentoGuardado) {
    setPreviewBusy(`${itemId}:${slot}`)
    try {
      const url = await requestDocumentUrl(itemId, slot, true)
      setPreview({ itemId, slot, name: document.nombre, url, contentType: document.contentType, size: document.size })
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'No se pudo abrir la vista previa.')
    } finally {
      setPreviewBusy('')
    }
  }

  const closePreview = useCallback(() => setPreview(null), [])

  return (
    <main className="mx-auto max-w-7xl px-1 pb-12 sm:px-2">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-700">
            <FiShield aria-hidden="true" /> Gestión administrativa
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Solicitudes de ingreso</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Revisá expedientes, documentación y firmas en un solo lugar.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
          Actualizar
        </button>
      </header>

      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Solicitudes" value={items.length} detail="Expedientes recibidos" icon={FiFileText} tone="blue" />
        <StatCard title="En curso" value={inProgressCount} detail="Esperando firmas" icon={FiClock} tone="amber" />
        <StatCard title="Completadas" value={completedCount} detail="Circuito de firmas finalizado" icon={FiCheckCircle} tone="green" />
        <StatCard title="Documentos" value={attachedDocumentCount} detail="Archivos adjuntos recibidos" icon={FiImage} tone="slate" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bandeja de solicitudes</h2>
              <p className="mt-0.5 text-xs text-slate-500">{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</p>
            </div>
            <label className="relative block w-full xl:max-w-md">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar agencia, número, email o legajo"
                aria-label="Buscar solicitudes"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-50"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar solicitudes por estado">
            <FilterButton label="Todas" count={items.length} active={filter === 'todas'} onClick={() => setFilter('todas')} />
            <FilterButton label="En curso" count={inProgressCount} active={filter === 'en-curso'} onClick={() => setFilter('en-curso')} />
            <FilterButton label="Completadas" count={completedCount} active={filter === 'completadas'} onClick={() => setFilter('completadas')} />
            <FilterButton label="Revisar" count={attentionCount} active={filter === 'revisar'} onClick={() => setFilter('revisar')} />
          </div>
        </div>

        {error ? (
          <div className="m-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:m-5">
            <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" /><p>{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 p-4 sm:p-5" aria-label="Cargando solicitudes">
            {[0, 1, 2].map((key) => <div key={key} className="animate-pulse rounded-2xl border border-slate-100 p-5"><div className="h-4 w-1/3 rounded bg-slate-200" /><div className="mt-4 h-12 rounded bg-slate-100" /></div>)}
          </div>
        ) : filtered.length ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const detail = details[item.id]
              const deleting = busy === `${item.id}:delete`
              const resending = busy === `${item.id}:resend`
              const resendingFinal = busy === `${item.id}:final`
              return (
                <article key={item.id} className="p-4 transition-colors hover:bg-slate-50/40 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="max-w-full truncate text-lg font-bold text-slate-950">{item.datos.razonSocial || 'Solicitud sin razón social'}</h3>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ESTADO_STYLE[item.estado]}`}>
                          {ESTADO_LABEL[item.estado]}
                        </span>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{item.numero}</span><span aria-hidden="true">·</span>
                        <span>{item.datos.categoria || 'Categoría sin indicar'}</span><span aria-hidden="true">·</span>
                        <span>Recibida {date(item.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPending(item.estado) || item.estado === 'VENCIDO' ? (
                        <button
                          type="button"
                          disabled={busy !== ''}
                          onClick={() => void resend(item)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
                        >
                          {resending ? <FiLoader className="animate-spin" /> : <FiMail />}
                          Reenviar invitación
                        </button>
                      ) : null}
                      {item.estado === 'COMPLETADO_APROBADO' ? (
                        <button
                          type="button"
                          disabled={busy !== ''}
                          onClick={() => void exportExpediente(item)}
                          title="Genera un nuevo PDF con los datos y la plantilla actuales"
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
                        >{busy === `${item.id}:export` ? <FiLoader className="animate-spin" /> : <FiDownload />}{busy === `${item.id}:export` ? 'Generando PDF…' : 'Exportar PDF'}</button>
                      ) : null}
                      {item.estado === 'COMPLETADO_APROBADO' && item.notificaciones.final !== 'enviada' ? (
                        <button
                          type="button"
                          disabled={busy !== ''}
                          onClick={() => void resendExpediente(item)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"
                        >{resendingFinal ? <FiLoader className="animate-spin" /> : <FiMail />} Reenviar expediente por email</button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy !== ''}
                        onClick={() => void remove(item)}
                        aria-label={`Eliminar solicitud ${item.numero}`}
                        title="Eliminar solicitud"
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-50"
                      >{deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}</button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <QuickInfo label="Email principal" value={item.datos.email} href={item.datos.email ? `mailto:${item.datos.email}` : undefined} />
                    <QuickInfo label="WhatsApp" value={item.datos.whatsapp} />
                    <QuickInfo label="Legajo" value={item.datos.legajo} />
                    <QuickInfo label="Documentación" value={`${item.documentCount} archivos cargados`} />
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <SignatureStatus title="Solicitante" signature={item.firmas.solicitante} />
                    <SignatureStatus title="Aval 1" signature={item.firmas.aval1} />
                    <SignatureStatus title="Aval 2" signature={item.firmas.aval2} />
                  </div>

                  {messages[item.id] ? (
                    <p className="mt-3 flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-800" role="status">
                      <FiCheckCircle className="shrink-0" aria-hidden="true" />{messages[item.id]}
                    </p>
                  ) : null}

                  <details className="group mt-4 border-t border-slate-100 pt-3" onToggle={(event) => { if (event.currentTarget.open) void loadDetail(item.id) }}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl py-2 text-sm font-semibold text-slate-700 outline-none transition hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2"><FiFileText className="text-primary-600" aria-hidden="true" /> Revisar expediente, documentos y auditoría</span>
                      <FiChevronDown className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    {detail ? (
                      <div className="mt-3 space-y-4">
                        <DocumentGallery
                          itemId={item.id}
                          documents={detail.documentos}
                          onPreview={(slot, document) => void openPreview(item.id, slot, document)}
                          onDownload={(slot) => void openDownload(`/api/admin/solicitudes/ingreso/${item.id}/documentos/${slot}`)}
                          previewBusy={previewBusy}
                        />
                        <div className="grid items-start gap-4 xl:grid-cols-2">
                          <div className="space-y-4">
                            <DetailSection title="Información de la agencia">
                              <DataGrid items={[
                                ['Razón social', detail.datos.razonSocial],
                                ['Designación comercial', detail.datos.designacionComercial],
                                ['Actividad principal', detail.datos.actividadPrincipal],
                                ['Legajo', detail.datos.legajo],
                                ['Domicilio físico', detail.datos.domicilioFisico],
                                ['CUIT', detail.datos.cuit],
                                ['Condición ante IVA', detail.datos.condicionIva],
                                ['WhatsApp', detail.datos.whatsapp],
                                ['Email principal', detail.datos.email],
                                ['Sitio web', detail.datos.sitioWeb],
                                ['Redes sociales', redesSocialesComoTexto(detail.datos.redesSociales)],
                                ['Es franquicia', detail.datos.esFranquicia],
                                ['Es sucursal', detail.datos.esSucursal],
                                ['Posee sucursales', detail.datos.poseeSucursales],
                                ['Cantidad de sucursales', detail.datos.cantidadSucursales],
                                ['Empleados en Córdoba', detail.datos.empleadosCordoba || 'No informado'],
                              ]} />
                            </DetailSection>
                            <DetailSection title="Titulares">
                              <div className="grid gap-3 sm:grid-cols-2">
                                {detail.datos.titulares.map((person, index) => (
                                  <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Titular {index + 1}</h4>
                                    <DataGrid items={[
                                      ['Nombre y apellido', nombreCompleto(person)],
                                      ['Fecha de nacimiento', person.fechaNacimiento],
                                      ['DNI', person.dni],
                                      ['Celular', person.telefono],
                                      ['Email', person.email],
                                      ['Profesión / ocupación', person.ocupacion],
                                    ]} />
                                  </div>
                                ))}
                              </div>
                            </DetailSection>
                          </div>

                          <div className="space-y-4">
                            <DetailSection title="Representantes y avales">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <PersonPanel title="Delegado" values={[
                                  ['Nombre y apellido', nombreCompleto(detail.datos.delegado)],
                                  ['DNI', detail.datos.delegado.dni],
                                  ['Celular', detail.datos.delegado.telefono],
                                  ['Email', detail.datos.delegado.email],
                                ]} />
                                <PersonPanel title="Subdelegado" values={[
                                  ['Nombre y apellido', nombreCompleto(detail.datos.subdelegado)],
                                  ['DNI', detail.datos.subdelegado.dni],
                                  ['Celular', detail.datos.subdelegado.telefono],
                                  ['Email', detail.datos.subdelegado.email],
                                ]} />
                              </div>
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {detail.datos.avales.map((aval, index) => (
                                  <PersonPanel key={index} title={`Aval ${index + 1}`} values={[
                                    ['Agencia', aval.agencia], ['Email', aval.email],
                                  ]} />
                                ))}
                              </div>
                            </DetailSection>
                            <DetailSection title="Firmas y auditoría">
                              <SignatureAudit title="Solicitante" signature={detail.firmas.solicitante} />
                              <SignatureAudit title="Aval 1" signature={detail.firmas.aval1} />
                              <SignatureAudit title="Aval 2" signature={detail.firmas.aval2} />
                            </DetailSection>
                            <DetailSection title="Estado de notificaciones">
                              <DataGrid items={[
                                ['Invitación al Aval 1', notificationLabel(detail.notificaciones.aval1)],
                                ['Invitación al Aval 2', notificationLabel(detail.notificaciones.aval2)],
                                ['Expediente final', notificationLabel(detail.notificaciones.final)],
                              ]} />
                            </DetailSection>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                        {busy === `${item.id}:detail` ? <span className="inline-flex items-center gap-2"><FiLoader className="animate-spin" /> Cargando el expediente…</span> : detailErrors[item.id] || 'Abrí esta sección para consultar los datos, archivos y firmas.'}
                      </div>
                    )}
                  </details>

                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor={`note-${item.id}`} className="text-xs font-bold uppercase tracking-wide text-slate-600">Notas internas</label>
                      <button
                        type="button"
                        onClick={() => void saveNotes(item.id)}
                        disabled={busy !== '' || (notes[item.id] ?? '') === (item.notas ?? '')}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >{busy === `${item.id}:notes` ? <FiLoader className="animate-spin" /> : <FiCheck />} Guardar nota</button>
                    </div>
                    <textarea
                      id={`note-${item.id}`}
                      rows={2}
                      value={notes[item.id] ?? ''}
                      onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                      disabled={deleting}
                      maxLength={2000}
                      placeholder="Agregá información de seguimiento visible solo para el equipo de ACAV…"
                      className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-50 disabled:opacity-50"
                    />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FiSearch size={20} /></div>
            <h3 className="mt-4 text-sm font-bold text-slate-800">{items.length ? 'No encontramos coincidencias' : 'Todavía no hay solicitudes'}</h3>
            <p className="mt-1 text-sm text-slate-500">{items.length ? 'Probá con otro término o cambiá el filtro de estado.' : 'Las nuevas solicitudes digitales van a aparecer en esta bandeja.'}</p>
          </div>
        )}
      </section>

      {preview ? <PreviewModal
        preview={preview}
        onClose={closePreview}
        onDownload={() => void openDownload(`/api/admin/solicitudes/ingreso/${preview.itemId}/documentos/${preview.slot}`)}
      /> : null}
    </main>
  )
}

function StatCard({ title, value, detail, icon: Icon, tone }: {
  title: string
  value: number
  detail: string
  icon: IconType
  tone: 'blue' | 'amber' | 'green' | 'slate'
}) {
  const tones = {
    blue: 'bg-primary-50 text-primary-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p></div>
        <span className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18} aria-hidden="true" /></span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  )
}

function FilterButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${active ? 'border-primary-200 bg-primary-50 text-primary-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
    >{label}<span className={`rounded-md px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/80 text-primary-800' : 'bg-slate-100 text-slate-500'}`}>{count}</span></button>
  )
}

function QuickInfo({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {href ? <a href={href} className="mt-1 block truncate text-xs font-medium text-slate-700 hover:text-primary-700">{value || '—'}</a> : <p className="mt-1 truncate text-xs font-medium text-slate-700">{value || '—'}</p>}
    </div>
  )
}

function SignatureStatus({ title, signature }: { title: string; signature?: FirmaIngresoResumen }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${signature ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
        {signature ? <FiCheck size={15} aria-hidden="true" /> : <FiClock size={14} aria-hidden="true" />}
      </span>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p><p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{signature ? signature.nombre : 'Firma pendiente'}</p><p className="mt-0.5 text-[10px] text-slate-400">{signature ? date(signature.firmadaEn) : 'A la espera de firma'}</p></div>
    </div>
  )
}

function DetailSection({ title, badge, children }: { title: string; badge?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        {badge ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{badge}</span> : null}
      </div>
      {children}
    </section>
  )
}

function DataGrid({ items }: { items: Array<[string, string | null | undefined]> }) {
  return (
    <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
          <dd className="mt-0.5 break-words text-xs leading-5 text-slate-700">{value?.trim() || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

function PersonPanel({ title, values }: { title: string; values: Array<[string, string | null | undefined]> }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
      <h5 className="mb-3 text-xs font-bold text-slate-700">{title}</h5>
      <DataGrid items={values} />
    </div>
  )
}

function SignatureAudit({ title, signature }: { title: string; signature?: FirmaGuardada }) {
  return (
    <div className="grid gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)] sm:items-center">
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-700">{title}</p>
        {signature ? <><p className="mt-1 break-words text-xs text-slate-600">{signature.nombre} · {date(signature.firmadaEn)}</p><p className="mt-1 break-all text-[10px] leading-4 text-slate-400">IP: {signature.ip || '—'}<br />Navegador: {signature.userAgent || '—'}</p></> : <p className="mt-1 text-xs text-slate-400">Pendiente de firma</p>}
      </div>
      {signature ? <Image src={signature.imagen} alt={`Firma de ${title}`} width={400} height={64} unoptimized className="h-16 w-full rounded-lg border border-slate-100 bg-slate-50 object-contain" /> : null}
    </div>
  )
}

function notificationLabel(value: 'enviada' | 'fallida' | undefined) {
  if (value === 'enviada') return 'Enviada'
  if (value === 'fallida') return 'Fallida · requiere seguimiento'
  return 'Sin registro'
}

function DocumentGallery({ itemId, documents, onPreview, onDownload, previewBusy }: {
  itemId: string
  documents: Partial<Record<DocumentoIngreso, DocumentoGuardado>>
  onPreview: (slot: DocumentoIngreso, document: DocumentoGuardado) => void
  onDownload: (slot: DocumentoIngreso) => void
  previewBusy: string
}) {
  const [thumbnailUrls, setThumbnailUrls] = useState<Partial<Record<DocumentoIngreso, string>>>({})
  const [thumbnailPending, setThumbnailPending] = useState<Partial<Record<DocumentoIngreso, boolean>>>({})
  const [thumbnailFailed, setThumbnailFailed] = useState<Partial<Record<DocumentoIngreso, boolean>>>({})

  useEffect(() => {
    let active = true
    const imageSlots = DOCUMENTOS_INGRESO.filter((slot) => documents[slot]?.contentType.startsWith('image/'))
    setThumbnailUrls({})
    setThumbnailFailed({})
    setThumbnailPending(Object.fromEntries(imageSlots.map((slot) => [slot, true])))
    void Promise.all(imageSlots.map(async (slot) => {
      try {
        const url = await requestDocumentUrl(itemId, slot, true)
        return { slot, url }
      } catch {
        return { slot, url: '' }
      }
    })).then((results) => {
      if (!active) return
      setThumbnailUrls(Object.fromEntries(results.filter((result) => result.url).map(({ slot, url }) => [slot, url])))
      setThumbnailFailed(Object.fromEntries(results.filter((result) => !result.url).map(({ slot }) => [slot, true])))
      setThumbnailPending({})
    })
    return () => { active = false }
  }, [itemId, documents])

  const attachedCount = DOCUMENTOS_INGRESO.filter((slot) => documents[slot]).length

  return (
    <DetailSection title="Documentación presentada" badge={`${attachedCount} archivos cargados`}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DOCUMENTOS_INGRESO.map((slot) => {
          const document = documents[slot]
          const isImage = document?.contentType.startsWith('image/') ?? false
          const pendingPreview = previewBusy === `${itemId}:${slot}`
          const thumbnail = thumbnailUrls[slot]
          return (
            <article key={slot} className={`group overflow-hidden rounded-xl border bg-white transition hover:shadow-sm ${document ? 'border-slate-200' : 'border-dashed border-slate-200'}`}>
              <button
                type="button"
                onClick={() => document && onPreview(slot, document)}
                disabled={!document || pendingPreview}
                aria-label={document ? `Vista previa: ${ETIQUETAS_DOCUMENTO[slot]}` : `${ETIQUETAS_DOCUMENTO[slot]} no adjuntado`}
                className={`relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-slate-50 text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${document ? 'cursor-zoom-in' : 'cursor-default'}`}
              >
                {isImage && thumbnail && !thumbnailFailed[slot] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt={`Miniatura: ${ETIQUETAS_DOCUMENTO[slot]}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setThumbnailFailed((current) => ({ ...current, [slot]: true }))} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                ) : document ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-5 text-center">
                    {isImage ? <FiImage size={26} className={thumbnailPending[slot] ? 'animate-pulse text-primary-400' : 'text-primary-500'} /> : <span className="flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><FiFileText size={23} /></span>}
                    <span className="text-[11px] font-semibold text-slate-500">{isImage ? (thumbnailPending[slot] ? 'Preparando miniatura…' : 'Vista previa no disponible') : 'Archivo PDF'}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300"><FiFileText size={25} /><span className="text-[11px] font-medium">Sin archivo</span></div>
                )}
                {document && !pendingPreview ? <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100"><FiEye size={14} /></span> : null}
                {pendingPreview ? <span className="absolute inset-0 flex items-center justify-center bg-white/75"><FiLoader className="animate-spin text-primary-600" /></span> : null}
              </button>
              <div className="p-3">
                <p className="min-h-8 text-xs font-semibold leading-4 text-slate-700">{ETIQUETAS_DOCUMENTO[slot]}</p>
                {document ? (
                  <>
                    <p title={document.nombre} className="mt-1 truncate text-[11px] text-slate-500">{document.nombre}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">{isImage ? 'Imagen' : 'PDF'} · {byteSize(document.size)}</span>
                      <button type="button" onClick={() => onDownload(slot)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-primary-700 transition hover:bg-primary-50" aria-label={`Descargar ${ETIQUETAS_DOCUMENTO[slot]}`}><FiDownload /> Descargar</button>
                    </div>
                  </>
                ) : <p className="mt-1 text-[11px] font-medium text-rose-600">Pendiente de adjuntar</p>}
              </div>
            </article>
          )
        })}
      </div>
    </DetailSection>
  )
}

function PreviewModal({ preview, onClose, onDownload }: { preview: Preview; onClose: () => void; onDownload: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const isImage = preview.contentType.startsWith('image/')
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-label={`Vista previa de ${preview.name}`} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0"><h2 className="truncate text-sm font-bold text-slate-900">{preview.name}</h2><p className="mt-0.5 text-[11px] text-slate-500">{isImage ? 'Vista previa de imagen' : 'Vista previa del documento'} · {byteSize(preview.size)}</p></div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={preview.url} target="_blank" rel="noreferrer" className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"><FiExternalLink /> Abrir aparte</a>
            <button type="button" onClick={onDownload} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"><FiDownload /> Descargar</button>
            <button type="button" onClick={onClose} aria-label="Cerrar vista previa" className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"><FiX /></button>
          </div>
        </header>
        <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-slate-100 p-3 sm:min-h-[65vh] sm:p-5">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.url} alt={preview.name} referrerPolicy="no-referrer" className="max-h-[76vh] max-w-full rounded-lg object-contain shadow-sm" />
          ) : (
            <iframe src={preview.url} title={`Vista previa de ${preview.name}`} className="h-[76vh] w-full rounded-lg border border-slate-200 bg-white" />
          )}
        </div>
      </section>
    </div>
  )
}
