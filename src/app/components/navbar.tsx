'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi'

import { siteConfig } from '../config/site'

const easeOutCubic = [0.22, 1, 0.36, 1] as const

export default function Navbar(_props?: { navLight?: boolean; playBtn?: boolean; bgLight?: boolean; navCenter?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const body = document.body

    if (menuOpen) {
      root.style.setProperty('overflow', 'hidden', 'important')
      root.style.setProperty('touch-action', 'none', 'important')
      body.style.setProperty('overflow', 'hidden', 'important')
      body.style.setProperty('position', 'fixed', 'important')
      body.style.setProperty('inset', '0', 'important')
    } else {
      root.style.removeProperty('overflow')
      root.style.removeProperty('touch-action')
      body.style.removeProperty('overflow')
      body.style.removeProperty('position')
      body.style.removeProperty('inset')
    }

    const prevent = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null
      if (t && t.closest('[data-mobile-menu-scroll]')) return
      if (e.cancelable) e.preventDefault()
    }
    if (menuOpen) {
      document.addEventListener('touchmove', prevent, { passive: false })
    }

    return () => {
      document.removeEventListener('touchmove', prevent)
      root.style.removeProperty('overflow')
      root.style.removeProperty('touch-action')
      body.style.removeProperty('overflow')
      body.style.removeProperty('position')
      body.style.removeProperty('inset')
    }
  }, [menuOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-5 md:h-[72px]">
          <Link
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="relative z-30 shrink-0"
          >
            <Image
              src="/images/logo-azul.png"
              alt="ACAV"
              width={192}
              height={64}
              priority
              className="h-9 w-auto md:h-[42px]"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {siteConfig.nav.items.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-bold uppercase text-slate-700 transition-colors duration-300 hover:bg-slate-50 hover:text-primary-600"
                >
                  {item.label}
                  <FiChevronDown className="mt-0.5 text-[10px] text-slate-400 transition group-hover:text-primary-500" />
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.nav.cta.href}
              className="hidden h-11 items-center justify-center rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_12px_30px_rgba(249,73,16,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-600 md:inline-flex"
            >
              {siteConfig.nav.cta.label}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="relative z-30 inline-flex size-11 items-center justify-center rounded-full bg-slate-900 text-white transition duration-300 hover:bg-slate-800 md:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.22, ease: easeOutCubic }}
                  >
                    <FiX className="text-[17px]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.22, ease: easeOutCubic }}
                  >
                    <FiMenu className="text-[17px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.26, ease: easeOutCubic }}
            className="fixed inset-0 z-20 bg-white backdrop-blur-xl md:hidden shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="container h-full flex flex-col pt-[88px] pb-7 overflow-y-auto" data-mobile-menu-scroll>
              <motion.nav
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
                }}
                className="flex flex-col"
              >
                {siteConfig.nav.items.map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOutCubic } },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-xl px-2 py-3.5 text-base font-bold text-slate-900 border-b border-slate-200 transition-colors duration-200 hover:bg-slate-50 active:bg-slate-100"
                    >
                      <span>{item.label}</span>
                      <FiChevronDown className="text-[11px] text-slate-400 transition group-hover:text-primary-600 group-hover:-translate-y-0.5" />
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  <Link
                    href={siteConfig.nav.cta.href}
                    onClick={() => setMenuOpen(false)}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent-500 px-5 text-[11px] font-bold uppercase text-white shadow-[0_12px_30px_rgba(249,73,16,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-600 active:scale-[0.98]"
                  >
                    {siteConfig.nav.cta.label}
                  </Link>
                </motion.div>
              </motion.nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.4 }}
                className="mt-auto pt-10 flex items-center justify-between text-xs font-bold uppercase text-slate-500"
              >
                <span>ACAV · Córdoba</span>
                <span>Asociación Cordobesa</span>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
