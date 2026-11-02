export const ASSOCIATION_FORM_PATH = '/socios/asociate'

export function isAssociationCtaLabel(label: string): boolean {
  const normalizedLabel = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return normalizedLabel.includes('asocia') || normalizedLabel.includes('sumate a acav')
}

export function isAssociationCta(label: string, href: string): boolean {
  const localHref = href.split(/[?#]/, 1)[0]

  return (
    isAssociationCtaLabel(label) ||
    localHref === ASSOCIATION_FORM_PATH ||
    href === '#asociate'
  )
}
