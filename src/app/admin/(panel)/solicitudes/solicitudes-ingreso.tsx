'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiDownload, FiExternalLink, FiLoader, FiMail, FiRefreshCw, FiShield, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'

import { DOCUMENTOS_INGRESO, ETIQUETAS_DOCUMENTO, nombreCompleto, type FirmaGuardada, type FirmaIngresoResumen, type SolicitudIngreso, type SolicitudIngresoResumen } from '@/lib/solicitudes/types'

const ESTADO_LABEL: Record<SolicitudIngreso['estado'], string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_AVAL_1: 'Pendiente Aval 1',
  PENDIENTE_AVAL_2: 'Pendiente Aval 2',
  COMPLETADO_APROBADO: 'Completado',
  VENCIDO: 'Vencido',
  RECHAZADA: 'Rechazada',
}

const ESTADO_STYLE: Record<SolicitudIngreso['estado'], string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  PENDIENTE_AVAL_1: 'bg-sky-50 text-sky-700',
  PENDIENTE_AVAL_2: 'bg-amber-50 text-amber-700',
  COMPLETADO_APROBADO: 'bg-emerald-50 text-emerald-700',
  VENCIDO: 'bg-red-50 text-red-700',
  RECHAZADA: 'bg-red-50 text-red-700',
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

