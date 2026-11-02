'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiAward, FiFileText, FiImage, FiInbox, FiLogOut, FiMenu, FiUsers, FiX } from 'react-icons/fi'
import { signOut } from 'firebase/auth'

import { firebaseAuth } from '@/lib/firebase/client'

const NAV = [
  { href: '/admin/banner', label: 'Banner', icon: FiImage },
  { href: '/admin/blog', label: 'Blog', icon: FiFileText },
  { href: '/admin/socios', label: 'Socios', icon: FiUsers },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: FiInbox },
  { href: '/admin/aliados', label: 'Aliados', icon: FiAward },
]

export default function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    setSigningOut(true)
    try {
      await fetch('/api/admin/session', { method: 'DELETE' })
      await signOut(firebaseAuth()).catch(() => undefined)
      router.replace('/admin/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  const nav = (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="text-lg" />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const panel = (
    <div className="flex h-full flex-col bg-white">
      <div className="px-6 py-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600">ACAV</p>
        <p className="text-lg font-bold text-slate-900">Panel admin</p>
      </div>

      {nav}

      <div className="border-t border-slate-100 px-4 py-4">
        {email ? <p className="mb-2 truncate px-1 text-xs text-slate-500">{email}</p> : null}
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        >
          <FiLogOut className="text-lg" />
          {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block">{panel}</aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"
      >
        <FiMenu />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <FiX />
            </button>
            {panel}
          </div>
        </div>
      ) : null}
    </>
  )
}
