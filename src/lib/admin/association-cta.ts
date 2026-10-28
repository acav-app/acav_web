import 'server-only'

import { adminDb } from '@/lib/firebase/admin'
import {
  DEFAULT_ASSOCIATION_CTA_SETTINGS,
  normalizeAssociationCtaSettings,
  type AssociationCtaSettings,
} from '@/lib/association-cta'

const SETTINGS_COLLECTION = 'siteSettings'
const SETTINGS_DOCUMENT = 'associationCta'

export async function getAssociationCtaSettings(): Promise<AssociationCtaSettings> {
  const snapshot = await adminDb().collection(SETTINGS_COLLECTION).doc(SETTINGS_DOCUMENT).get()
  if (!snapshot.exists) return DEFAULT_ASSOCIATION_CTA_SETTINGS

  try {
    return normalizeAssociationCtaSettings(snapshot.data())
  } catch (error) {
    console.error('[association-cta] Configuración inválida; se usa el destino predeterminado.', error)
    return DEFAULT_ASSOCIATION_CTA_SETTINGS
  }
}

export async function saveAssociationCtaSettings(value: unknown): Promise<AssociationCtaSettings> {
  const settings = normalizeAssociationCtaSettings(value)

  await adminDb()
    .collection(SETTINGS_COLLECTION)
    .doc(SETTINGS_DOCUMENT)
    .set({ ...settings, updatedAt: new Date() }, { merge: true })

  return settings
}
