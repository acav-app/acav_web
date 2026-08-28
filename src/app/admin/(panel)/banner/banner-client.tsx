'use client'

import { useMemo, useState } from 'react'
import { FiEdit2, FiFilm, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi'

import { emptyBannerSlide, type BannerSlide, type BannerSlideInput } from '@/lib/admin/types'
import Drawer from '../drawer'
import MediaUploader from '../media-uploader'
import { useCollection } from '../use-collection'
import { Field, GhostButton, Input, PrimaryButton, Select, StateMessage, Textarea } from '../ui'

export default function BannerClient() {
  const { items, loading, error, create, update, remove } = useCollection<BannerSlide, BannerSlideInput>(
    '/api/admin/banner'
  )
  const [editing, setEditing] = useState<BannerSlide | null>(null)
  const [form, setForm] = useState<BannerSlideInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const activos = useMemo(() => items.filter((slide) => slide.activo).length, [items])

  function openNew() {
    setEditing(null)
    setForm({ ...structuredClone(emptyBannerSlide), orden: items.length })
    setFormError(null)
  }

  function openEdit(slide: BannerSlide) {
    setEditing(slide)
    const { id, createdAt, updatedAt, ...rest } = slide
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
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el slide.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(slide: BannerSlide) {
    if (!window.confirm(`¿Eliminar el slide "${slide.titulo}"?`)) return
    await remove(slide.id).catch(() => window.alert('No se pudo eliminar el slide.'))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banner principal</h1>
          <p className="text-sm text-slate-500">
            {items.length} slide{items.length === 1 ? '' : 's'} · {activos} visible
            {activos === 1 ? '' : 's'} en la home.
          </p>
        </div>
        <PrimaryButton onClick={openNew}>
          <FiPlus /> Nuevo slide
        </PrimaryButton>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <StateMessage>Cargando banner…</StateMessage>
      ) : items.length === 0 ? (
        <StateMessage>
          Todavía no cargaste slides. Mientras tanto, la home muestra el banner por defecto.
        </StateMessage>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((slide) => (
            <article
              key={slide.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="relative h-40 bg-slate-900">
                {slide.tipo === 'video' ? (
                  <video
                    src={slide.media}
                    poster={slide.poster || undefined}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // Los archivos viven en R2; se sirven sin el optimizador de Next.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.media} alt={slide.titulo} className="h-full w-full object-cover" />
                )}

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {slide.tipo === 'video' ? <FiFilm /> : <FiImage />}
                  {slide.tipo}
                </span>

                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    slide.activo ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {slide.activo ? 'Visible' : 'Oculto'}
                </span>
              </div>

              <div className="p-5">
                <p className="text-xs text-slate-400">Orden {slide.orden}</p>
                <h2 className="mt-1 line-clamp-2 font-bold text-slate-900">{slide.titulo}</h2>
                {slide.subtitulo ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{slide.subtitulo}</p>
                ) : null}

                <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(slide)}
                    aria-label="Editar"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(slide)}
                    aria-label="Eliminar"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer
        open={Boolean(form)}
        title={editing ? 'Editar slide' : 'Nuevo slide'}
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
              <Textarea
                rows={2}
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                placeholder="Asociación Cordobesa de Agencias de Viajes"
              />
            </Field>

            <Field label="Subtítulo">
              <Textarea
                rows={3}
                value={form.subtitulo}
                onChange={(event) => setForm({ ...form, subtitulo: event.target.value })}
                placeholder="Trabajando junto a vos, defendiendo los derechos de quienes hacemos crecer el turismo en Córdoba"
              />
            </Field>

            <Field label="Tipo de contenido">
              <Select
                value={form.tipo}
                onChange={(event) =>
                  setForm({ ...form, tipo: event.target.value as BannerSlideInput['tipo'] })
                }
              >
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
              </Select>
            </Field>

            <Field
              label={form.tipo === 'video' ? 'Video de fondo' : 'Imagen de fondo'}
              hint={
                form.tipo === 'video'
                  ? 'MP4, WEBM o MOV. Máximo 120 MB. Recomendado: 1920×1080 sin audio.'
                  : 'JPG, PNG, WEBP o AVIF. Recomendado: 1920×1080.'
              }
            >
              <MediaUploader
                value={form.media}
                folder="banner"
                accept={form.tipo === 'video' ? 'video' : 'image'}
                label={form.tipo === 'video' ? 'Subir video' : 'Subir imagen'}
                onChange={(url, kind) => setForm({ ...form, media: url, tipo: url ? kind : form.tipo })}
              />
            </Field>

            {form.tipo === 'video' ? (
              <Field label="Poster del video" hint="Imagen que se muestra mientras carga el video.">
                <MediaUploader
                  value={form.poster}
                  folder="banner"
                  accept="image"
                  label="Subir poster"
                  onChange={(url) => setForm({ ...form, poster: url })}
                />
              </Field>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Botón principal · texto">
                <Input
                  value={form.ctaPrimario.label}
                  onChange={(event) =>
                    setForm({ ...form, ctaPrimario: { ...form.ctaPrimario, label: event.target.value } })
                  }
                  placeholder="Sumate a ACAV"
                />
              </Field>
              <Field label="Botón principal · link">
                <Input
                  value={form.ctaPrimario.href}
                  onChange={(event) =>
                    setForm({ ...form, ctaPrimario: { ...form.ctaPrimario, href: event.target.value } })
                  }
                  placeholder="/socios/asociate"
                />
              </Field>
              <Field label="Botón secundario · texto">
                <Input
                  value={form.ctaSecundario.label}
                  onChange={(event) =>
                    setForm({ ...form, ctaSecundario: { ...form.ctaSecundario, label: event.target.value } })
                  }
                  placeholder="Asociate"
                />
              </Field>
              <Field label="Botón secundario · link">
                <Input
                  value={form.ctaSecundario.href}
                  onChange={(event) =>
                    setForm({ ...form, ctaSecundario: { ...form.ctaSecundario, href: event.target.value } })
                  }
                  placeholder="/socios"
                />
              </Field>
            </div>

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
              <span className="text-sm font-semibold text-slate-700">Visible en la home</span>
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
