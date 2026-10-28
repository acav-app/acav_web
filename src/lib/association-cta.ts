export type AssociationCtaMode = 'whatsapp' | 'url'

export interface AssociationCtaSettings {
  mode: AssociationCtaMode
  url: string
  whatsappPhone: string
  whatsappMessage: string
}

export const DEFAULT_ASSOCIATION_CTA_SETTINGS: AssociationCtaSettings = {
  mode: 'url',
  url: '/socios/asociate',
  whatsappPhone: '',
  whatsappMessage: 'Hola, quiero asociarme a ACAV.',
}

export const ASSOCIATION_CTA_UPDATED_EVENT = 'acav:association-cta-updated'

export function normalizeAssociationCtaSettings(value: unknown): AssociationCtaSettings {
  const raw = (value ?? {}) as Record<string, unknown>
  const mode = raw.mode

  if (mode !== 'whatsapp' && mode !== 'url') {
    throw new Error('Elegí si el botón debe abrir WhatsApp o una URL.')
  }

  const url = typeof raw.url === 'string' ? raw.url.trim() : ''
  const whatsappPhone = typeof raw.whatsappPhone === 'string' ? raw.whatsappPhone.replace(/\D/g, '') : ''
  const whatsappMessage =
    typeof raw.whatsappMessage === 'string'
      ? raw.whatsappMessage.trim()
      : DEFAULT_ASSOCIATION_CTA_SETTINGS.whatsappMessage

  if (mode === 'url') {
    const isLocalPath = url.startsWith('/') && !url.startsWith('//')
    let isHttpUrl = false

    try {
      const parsed = new URL(url)
      isHttpUrl = parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      // También se aceptan rutas internas como /socios/asociate.
    }

    if (!url || (!isLocalPath && !isHttpUrl)) {
      throw new Error('Ingresá una ruta interna (por ejemplo /socios/asociate) o una URL HTTP/HTTPS válida.')
    }
  }

  if (mode === 'whatsapp') {
    if (whatsappPhone.length < 8 || whatsappPhone.length > 15) {
      throw new Error('Ingresá el teléfono de WhatsApp con código de país, usando entre 8 y 15 dígitos.')
    }

    if (whatsappMessage.length > 500) {
      throw new Error('El mensaje de WhatsApp no puede superar los 500 caracteres.')
    }
  }

  return { mode, url, whatsappPhone, whatsappMessage }
}

export function getAssociationCtaHref(settings: AssociationCtaSettings): string {
  if (settings.mode === 'whatsapp') {
    return `https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(settings.whatsappMessage)}`
  }

  return settings.url || DEFAULT_ASSOCIATION_CTA_SETTINGS.url
}

export function isAssociationCta(label: string, href: string): boolean {
  const normalizedLabel = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const localHref = href.split(/[?#]/, 1)[0]

  return (
    normalizedLabel.includes('asocia') ||
    normalizedLabel.includes('sumate a acav') ||
    localHref === '/socios/asociate' ||
    href === '#asociate'
  )
}
