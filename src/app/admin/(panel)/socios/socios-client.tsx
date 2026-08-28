'use client'

import { useMemo, useState } from 'react'
import { FiEdit2, FiMail, FiPhone, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'

import { CATEGORIAS_SOCIO, emptySocio, type Socio, type SocioInput } from '@/lib/admin/types'
import Drawer from '../drawer'
import ImageUploader from '../image-uploader'
import { useCollection } from '../use-collection'
import { Field, GhostButton, Input, PrimaryButton, Select, StateMessage } from '../ui'

export default function SociosClient() {
  const { items, loading, error, create, update, remove } = useCollection<Socio, SocioInput>(
    '/api/admin/socios'
  )
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Socio | null>(null)
  const [form, setForm] = useState<SocioInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((socio) =>
      [socio.nombre, socio.legajo, socio.localidad, socio.contacto.email, socio.contacto.whatsapp]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [items, query])

  function openNew() {
    setEditing(null)
    setForm(structuredClone(emptySocio))
    setFormError(null)
  }

  function openEdit(socio: Socio) {
    setEditing(socio)
    const { id, createdAt, updatedAt, ...rest } = socio
    setForm(structuredClone(rest))
    setFormError(null)
  }

  function closeDrawer() {
    setForm(null)
    setEditing(null)
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setFormError(null)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      closeDrawer()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el socio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(socio: Socio) {
    if (!window.confirm(`¿Eliminar el socio "${socio.nombre}"?`)) return
    await remove(socio.id).catch(() => window.alert('No se pudo eliminar el socio.'))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Socios</h1>
          <p className="text-sm text-slate-500">
            {items.length} socio{items.length === 1 ? '' : 's'} registrado
            {items.length === 1 ? '' : 's'}.
          </p>
        </div>
        <PrimaryButton onClick={openNew}>
          <FiPlus /> Nuevo socio
        </PrimaryButton>
      </header>

      <div className="relative mb-4">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, legajo o email"
          className="pl-10"
        />
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <StateMessage>Cargando socios…</StateMessage>
      ) : filtered.length === 0 ? (
        <StateMessage>No hay socios para mostrar.</StateMessage>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((socio) => (
            <article
              key={socio.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {socio.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={socio.logo}
                      alt={`Logo de ${socio.nombre}`}
                      className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-contain"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-400">
                      {socio.nombre.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-slate-900">{socio.nombre}</h2>
                    <p className="truncate text-xs text-slate-400">
                      {socio.categoria}
                      {socio.localidad ? ` · ${socio.localidad}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">Legajo {socio.legajo || '—'}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    socio.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {socio.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <dl className="flex-1 space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FiMail className="shrink-0 text-slate-400" />
                  <span className="truncate">{socio.contacto.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="shrink-0 text-slate-400" />
                  <span className="truncate">{socio.contacto.whatsapp || '—'}</span>
                </div>
                <div className="pt-1 text-xs text-slate-400">
                  <p className="truncate">Delegado: {socio.delegado.email || '—'}</p>
                  <p className="truncate">Subdelegado: {socio.subdelegado.email || '—'}</p>
                </div>
              </dl>

              <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(socio)}
                  aria-label="Editar"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(socio)}
                  aria-label="Eliminar"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer
        open={Boolean(form)}
        title={editing ? 'Editar socio' : 'Nuevo socio'}
        onClose={closeDrawer}
        footer={
          <div className="flex justify-end gap-2">
            <GhostButton onClick={closeDrawer} disabled={saving}>
              Cancelar
            </GhostButton>
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </PrimaryButton>
          </div>
        }
      >
        {form ? (
          <div className="space-y-4">
            <Field label="Nombre">
              <Input
                value={form.nombre}
                onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                placeholder="Nombre de la agencia"
              />
            </Field>

            <Field label="Legajo">
              <Input
                value={form.legajo}
                onChange={(event) => setForm({ ...form, legajo: event.target.value })}
                placeholder="15178"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría">
                <Select
                  value={form.categoria}
                  onChange={(event) => setForm({ ...form, categoria: event.target.value })}
                >
                  {CATEGORIAS_SOCIO.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Localidad">
                <Input
                  value={form.localidad}
                  onChange={(event) => setForm({ ...form, localidad: event.target.value })}
                  placeholder="Villa Allende, Córdoba"
                />
              </Field>
            </div>

            <Field label="Sitio web / Redes">
              <Input
                value={form.sitio}
                onChange={(event) => setForm({ ...form, sitio: event.target.value })}
                placeholder="miagencia.com.ar"
              />
            </Field>

            <Field label="Logo" hint="JPG, PNG, WEBP, AVIF o SVG. Máximo 4 MB.">
              <ImageUploader
                value={form.logo}
                folder="socios"
                label="Subir logo"
                onChange={(url) => setForm({ ...form, logo: url })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email de contacto">
                <Input
                  type="email"
                  value={form.contacto.email}
                  onChange={(event) =>
                    setForm({ ...form, contacto: { ...form.contacto, email: event.target.value } })
                  }
                  placeholder="info@agencia.com"
                />
              </Field>
              <Field label="WhatsApp">
                <Input
                  value={form.contacto.whatsapp}
                  onChange={(event) =>
                    setForm({ ...form, contacto: { ...form.contacto, whatsapp: event.target.value } })
                  }
                  placeholder="+54 9 351 000-0000"
                />
              </Field>
            </div>

            <Field label="Email del delegado">
              <Input
                type="email"
                value={form.delegado.email}
                onChange={(event) => setForm({ ...form, delegado: { email: event.target.value } })}
                placeholder="delegado@agencia.com"
              />
            </Field>

            <Field label="Email del subdelegado">
              <Input
                type="email"
                value={form.subdelegado.email}
                onChange={(event) => setForm({ ...form, subdelegado: { email: event.target.value } })}
                placeholder="subdelegado@agencia.com"
              />
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm({ ...form, activo: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-400"
              />
              <span className="text-sm font-semibold text-slate-700">Socio activo</span>
            </label>

            {formError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