function byteSize(value: number) {
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

export default function SolicitudesIngresoAdmin() {
  const [items, setItems] = useState<SolicitudIngresoResumen[]>([])
  const [details, setDetails] = useState<Record<string, SolicitudIngreso>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/solicitudes/ingreso', { cache: 'no-store' })
      if (response.status === 401) {
        setError('No autorizado para acceder a expedientes sensibles. Configurá ADMIN_ALLOWED_EMAILS con tu cuenta administrativa.')
        return
      }
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudieron cargar las solicitudes de ingreso.')
      setItems(body.items as SolicitudIngresoResumen[])
      setNotes(Object.fromEntries((body.items as SolicitudIngresoResumen[]).map((item) => [item.id, item.notas ?? ''])))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las solicitudes de ingreso.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function loadDetail(id: string) {
    if (details[id] || busy === `${id}:detail`) return
    setBusy(`${id}:detail`)
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${id}`, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudieron cargar los detalles.')
      setDetails((current) => ({ ...current, [id]: body.item as SolicitudIngreso }))
    } catch (cause) {
      setMessages((current) => ({ ...current, [id]: cause instanceof Error ? cause.message : 'No se pudieron cargar los detalles.' }))
    } finally {
      setBusy('')
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((item) => !term || [item.numero, item.datos.razonSocial, item.datos.email, item.datos.legajo].join(' ').toLowerCase().includes(term))
  }, [items, query])

  async function resend(item: SolicitudIngresoResumen) {
    setBusy(`${item.id}:resend`)
    setMessages((current) => ({ ...current, [item.id]: '' }))
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${item.id}/reenviar`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudo reenviar el enlace.')
      setMessages((current) => ({ ...current, [item.id]: body.message ?? 'Enlace reenviado.' }))
      await load()
    } catch (cause) {
      setMessages((current) => ({ ...current, [item.id]: cause instanceof Error ? cause.message : 'No se pudo reenviar el enlace.' }))
    } finally {
      setBusy('')
    }
  }

  async function saveNotes(id: string) {
    setBusy(`${id}:notes`)
    try {
      const response = await fetch(`/api/admin/solicitudes/ingreso/${id}/notas`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notas: notes[id] ?? '' }),
      })
      if (!response.ok) throw new Error('No se pudieron guardar las notas.')
      setMessages((current) => ({ ...current, [id]: 'Nota guardada.' }))
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
      setMessages((current) => ({
        ...current,
        [item.id]: cause instanceof Error ? cause.message : 'No se pudo eliminar la solicitud.',
      }))
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

  return (
    <section className="mb-10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Nuevo circuito digital</p><h2 className="mt-1 text-xl font-bold text-slate-900">Solicitudes de ingreso</h2><p className="mt-1 text-sm text-slate-500">{items.length} trámite{items.length === 1 ? '' : 's'} con flujo de firmas secuenciales.</p></div>
        <div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar agencia o solicitud" className="w-56 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500" /><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white"><FiRefreshCw /> Actualizar</button></div>
      </header>

      {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <div className="space-y-3" aria-label="Cargando solicitudes">{[0, 1].map((item) => <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div className="h-4 w-1/3 rounded bg-slate-200" /><div className="mt-4 h-16 rounded bg-slate-100" /></div>)}</div>
      ) : filtered.length ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const detail = details[item.id]
            const deleting = busy === `${item.id}:delete`
            return (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-slate-900">{item.datos.razonSocial || 'Borrador sin completar'}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_STYLE[item.estado]}`}>{ESTADO_LABEL[item.estado]}</span></div><p className="mt-1 text-xs text-slate-500">{item.numero} · {item.datos.categoria || 'Categoría sin indicar'} · {date(item.createdAt)}</p></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy !== ''} onClick={() => void remove(item)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60">
                    {deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                    {deleting ? 'Eliminando…' : 'Eliminar'}
                  </button>
                  {item.estado === 'PENDIENTE_AVAL_1' || item.estado === 'PENDIENTE_AVAL_2' || item.estado === 'VENCIDO' ? <button type="button" disabled={busy === `${item.id}:resend` || busy.endsWith(':delete')} onClick={() => void resend(item)} className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3.5 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-60">{busy === `${item.id}:resend` ? <FiLoader className="animate-spin" /> : <FiMail />} Reenviar enlace</button> : null}
                  {item.estado === 'COMPLETADO_APROBADO' ? <>
                    {item.pdfDisponible ? <button type="button" onClick={() => void openDownload(`/api/admin/solicitudes/ingreso/${item.id}/expediente`)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><FiDownload /> Expediente PDF</button> : null}
                    {item.notificaciones.final !== 'enviada' ? <button type="button" onClick={async () => {
                      setBusy(`${item.id}:final`)
                      try {
                        const response = await fetch(`/api/admin/solicitudes/ingreso/${item.id}/reenviar-expediente`, { method: 'POST' })
                        const body = await response.json()
                        if (!response.ok) throw new Error(body.error ?? 'No se pudo reenviar el expediente.')
                        setMessages((current) => ({ ...current, [item.id]: 'Expediente enviado por email.' }))
                        await load()
                      } catch (cause) {
                        setMessages((current) => ({ ...current, [item.id]: cause instanceof Error ? cause.message : 'No se pudo reenviar el expediente.' }))
                      } finally { setBusy('') }
                    }} disabled={busy === `${item.id}:final` || busy.endsWith(':delete')} className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60">{busy === `${item.id}:final` ? <FiLoader className="animate-spin" /> : <FiMail />} Reenviar expediente</button> : null}
                  </> : null}
                </div>
              </div>

              {messages[item.id] ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800" role="status">{messages[item.id]}</p> : null}
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <p><span className="block text-xs text-slate-400">Email principal</span><a className="font-medium hover:text-primary-600" href={`mailto:${item.datos.email}`}>{item.datos.email || '—'}</a></p>
                <p><span className="block text-xs text-slate-400">WhatsApp</span>{item.datos.whatsapp || '—'}</p>
                <p><span className="block text-xs text-slate-400">Legajo</span>{item.datos.legajo || '—'}</p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <SignatureStatus title="Solicitante" signature={item.firmas.solicitante} />
                <SignatureStatus title="Aval 1" signature={item.firmas.aval1} />
                <SignatureStatus title="Aval 2" signature={item.firmas.aval2} />
              </div>

              <details className="mt-4 border-t border-slate-100 pt-4" onToggle={(event) => { if (event.currentTarget.open) void loadDetail(item.id) }}>
                <summary className="cursor-pointer text-sm font-semibold text-primary-700">Ver datos completos, adjuntos y auditoría</summary>
                {detail ? <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <DataSection title="Agencia">
                      <Data label="Actividad" value={detail.datos.actividadPrincipal} /><Data label="Domicilio físico" value={detail.datos.domicilioFisico} />
                      <Data label="CUIT" value={detail.datos.cuit} /><Data label="Condición IVA" value={detail.datos.condicionIva} /><Data label="Web" value={detail.datos.sitioWeb} /><Data label="Redes" value={detail.datos.redesSociales} />
                      <Data label="Franquicia / sucursal / posee" value={`${detail.datos.esFranquicia} / ${detail.datos.esSucursal} / ${detail.datos.poseeSucursales}`} /><Data label="N.º sucursales" value={detail.datos.cantidadSucursales} /><Data label="Empleados Córdoba" value={detail.datos.empleadosCordoba || 'No informado'} />
                    </DataSection>
                    <DataSection title="Titulares">
                      {detail.datos.titulares.map((person, index) => <div key={index} className="border-b border-slate-100 pb-2 last:border-0"><p className="mb-1 text-xs font-bold text-slate-600">Titular {index + 1}</p><Data label="Nombre y apellido" value={nombreCompleto(person)} /><Data label="Nacimiento" value={person.fechaNacimiento} /><Data label="DNI" value={person.dni} /><Data label="Celular" value={person.telefono} /><Data label="Email" value={person.email} /><Data label="Ocupación" value={person.ocupacion} /></div>)}
                    </DataSection>
                  </div>
                  <div className="space-y-4">
                    <DataSection title="Representantes y avales">
                      <Data label="Delegado" value={`${nombreCompleto(detail.datos.delegado)} · DNI ${detail.datos.delegado.dni} · ${detail.datos.delegado.email} · ${detail.datos.delegado.telefono}`} />
                      <Data label="Subdelegado" value={`${nombreCompleto(detail.datos.subdelegado)} · DNI ${detail.datos.subdelegado.dni} · ${detail.datos.subdelegado.email} · ${detail.datos.subdelegado.telefono}`} />
                      {detail.datos.avales.map((aval, index) => <Data key={index} label={`Aval ${index + 1}`} value={`${aval.agencia} · ${aval.email}`} />)}
                    </DataSection>
                    <DataSection title="Documentación de la solicitud">
                      <ul className="space-y-2">{DOCUMENTOS_INGRESO.map((slot) => {
                        const document = detail.documentos[slot]
                        return <li key={slot} className="flex items-center justify-between gap-2 text-xs"><span className="min-w-0 truncate text-slate-600">{ETIQUETAS_DOCUMENTO[slot]}{document ? <span className="text-slate-400"> · {document.nombre} · {byteSize(document.size)}</span> : <span className="text-red-500"> · Falta</span>}</span>{document ? <button type="button" onClick={() => void openDownload(`/api/admin/solicitudes/ingreso/${item.id}/documentos/${slot}`)} aria-label={`Descargar ${ETIQUETAS_DOCUMENTO[slot]}`} className="shrink-0 rounded-lg p-2 text-primary-700 hover:bg-primary-50"><FiExternalLink /></button> : null}</li>
                      })}</ul>
                    </DataSection>
                    <DataSection title="Firmas y auditoría">
                      <FirmaAudit title="Solicitante" firma={detail.firmas.solicitante} />
                      <FirmaAudit title="Aval 1" firma={detail.firmas.aval1} />
                      <FirmaAudit title="Aval 2" firma={detail.firmas.aval2} />
                    </DataSection>
                    <DataSection title="Notificaciones">
                      <Data label="Aval 1" value={detail.notificaciones.aval1 ?? 'Sin registro'} /><Data label="Aval 2" value={detail.notificaciones.aval2 ?? 'Sin registro'} /><Data label="Expediente final" value={detail.notificaciones.final ?? 'Sin registro'} />
                    </DataSection>
                  </div>
                </div> : <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{busy === `${item.id}:detail` ? <span className="inline-flex items-center gap-2"><FiLoader className="animate-spin" /> Cargando datos y documentos…</span> : messages[item.id] || 'Abrí esta sección para cargar los datos del trámite.'}</div>}
              </details>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-500">Notas internas
                  <textarea rows={2} value={notes[item.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} onBlur={() => void saveNotes(item.id)} disabled={deleting} placeholder="Seguimiento interno del trámite…" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-primary-500 disabled:opacity-50" />
                </label>
                {busy === `${item.id}:notes` ? <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400"><FiLoader className="animate-spin" /> Guardando nota…</span> : null}
              </div>
            </article>
          )})}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">{items.length ? 'No hay solicitudes que coincidan con la búsqueda.' : 'Todavía no hay solicitudes digitales.'}</div>}
    </section>
  )
}

function SignatureStatus({ title, signature }: { title: string; signature?: FirmaIngresoResumen }) {
  return <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-bold text-slate-700">{title}</p>
    {signature ? <p className="mt-1 text-xs text-slate-600">{signature.nombre} · {date(signature.firmadaEn)}</p> : <p className="mt-1 text-xs text-slate-400">Pendiente de firma</p>}
  </div>
}

function FirmaAudit({ title, firma }: { title: string; firma?: FirmaGuardada }) {
  return <div className="border-b border-slate-100 py-2 last:border-0">
    <p className="text-xs font-semibold text-slate-700">{title}: {firma ? `${firma.nombre} · ${date(firma.firmadaEn)}` : 'Pendiente'}</p>
    {firma ? <><Image src={firma.imagen} alt={`Firma ${title}`} width={400} height={64} unoptimized className="mt-2 h-16 w-full object-contain" /><p className="mt-1 break-all text-[10px] text-slate-400">IP: {firma.ip || '—'}<br />Navegador: {firma.userAgent || '—'}</p></> : null}
  </div>
}

function DataSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-100 p-3"><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4><div className="space-y-1">{children}</div></section>
}

function Data({ label, value }: { label: string; value: string }) {
  return <p className="break-words text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-700">{label}:</span> {value || '—'}</p>
}
