'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { MouseEventHandler, ReactNode } from 'react'
import Link from 'next/link'

import {
  ASSOCIATION_CTA_UPDATED_EVENT,
  DEFAULT_ASSOCIATION_CTA_SETTINGS,
  getAssociationCtaHref,
  normalizeAssociationCtaSettings,
  type AssociationCtaSettings,
} from '@/lib/association-cta'

const AssociationCtaContext = createContext<AssociationCtaSettings>(DEFAULT_ASSOCIATION_CTA_SETTINGS)

export function AssociationCtaProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_ASSOCIATION_CTA_SETTINGS)

  const refreshSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/association-cta', { cache: 'no-store' })
      if (!response.ok) return

      const payload = (await response.json()) as { settings?: unknown }
      if (payload.settings) setSettings(normalizeAssociationCtaSettings(payload.settings))
    } catch {
      // Keep the built-in route as a safe fallback if the public settings endpoint is unavailable.
    }
  }, [])

  useEffect(() => {
    void refreshSettings()

    const onSettingsUpdated = (event: Event) => {
      const updated = (event as CustomEvent<AssociationCtaSettings>).detail
      if (updated) setSettings(updated)
      else void refreshSettings()
    }

    window.addEventListener('focus', refreshSettings)
    window.addEventListener(ASSOCIATION_CTA_UPDATED_EVENT, onSettingsUpdated)
    return () => {
      window.removeEventListener('focus', refreshSettings)
      window.removeEventListener(ASSOCIATION_CTA_UPDATED_EVENT, onSettingsUpdated)
    }
  }, [refreshSettings])

  return <AssociationCtaContext.Provider value={settings}>{children}</AssociationCtaContext.Provider>
}

interface AssociationCtaLinkProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  'aria-label'?: string
}

export function AssociationCtaLink({
  children,
  className,
  onClick,
  'aria-label': ariaLabel,
}: AssociationCtaLinkProps) {
  const settings = useContext(AssociationCtaContext)
  const href = getAssociationCtaHref(settings)
  const isExternal = /^https?:\/\//i.test(href)

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}
