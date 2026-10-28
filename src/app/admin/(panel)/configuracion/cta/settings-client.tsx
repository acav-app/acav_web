'use client'

import { useEffect, useState } from 'react'
import { FiCheck, FiSave } from 'react-icons/fi'

import {
  ASSOCIATION_CTA_UPDATED_EVENT,
  DEFAULT_ASSOCIATION_CTA_SETTINGS,
  type AssociationCtaSettings,
} from '@/lib/association-cta'
import { Field, Input, PrimaryButton, Select, StateMessage, Textarea } from '../../ui'

export default function AssociationCtaSettingsClient() {
  const [settings, setSettings] = useState<AssociationCtaSettings>(DEFAULT_ASSOCIATION_CTA_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      try {
        const response = await fetch('/api/association-cta', { cache: 'no-store' })
        const payload = (await response.json()) as {
          settings?: AssociationCtaSettings
          error?: string
        }

        if (!response.ok) throw new Error(payload.error || 'No se pudo cargar la configuración.')
        if (active && payload.settings) setSettings(payload.settings)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la configuración.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadSettings()
    return () => {
      active = false
    }
  }, [])

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch('/api/admin/association-cta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const payload = (await response.json()) as {
        settings?: AssociationCtaSettings
        error?: string
      }

      if (!response.ok) throw new Error(payload.error || 'No se pudo guardar la configuración.')
      if (!payload.settings) throw new Error('El servidor no devolvió la configuración guardada.')

      setSettings(payload.settings)
      setSaved(true)
      window.dispatchEvent(
        new CustomEvent(ASSOCIATION_CTA_UPDATED_EVENT, { detail: payload.settings })
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la configuración.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Destino del botón Asociate</h1>
        <p className="mt-1 text-sm text-slate-500">
          Elegí a dónde dirigen los botones de asociación del sitio. El cambio se aplica sin volver a desplegar.
        </p>
      </header>

      {loading ? (
        <StateMessage>Cargando configuración…</StateMessage>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <Field label="Destino">
            <Select
              value={settings.mode}
              onChange={(event) => {
                setSettings({ ...settings, mode: event.target.value as AssociationCtaSettings['mode'] })
                setSaved(false)
              }}
            >
              <option value="url">Una URL</option>
              <option value="whatsapp">WhatsApp</option>
            </Select>
          </Field>

          {settings.mode === 'url' ? (
            <Field
              label="URL de destino"
              hint="Usá una ruta interna, por ejemplo /socios/asociate, o una dirección completa que comience con https://."
            >
              <Input
                value={settings.url}
                onChange={(event) => {
                  setSettings({ ...settings, url: event.target.value })
                  setSaved(false)
                }}
                placeholder="/socios/asociate o https://ejemplo.com"
                required
              />
            </Field>
          ) : (
            <>
              <Field
                label="Teléfono de WhatsApp"
                hint="Incluí el código de país y de área, solo números. Ejemplo de formato: 5493511234567."
              >
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={settings.whatsappPhone}
                  onChange={(event) => {
                    setSettings({ ...settings, whatsappPhone: event.target.value })
                    setSaved(false)
                  }}
                  placeholder="5493511234567"
                  required
                />
              </Field>
              <Field label="Mensaje inicial" hint="Se abrirá precargado en WhatsApp (máximo 500 caracteres).">
                <Textarea
                  value={settings.whatsappMessage}
                  onChange={(event) => {
                    setSettings({ ...settings, whatsappMessage: event.target.value })
                    setSaved(false)
                  }}
                  rows={4}
                  maxLength={500}
                  required
                />
              </Field>
            </>
          )}

          {error ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          {saved ? (
            <p role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <FiCheck /> Cambios guardados y aplicados.
            </p>
          ) : null}

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <PrimaryButton type="submit" disabled={saving}>
              <FiSave /> {saving ? 'Guardando…' : 'Guardar destino'}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  )
}
