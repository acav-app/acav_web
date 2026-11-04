import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { ForbiddenError, getSessionUser } from '@/lib/admin/session'
import { adminReturnPath } from '@/lib/admin/session-config'
import Sidebar from './sidebar'
import AdminSessionGuard from './session-guard'

export const metadata: Metadata = {
  title: 'Panel ACAV',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const next = adminReturnPath(headers().get('x-admin-return-to'))
  let user
  try {
    user = await getSessionUser()
  } catch (error) {
    if (error instanceof ForbiddenError) redirect(`/admin/login?reason=forbidden&next=${encodeURIComponent(next)}`)
    throw error
  }
  if (!user) redirect(`/admin/login?reason=expired&next=${encodeURIComponent(next)}`)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar email={user.email ?? null} />
      <main className="min-w-0 flex-1 px-4 pb-12 pt-20 lg:px-8 lg:pt-8"><AdminSessionGuard />{children}</main>
    </div>
  )
}
