'use client'

import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { FiDownload, FiEdit2, FiFileText, FiMail, FiPhone, FiPlus, FiSearch, FiTrash2, FiUpload } from 'react-icons/fi'

import { CATEGORIAS_SOCIO, emptySocio, type Socio, type SocioInput } from '@/lib/admin/types'
import Drawer from '../drawer'
import ImageUploader from '../image-uploader'
import { useCollection } from '../use-collection'
import { Field, GhostButton, Input, PrimaryButton, Select, StateMessage } from '../ui'

export default function SociosClient() {
  const { items, loading, error, create, update, remove, reload } = useCollection<Socio, SocioInput>(
    '/api/admin/socios'
  )
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Socio | null>(null)
  const [form, setForm] = useState<SocioInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [importFile, setImportFile] = useState<File | null>(null)
  const [importRows, setImportRows] = useState<SocioInput[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    creados: number
    saltados: number
    errores: string[]
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

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

  function findColumn(row: Record<string, unknown>, ...names: string[]) {
    const keys = Object.keys(row)
    const lowerKeys = keys.map((key) => key.toLowerCase().trim())
    const index = names.findIndex((name) => lowerKeys.includes(name.toLowerCase()))
    return index === -1 ? null : keys[index]
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImportFile(file)
    setImportRows([])
    setImportResult(null)
    setImportError(null)

    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) throw new Error('El archivo no tiene hojas.')

      const sheet = workbook.Sheets[sheetName]
      const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

      if (rawData.length === 0) throw new Error('El archivo no tiene datos para importar.')

      const rows: SocioInput[] = []
      for (const row of rawData) {
        const nombreKey = findColumn(row, 'nombre')
        if (!nombreKey) continue

        const nombre = String(row[nombreKey] ?? '').trim()
        if (!nombre) continue

        const legajoKey = findColumn(row, 'legajo')
        const localidadKey = findColumn(row, 'localidad')

        rows.push({
          ...emptySocio,
          nombre,
          legajo: legajoKey ? String(row[legajoKey] ?? '').trim() : '',
          localidad: localidadKey ? String(row[localidadKey] ?? '').trim() : '',
        })
      }

      if (rows.length === 0) throw new Error('No se encontraron socios válidos en el archivo.')
      setImportRows(rows)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'No se pudo leer el archivo.')
    } finally {
      event.target.value = ''
    }
  }

  async function handleImport() {
    if (importRows.length === 0) return
    setImporting(true)
    setImportError(null)
    setImportResult(null)

    try {
      const response = await fetch('/api/admin/socios/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: importRows }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'No se pudo importar el listado.')
      setImportResult(data)
      setImportRows([])
      setImportFile(null)
      await reload()
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'No se pudo importar el listado.')
    } finally {
      setImporting(false)
    }
  }

  function resetImport() {
    setImportFile(null)
    setImportRows([])
    setImportResult(null)
    setImportError(null)
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

      <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <FiFileText className="text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Importar listado masivo</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Subí un archivo Excel (.xlsx) con las columnas <strong>nombre</strong>, <strong>legajo</strong> y{' '}
                <strong>localidad</strong>. El resto de los campos se completan vacíos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {importRows.length > 0 ? (
              <button
                type="button"
                onClick={resetImport}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            ) : null}
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary-500 px-5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-primary-600">
              <FiUpload className="text-sm" />
              {importRows.length > 0 ? 'Cambiar archivo' : 'Seleccionar Excel'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importFile ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <FiFileText className="text-sm text-primary-600" />
            {importFile.name}
          </p>
        ) : null}

        {importRows.length > 0 ? (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">
                {importRows.length} socios encontrados para importar
              </p>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-500 px-5 text-xs font-bold uppercase text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiDownload className="text-sm" />
                {importing ? 'Importando…' : `Importar ${importRows.length} socios`}
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase text-slate-500">Nombre</th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase text-slate-500">Legajo</th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase text-slate-500">Localidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importRows.slice(0, 5).map((row, index) => (
                    <tr key={`${row.nombre}-${index}`}>
                      <td className="px-4 py-2 font-medium text-slate-900">{row.nombre}</td>
                      <td className="px-4 py-2 text-slate-500">{row.legajo || '—'}</td>
                      <td className="px-4 py-2 text-slate-500">{row.localidad || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importRows.length > 5 ? (
                <p className="px-4 py-2 text-xs text-slate-400">
                  +{importRows.length - 5} socios más
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {importResult ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">
              Importación completada: {importResult.creados} creados · {importResult.saltados} saltados (duplicados)
            </p>
            {importResult.errores.length > 0 ? (
              <p className="mt-1 text-xs leading-5 text-emerald-700">
                {importResult.errores.length} filas con errores: {importResult.errores.slice(0, 3).join(' · ')}
                {importResult.errores.length > 3 ? '…' : ''}
              </p>
            ) : null}
          </div>
        ) : null}

        {importError ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{importError}</p>
        ) : null}
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
