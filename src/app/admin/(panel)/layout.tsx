import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { getSessionUser } from '@/lib/admin/session'
import Sidebar from './sidebar'

export const metadata: Metadata = {
  title: 'Panel ACAV',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar email={user.email ?? null} />
      <main className="min-w-0 flex-1 px-4 pb-12 pt-20 lg:px-8 lg:pt-8">{children}</main>
    </div>
  )
}
