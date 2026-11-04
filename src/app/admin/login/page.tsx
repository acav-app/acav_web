import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthServiceUnavailableError, ForbiddenError, getSessionUser } from '@/lib/admin/session'
import { adminReturnPath } from '@/lib/admin/session-config'

import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Panel ACAV · Ingresar',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: { next?: string } }) {
  let hasValidSession = false
  try {
    hasValidSession = !!await getSessionUser()
  } catch (error) {
    if (!(error instanceof AuthServiceUnavailableError) && !(error instanceof ForbiddenError)) throw error
  }
  if (hasValidSession) redirect(adminReturnPath(searchParams.next))
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600">ACAV</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Panel de administración</h1>
          <p className="mt-1 text-sm text-slate-500">Ingresá con tu cuenta autorizada.</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
