'use client'

import { useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'

import { emptyPost, slugify, type Post, type PostInput } from '@/lib/admin/types'
import Drawer from '../drawer'
import ImageUploader from '../image-uploader'
import RichTextEditor from '../rich-text-editor'
import { useCollection } from '../use-collection'
import { Field, GhostButton, Input, PrimaryButton, Select, StateMessage } from '../ui'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BlogClient() {
  const { items, loading, error, create, update, remove } = useCollection<Post, PostInput>('/api/admin/posts')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState<PostInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((post) =>
      [post.titulo, post.categoria, post.autor, post.slug].join(' ').toLowerCase().includes(term)
    )
  }, [items, query])

  function openNew() {
    setEditing(null)
    setForm({ ...emptyPost })
    setFormError(null)
  }

  function openEdit(post: Post) {
    setEditing(post)
    const { id, createdAt, updatedAt, ...rest } = post
    setForm(rest)
    setFormError(null)
  }

  function closeDrawer() {
    setForm(null)
    setEditing(null)
  }

  function setField<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
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
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar la nota.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(post: Post) {
    if (!window.confirm(`¿Eliminar la nota "${post.titulo}"?`)) return
    await remove(post.id).catch(() => window.alert('No se pudo eliminar la nota.'))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500">Creá, editá y publicá las notas del sitio.</p>
        </div>
        <PrimaryButton onClick={openNew}>
          <FiPlus /> Nueva nota
        </PrimaryButton>
      </header>

      <div className="relative mb-4">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título, categoría o autor"
          className="pl-10"
        />
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <StateMessage>Cargando notas…</StateMessage>
      ) : filtered.length === 0 ? (
        <StateMessage>No hay notas para mostrar.</StateMessage>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Título</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Categoría</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Creada</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((post) => (
                <tr key={post.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{post.titulo}</p>
                    <p className="text-xs text-slate-400">/{post.slug}</p>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-600 md:table-cell">{post.categoria || '—'}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        post.estado === 'publicado'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {post.estado}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-500 lg:table-cell">{formatDate(post.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        aria-label="Editar"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        aria-label="Eliminar"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={Boolean(form)}
        title={editing ? 'Editar nota' : 'Nueva nota'}
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
            <Field label="Título">
              <Input
                value={form.titulo}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, titulo: event.target.value } : prev))
                }
                placeholder="Título de la nota"
              />
            </Field>

            {/* <Field label="Slug" hint="Se genera automáticamente a partir del título.">
              <Input value={slugify(form.titulo)} readOnly disabled placeholder="mi-nota" />
            </Field> */}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría">
                <Input
                  value={form.categoria}
                  onChange={(event) => setField('categoria', event.target.value)}
                  placeholder="Novedades"
                />
              </Field>
              <Field label="Autor">
                <Input
                  value={form.autor}
                  onChange={(event) => setField('autor', event.target.value)}
                  placeholder="Equipo ACAV"
                />
              </Field>
            </div>

            <Field label="Imagen" hint="JPG, PNG, WEBP, AVIF o SVG. Máximo 4 MB.">
              <ImageUploader
                value={form.imagen}
                folder="blog"
                label="Subir imagen"
                onChange={(url) => setField('imagen', url)}
              />
            </Field>

            <Field label="Resumen">
              <RichTextEditor
                value={form.resumen}
                minHeight="6rem"
                placeholder="Bajada corta que se muestra en el listado."
                onChange={(value) => setField('resumen', value)}
              />
            </Field>

            <Field label="Contenido">
              <RichTextEditor
                value={form.contenido}
                minHeight="18rem"
                placeholder="Texto completo de la nota."
                onChange={(value) => setField('contenido', value)}
              />
            </Field>

            <Field label="Estado">
              <Select
                value={form.estado}
                onChange={(event) => setField('estado', event.target.value as PostInput['estado'])}
              >
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </Select>
            </Field>

            {formError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
