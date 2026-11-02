'use client'

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  FiArrowDown,
  FiArrowUp,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiFileText,
  FiImage,
  FiLoader,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi'

import { emptyPost, slugify, type Post, type PostBlock, type PostInput } from '@/lib/admin/types'
import ImageUploader from '../image-uploader'
import RichTextEditor from '../rich-text-editor'
import { useCollection } from '../use-collection'
import { Field, GhostButton, Input, PrimaryButton, Select, StateMessage } from '../ui'

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml'
const MAX_IMAGE_SIZE = 4 * 1024 * 1024

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function newBlockId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `bloque-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function postImage(post: Post) {
  return post.imagen || post.bloques.find((block) => block.tipo === 'imagen')?.url || ''
}

function blocksForEdit(post: Post): PostBlock[] {
  if (post.bloques.length) return post.bloques
  return post.contenido.trim()
    ? [{ id: newBlockId(), tipo: 'texto', contenido: post.contenido }]
    : []
}

export default function BlogClient() {
  const { items, loading, error, create, update, remove } = useCollection<Post, PostInput>('/api/admin/posts')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'publicado' | 'borrador'>('todos')
  const [editing, setEditing] = useState<Post | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es-AR')
    return items.filter((post) => {
      if (statusFilter !== 'todos' && post.estado !== statusFilter) return false
      return !term || [post.titulo, post.categoria, post.autor, post.slug]
        .join(' ').toLocaleLowerCase('es-AR').includes(term)
    })
  }, [items, query, statusFilter])

  const publishedCount = items.filter((post) => post.estado === 'publicado').length
  const draftCount = items.length - publishedCount

  const openNew = () => {
    setEditing(null)
    setEditorOpen(true)
  }

  const openEdit = (post: Post) => {
    setEditing(post)
    setEditorOpen(true)
  }

  const closeEditor = useCallback(() => {
    setEditorOpen(false)
    setEditing(null)
  }, [])

  async function savePost(input: PostInput) {
    if (editing) await update(editing.id, input)
    else await create(input)
    closeEditor()
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`¿Eliminar la nota “${post.titulo}”? Esta acción no se puede deshacer.`)) return
    await remove(post.id).catch((cause) => window.alert(cause instanceof Error ? cause.message : 'No se pudo eliminar la nota.'))
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-600">Comunicación institucional</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Blog y actualidad</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Creá publicaciones con texto e imágenes en el orden que quieras y revisá cómo se verán antes de publicarlas.</p>
        </div>
        <PrimaryButton onClick={openNew} className="h-11 rounded-xl px-4 shadow-sm">
          <FiPlus /> Nueva publicación
        </PrimaryButton>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <OverviewCard label="Publicaciones" value={items.length} icon={FiFileText} tone="blue" />
        <OverviewCard label="Publicadas" value={publishedCount} icon={FiCheckCircle} tone="green" />
        <OverviewCard label="Borradores" value={draftCount} icon={FiEdit2} tone="amber" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-base font-bold text-slate-900">Publicaciones</h2><p className="mt-0.5 text-xs text-slate-500">{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</p></div>
          <div className="grid gap-2 sm:grid-cols-[minmax(250px,1fr)_180px]">
            <label className="relative">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar título, categoría o autor" className="h-10 pl-10" aria-label="Buscar publicaciones" />
            </label>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-10">
              <option value="todos">Todos los estados</option>
              <option value="publicado">Publicadas</option>
              <option value="borrador">Borradores</option>
            </Select>
          </div>
        </div>

        {error ? <p className="m-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

        {loading ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3" aria-label="Cargando publicaciones">
            {[0, 1, 2].map((key) => <div key={key} className="animate-pulse overflow-hidden rounded-2xl border border-slate-100"><div className="aspect-[16/9] bg-slate-100" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-100" /></div></div>)}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((post) => (
              <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-slate-200/60">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  {postImage(post) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={postImage(post)} alt={post.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300"><FiImage size={28} /><span className="text-xs font-medium">Sin imagen de portada</span></div>}
                  <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${post.estado === 'publicado' ? 'border-emerald-200 bg-white/95 text-emerald-700' : 'border-amber-200 bg-white/95 text-amber-700'}`}>
                    {post.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                    {post.categoria || 'Sin categoría'}
                    {post.bloques.length ? <><span className="text-slate-300">·</span><span className="text-slate-500">{post.bloques.length} bloques</span></> : null}
                  </div>
                  <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900">{post.titulo}</h3>
                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{stripHtml(post.resumen) || 'Sin resumen.'}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                    <span className="min-w-0 truncate">{post.autor || 'Sin autor'}</span>
                    <span className="inline-flex shrink-0 items-center gap-1"><FiCalendar />{formatDate(post.updatedAt || post.createdAt)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => openEdit(post)} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white transition hover:bg-primary-700"><FiEdit2 /> Editar nota</button>
                    <button type="button" onClick={() => void deletePost(post)} aria-label={`Eliminar ${post.titulo}`} title="Eliminar publicación" className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><FiTrash2 /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FiFileText size={21} /></span>
            <h3 className="mt-4 text-sm font-bold text-slate-800">{items.length ? 'No hay coincidencias' : 'Todavía no hay publicaciones'}</h3>
            <p className="mt-1 text-sm text-slate-500">{items.length ? 'Probá con otro término o filtro.' : 'Creá la primera nota para compartir novedades de ACAV.'}</p>
          </div>
        )}
      </section>

      {editorOpen ? <BlogPostEditor key={editing?.id ?? 'new'} post={editing} onClose={closeEditor} onSave={savePost} /> : null}
    </div>
  )
}

function OverviewCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof FiFileText; tone: 'blue' | 'green' | 'amber' }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</p></div>
      <span className={`flex size-10 items-center justify-center rounded-xl ${colors[tone]}`}><Icon size={18} /></span>
    </div>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formFromPost(post: Post | null): PostInput {
  if (!post) return { ...emptyPost, bloques: [] }
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...form } = post
  return { ...form, bloques: blocksForEdit(post) }
}

async function uploadBlogImage(file: File) {
  if (!ACCEPTED_IMAGES.split(',').includes(file.type)) throw new Error('Formato no permitido. Usá JPG, PNG, WEBP, AVIF o SVG.')
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Cada imagen puede pesar hasta 4 MB.')
  const body = new FormData()
  body.append('file', file)
  body.append('folder', 'blog')
  const response = await fetch('/api/admin/uploads', { method: 'POST', body })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || typeof data.url !== 'string') throw new Error(data.error ?? `No se pudo subir ${file.name}.`)
  return data.url as string
}

function BlogPostEditor({ post, onClose, onSave }: { post: Post | null; onClose: () => void; onSave: (input: PostInput) => Promise<void> }) {
  const [form, setForm] = useState<PostInput>(() => formFromPost(post))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [mobilePreview, setMobilePreview] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, saving])

  function setField<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function addTextBlock() {
    setForm((current) => ({
      ...current,
      bloques: [...current.bloques, { id: newBlockId(), tipo: 'texto', contenido: '' }],
    }))
  }

  function moveBlock(index: number, offset: -1 | 1) {
    setForm((current) => {
      const target = index + offset
      if (target < 0 || target >= current.bloques.length) return current
      const bloques = [...current.bloques]
      const [block] = bloques.splice(index, 1)
      bloques.splice(target, 0, block)
      return { ...current, bloques }
    })
  }

  function removeBlock(id: string) {
    setForm((current) => ({ ...current, bloques: current.bloques.filter((block) => block.id !== id) }))
  }

  function updateTextBlock(id: string, contenido: string) {
    setForm((current) => ({
      ...current,
      bloques: current.bloques.map((block) => block.id === id && block.tipo === 'texto' ? { ...block, contenido } : block),
    }))
  }

  function updateImageBlock(id: string, changes: Partial<Extract<PostBlock, { tipo: 'imagen' }>>) {
    setForm((current) => ({
      ...current,
      bloques: current.bloques.map((block) => block.id === id && block.tipo === 'imagen' ? { ...block, ...changes } : block),
    }))
  }

  async function addImageFiles(files: File[]) {
    if (!files.length) return
    setUploadError('')
    const uploaded: PostBlock[] = []
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      setUploadProgress(`Subiendo imagen ${index + 1} de ${files.length}…`)
      try {
        const url = await uploadBlogImage(file)
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
        uploaded.push({ id: newBlockId(), tipo: 'imagen', url, alt: name, epigrafe: '' })
      } catch (cause) {
        setUploadError(cause instanceof Error ? cause.message : `No se pudo subir ${file.name}.`)
      }
    }
    if (uploaded.length) setForm((current) => ({ ...current, bloques: [...current.bloques, ...uploaded] }))
    setUploadProgress('')
  }

  async function replaceImage(id: string, file: File) {
    setUploadError('')
    setUploadProgress('Reemplazando imagen…')
    try {
      const url = await uploadBlogImage(file)
      updateImageBlock(id, { url })
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : 'No se pudo reemplazar la imagen.')
    } finally {
      setUploadProgress('')
    }
  }

  async function handleSave() {
    setFormError('')
    if (!form.titulo.trim()) {
      setFormError('Ingresá un título para la publicación.')
      return
    }
    if (form.estado === 'publicado') {
      const missingAlt = form.bloques.find((block) => block.tipo === 'imagen' && !block.alt.trim())
      if (missingAlt) {
        setFormError('Completá el texto alternativo de cada imagen antes de publicar.')
        return
      }
    }
    if (uploadProgress) return

    setSaving(true)
    try {
      const legacyHtml = form.bloques
        .filter((block): block is Extract<PostBlock, { tipo: 'texto' }> => block.tipo === 'texto')
        .map((block) => block.contenido)
        .filter(Boolean)
        .join('\n')
      await onSave({ ...form, contenido: legacyHtml })
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'No se pudo guardar la publicación.')
    } finally {
      setSaving(false)
    }
  }

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    void addImageFiles(files)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:p-3 lg:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <section role="dialog" aria-modal="true" aria-label={post ? 'Editar publicación' : 'Nueva publicación'} className="flex h-full max-h-[96vh] w-full max-w-[1480px] flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl lg:rounded-3xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-6">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-600">Editor de actualidad</p><h2 className="mt-0.5 truncate text-lg font-bold text-slate-900">{post ? 'Editar publicación' : 'Nueva publicación'}</h2></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar editor" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"><FiX /></button>
        </header>

        <div className="grid shrink-0 grid-cols-2 border-b border-slate-100 bg-slate-50 p-1.5 lg:hidden">
          <button type="button" onClick={() => setMobilePreview(false)} aria-pressed={!mobilePreview} className={`rounded-lg px-3 py-2 text-xs font-semibold ${!mobilePreview ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}>Editar contenido</button>
          <button type="button" onClick={() => setMobilePreview(true)} aria-pressed={mobilePreview} className={`rounded-lg px-3 py-2 text-xs font-semibold ${mobilePreview ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}><FiEye className="mr-1 inline" /> Vista previa</button>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className={`min-w-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 ${mobilePreview ? 'hidden lg:block' : 'block'}`}>
            <div className="mx-auto max-w-3xl space-y-6">
              <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <SectionHeading number="01" title="Datos de la publicación" description="La información que identifica la nota en el sitio." />
                <div className="mt-5 space-y-4">
                  <Field label="Título">
                    <Input autoFocus={!post} value={form.titulo} onChange={(event) => setField('titulo', event.target.value)} placeholder="Escribí un título claro y atractivo" maxLength={180} />
                  </Field>
                  <div className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">URL de la nota: <span className="font-semibold text-slate-700">/novedades/actualidad/{slugify(form.titulo) || 'titulo-de-la-nota'}</span></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Categoría"><Input value={form.categoria} onChange={(event) => setField('categoria', event.target.value)} placeholder="Novedades" maxLength={80} /></Field>
                    <Field label="Autor"><Input value={form.autor} onChange={(event) => setField('autor', event.target.value)} placeholder="Equipo ACAV" maxLength={100} /></Field>
                  </div>
                  <Field label="Estado">
                    <Select value={form.estado} onChange={(event) => setField('estado', event.target.value as PostInput['estado'])}>
                      <option value="borrador">Borrador · Solo visible en administración</option>
                      <option value="publicado">Publicado · Visible en Actualidad</option>
                    </Select>
                  </Field>
                  <Field label="Resumen" hint="Se muestra en las tarjetas y en el inicio de la nota.">
                    <RichTextEditor value={form.resumen} minHeight="6rem" placeholder="Una bajada breve para presentar la noticia." onChange={(value) => setField('resumen', value)} />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <SectionHeading number="02" title="Imagen de portada" description="La portada se usa en el listado de Actualidad y al compartir la nota." />
                <div className="mt-5">
                  <Field label="Fotografía principal" hint="JPG, PNG, WEBP, AVIF o SVG. Hasta 4 MB.">
                    <ImageUploader value={form.imagen} folder="blog" label="Subir portada" onChange={(url) => setField('imagen', url)} />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <SectionHeading number="03" title="Contenido de la nota" description="Agregá bloques y ordenalos para construir el artículo." />
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{form.bloques.length} bloques</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={addTextBlock} disabled={Boolean(uploadProgress)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"><FiPlus /> Agregar texto</button>
                  <label className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 ${uploadProgress ? 'cursor-wait opacity-50' : ''}`}>
                    {uploadProgress ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}{uploadProgress || 'Agregar imágenes'}
                    <input type="file" accept={ACCEPTED_IMAGES} multiple disabled={Boolean(uploadProgress)} className="sr-only" onChange={selectImages} />
                  </label>
                </div>

                {uploadError ? <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700" role="alert">{uploadError}</p> : null}

                <div className="mt-4 space-y-3">
                  {form.bloques.length ? form.bloques.map((block, index) => (
                    <ContentBlockEditor
                      key={block.id}
                      block={block}
                      index={index}
                      total={form.bloques.length}
                      onMove={moveBlock}
                      onRemove={removeBlock}
                      onTextChange={updateTextBlock}
                      onImageChange={updateImageBlock}
                      onReplaceImage={replaceImage}
                      uploadProgress={uploadProgress}
                    />
                  )) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center">
                      <FiFileText className="mx-auto text-xl text-slate-300" />
                      <p className="mt-2 text-sm font-semibold text-slate-600">El artículo todavía no tiene contenido</p>
                      <p className="mt-1 text-xs text-slate-400">Empezá con un bloque de texto o cargá imágenes.</p>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-[11px] leading-5 text-slate-400">Las notas antiguas se cargan como un primer bloque de texto. Usá las flechas de cada bloque para cambiar su posición.</p>
              </section>

              {formError ? <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{formError}</p> : null}
            </div>
          </div>

          <aside className={`min-w-0 overflow-y-auto border-l border-slate-200 bg-slate-50/80 p-4 sm:p-6 lg:block lg:p-7 ${mobilePreview ? 'block' : 'hidden'}`}>
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">Vista previa</p><h3 className="mt-1 text-sm font-bold text-slate-900">Así se verá la publicación</h3></div><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">{form.estado === 'publicado' ? 'Publicación' : 'Borrador'}</span></div>
              <ArticlePreview form={form} />
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3.5 sm:px-6">
          <p className="hidden text-xs text-slate-400 sm:block">Los cambios se guardan al confirmar.</p>
          <div className="ml-auto flex gap-2">
            <GhostButton onClick={onClose} disabled={saving}>Cancelar</GhostButton>
            <PrimaryButton onClick={() => void handleSave()} disabled={saving || Boolean(uploadProgress)} className="min-w-32">
              {saving ? <><FiLoader className="animate-spin" /> Guardando…</> : form.estado === 'publicado' ? 'Guardar publicación' : 'Guardar borrador'}
            </PrimaryButton>
          </div>
        </footer>
      </section>
    </div>
  )
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[10px] font-bold text-primary-700">{number}</span>
      <div><h3 className="text-sm font-bold text-slate-900">{title}</h3><p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p></div>
    </div>
  )
}

function ContentBlockEditor({ block, index, total, onMove, onRemove, onTextChange, onImageChange, onReplaceImage, uploadProgress }: {
  block: PostBlock
  index: number
  total: number
  onMove: (index: number, offset: -1 | 1) => void
  onRemove: (id: string) => void
  onTextChange: (id: string, value: string) => void
  onImageChange: (id: string, changes: Partial<Extract<PostBlock, { tipo: 'imagen' }>>) => void
  onReplaceImage: (id: string, file: File) => void
  uploadProgress: string
}) {
  const isText = block.tipo === 'texto'
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2"><span className="flex size-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">{isText ? <FiFileText size={13} /> : <FiImage size={13} />}</span><p className="truncate text-xs font-bold text-slate-700">Bloque {index + 1} <span className="font-medium text-slate-400">· {isText ? 'Texto' : 'Imagen'}</span></p></div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0 || Boolean(uploadProgress)} aria-label={`Mover bloque ${index + 1} hacia arriba`} className="flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-30"><FiArrowUp size={14} /></button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1 || Boolean(uploadProgress)} aria-label={`Mover bloque ${index + 1} hacia abajo`} className="flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-30"><FiArrowDown size={14} /></button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => onRemove(block.id)} disabled={Boolean(uploadProgress)} aria-label={`Eliminar bloque ${index + 1}`} className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><FiTrash2 size={13} /></button>
        </div>
      </header>

      <div className="p-3 sm:p-4">
        {block.tipo === 'texto' ? (
          <RichTextEditor value={block.contenido} minHeight="10rem" placeholder="Escribí el contenido de este bloque…" onChange={(value) => onTextChange(block.id, value)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.9fr)]">
            <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.url} alt={block.alt || ''} className="max-h-72 w-full object-contain" />
              <label className="absolute bottom-2 right-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-white">
                {uploadProgress ? <FiLoader className="animate-spin" /> : <FiUploadCloud />} Reemplazar
                <input type="file" accept={ACCEPTED_IMAGES} disabled={Boolean(uploadProgress)} className="sr-only" onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  event.currentTarget.value = ''
                  if (file) onReplaceImage(block.id, file)
                }} />
              </label>
            </div>
            <div className="space-y-3">
              <Field label="Texto alternativo" hint="Describe la imagen para lectores de pantalla. Obligatorio para publicar.">
                <Input value={block.alt} onChange={(event) => onImageChange(block.id, { alt: event.target.value })} placeholder="Qué muestra la imagen" maxLength={300} />
              </Field>
              <Field label="Epígrafe" hint="Opcional. Aparece debajo de la imagen en la nota.">
                <textarea value={block.epigrafe} onChange={(event) => onImageChange(block.id, { epigrafe: event.target.value })} rows={3} maxLength={500} placeholder="Añadí contexto o crédito de imagen" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
              </Field>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function ArticlePreview({ form }: { form: PostInput }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 pb-5 pt-6 sm:px-7 sm:pt-8">
        {form.categoria ? <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">{form.categoria}</p> : null}
        <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[28px]">{form.titulo || 'Título de la publicación'}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
          {form.autor ? <span>{form.autor}</span> : null}<span>{form.estado === 'publicado' ? 'Publicación' : 'Vista de borrador'}</span>
        </div>
      </div>
      {form.imagen ? (
        <div className="aspect-[16/9] overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.imagen} alt={form.titulo || 'Portada de la nota'} className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="px-5 py-5 sm:px-7">
        {form.resumen ? <div className="post-content mb-6 border-l-2 border-primary-200 pl-3 text-sm leading-6 text-slate-600" dangerouslySetInnerHTML={{ __html: form.resumen }} /> : null}
        <div className="space-y-5">
          {form.bloques.map((block, index) => block.tipo === 'texto' ? (
            <div key={`${block.id}-${index}`} className="post-content text-sm leading-7 text-slate-700" dangerouslySetInnerHTML={{ __html: block.contenido || '<p>El texto aparecerá acá.</p>' }} />
          ) : (
            <figure key={`${block.id}-${index}`}>
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.alt} className="max-h-96 w-full object-contain" />
              </div>
              {block.epigrafe ? <figcaption className="mt-2 text-center text-xs text-slate-500">{block.epigrafe}</figcaption> : null}
            </figure>
          ))}
          {!form.bloques.length ? <p className="text-xs italic text-slate-400">Los bloques de contenido aparecerán acá en el orden elegido.</p> : null}
        </div>
      </div>
    </article>
  )
}
