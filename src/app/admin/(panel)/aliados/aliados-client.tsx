'use client'

import { useMemo, useState } from 'react'
import { FiEdit2, FiExternalLink, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'

import { emptyAliado, type Aliado, type AliadoInput } from '@/lib/admin/types'
import Drawer from '../drawer'
import ImageUploader from '../image-uploader'
import { useCollection } from '../use-collection'
import { Field, GhostButton, Input, PrimaryButton, StateMessage, Textarea } from '../ui'

export default function AliadosClient() {
  const { items, loading, error, create, update, remove } = useCollection<Aliado, AliadoInput>(
    '/api/admin/aliados'
  )
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Aliado | null>(null)
  const [form, setForm] = useState<AliadoInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((aliado) =>
      [aliado.nombre, aliado.descripcion].join(' ').toLowerCase().includes(term)
    )
  }, [items, query])

  function openNew() {
    setEditing(null)
    setForm({ ...emptyAliado, orden: items.length })
    setFormError(null)
  }

  function openEdit(aliado: Aliado) {
    setEditing(aliado)
    const { id, createdAt, updatedAt, ...rest } = aliado
    setForm(rest)
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
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el aliado.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(aliado: Aliado) {
    if (!window.confirm(`¿Eliminar el aliado "${aliado.nombre}"?`)) return
    await remove(aliado.id).catch(() => window.alert('No se pudo eliminar el aliado.'))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Aliados estratégicos</h1>
          <p className="text-sm text-slate-500">Se muestran en /institucional/aliados-estrategicos.</p>
        </div>
        <PrimaryButton onClick={openNew}>
          <FiPlus /> Nuevo aliado
        </PrimaryButton>
      </header>

      <div className="relative mb-4">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o descripción"
          className="pl-10"
        />
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <StateMessage>Cargando aliados…</StateMessage>
      ) : filtered.length === 0 ? (
        <StateMessage>Todavía no cargaste aliados.</StateMessage>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((aliado) => (
            <article key={aliado.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {aliado.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={aliado.imagen}
                      alt={aliado.nombre}
                      className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-contain p-1"
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-400">
                      {aliado.nombre.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-slate-900">{aliado.nombre}</h2>
                    <p className="text-xs text-slate-400">Orden {aliado.orden}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    aliado.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {aliado.activo ? 'Visible' : 'Oculto'}
                </span>
              </div>

              <p className="flex-1 text-sm leading-6 text-slate-600">{aliado.descripcion || '—'}</p>

              {aliado.sitio ? (
                <a
                  href={aliado.sitio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 truncate text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  <FiExternalLink className="shrink-0" />
                  <span className="truncate">{aliado.sitio}</span>
                </a>
              ) : null}

              <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(aliado)}
                  aria-label="Editar"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(aliado)}
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
        title={editing ? 'Editar aliado' : 'Nuevo aliado'}
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
                placeholder="Nombre de la institución o empresa"
              />
            </Field>

            <Field label="Imagen" hint="JPG, PNG, WEBP, AVIF o SVG. Máximo 4 MB.">
              <ImageUploader
                value={form.imagen}
                folder="aliados"
                label="Subir logo"
                onChange={(url) => setForm({ ...form, imagen: url })}
              />
            </Field>

            <Field label="Descripción">
              <Textarea
                rows={4}
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                placeholder="Breve descripción de la alianza."
              />
            </Field>

            <Field label="Sitio web" hint="Opcional. Debe empezar con https://">
              <Input
                value={form.sitio}
                onChange={(event) => setForm({ ...form, sitio: event.target.value })}
                placeholder="https://ejemplo.com"
              />
            </Field>

            <Field label="Orden" hint="Menor número, aparece primero.">
              <Input
                type="number"
                value={form.orden}
                onChange={(event) => setForm({ ...form, orden: Number(event.target.value) })}
              />
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm({ ...form, activo: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-400"
              />
              <span className="text-sm font-semibold text-slate-700">Visible en la web</span>
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
