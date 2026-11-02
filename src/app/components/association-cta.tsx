import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { ASSOCIATION_FORM_PATH } from '@/lib/association-cta'

type AssociationCtaLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  children: ReactNode
}

export function AssociationCtaLink({ children, ...props }: AssociationCtaLinkProps) {
  return (
    <Link {...props} href={ASSOCIATION_FORM_PATH}>
      {children}
    </Link>
  )
}
