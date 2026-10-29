'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiFacebook, FiHeart, FiInstagram, FiLinkedin, FiMapPin, FiYoutube } from 'react-icons/fi'

import { siteConfig } from '../config/site'
import { AssociationCtaLink } from './association-cta'

const easeOutCubic = [0.22, 1, 0.36, 1] as const

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutCubic } },
}

const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutCubic } },
}

const viewportTrigger = { once: true, margin: '-40px 0px -10% 0px' }

const associationNavGroup = siteConfig.nav.items.find((item) =>
  item.children?.some((child) => child.href === siteConfig.nav.cta.href),
)

const footerNavColumns = Array.from(
  { length: Math.ceil(siteConfig.nav.items.length / 2) },
  (_, columnIndex) => siteConfig.nav.items.slice(columnIndex * 2, columnIndex * 2 + 2),
)

export default function SiteFooter() {
  return (
    <footer className="bg-[#04112e] pt-section text-white">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportTrigger}
        variants={sectionReveal}
        className="container"
      >
        <motion.div
          variants={staggerWrap}
          className="grid gap-10 pb-section lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-12"
        >
          <motion.div variants={fadeUp}>
            <Image src="/images/logo.png" alt="ACAV" width={180} height={56} className="h-11 w-auto" />
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="mt-1 text-[14px] text-white/60" />
                <span>{siteConfig.contact.address}</span>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-2.5">
              {[
                { href: 'https://www.instagram.com/acavoficial/', Icon: FiInstagram, label: 'Instagram' },
                { href: 'https://www.facebook.com/acav.cba/', Icon: FiFacebook, label: 'Facebook' },
                { href: 'https://www.linkedin.com/company/asociaci%C3%B3n-cordobesa-de-agencias-de-viajes/', Icon: FiLinkedin, label: 'LinkedIn' },
                { href: 'https://www.youtube.com/@ACAVok', Icon: FiYoutube, label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition duration-300 hover:border-primary-200 hover:bg-white/10 hover:text-white"
                >
                  <s.Icon className="text-[14px]" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.nav
            variants={staggerWrap}
            aria-label="Navegación del pie de página"
            className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-8 xs:grid-cols-2 xl:grid-cols-3"
          >
            {footerNavColumns.map((column, columnIndex) => (
              <motion.div
                key={columnIndex}
                variants={fadeUp}
                className="flex min-w-0 flex-col gap-7"
              >
                {column.map((item) => (
                  <div key={item.href} className="min-w-0">
                    <Link
                      href={item.href}
                      className="text-[11px] font-bold uppercase text-white/80 transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <div className="mt-3 flex flex-col items-start gap-2.5 text-sm text-white/70">
                        {item.children
                          .filter(
                            (child) =>
                              !(child.href === item.href && child.label === item.label) &&
                              child.href !== siteConfig.nav.cta.href,
                          )
                          .map((child) => (
                            <Link key={child.href} href={child.href} className="transition hover:text-white">
                              {child.label}
                            </Link>
                          ))}
                        {associationNavGroup === item ? (
                          <AssociationCtaLink className="mt-1 inline-flex h-9 items-center justify-center rounded-full bg-accent-500 px-4 text-[11px] font-bold uppercase text-white shadow-[0_8px_20px_rgba(249,73,16,0.22)] transition hover:-translate-y-0.5 hover:bg-accent-600">
                            {siteConfig.nav.cta.label}
                          </AssociationCtaLink>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}

                {!associationNavGroup && columnIndex === footerNavColumns.length - 1 ? (
                  <AssociationCtaLink className="inline-flex h-9 w-fit items-center justify-center rounded-full bg-accent-500 px-4 text-[11px] font-bold uppercase text-white shadow-[0_8px_20px_rgba(249,73,16,0.22)] transition hover:-translate-y-0.5 hover:bg-accent-600">
                    {siteConfig.nav.cta.label}
                  </AssociationCtaLink>
                ) : null}
              </motion.div>
            ))}
          </motion.nav>
        </motion.div>

        <div className="h-px w-full bg-white/10" />

        {/* <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportTrigger}
          className="flex flex-col gap-2.5 py-5 text-[11px] font-bold uppercase text-white/55 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {new Date().getFullYear()} ACAV — Asociación Cordobesa de Agencias de Viajes. Todos los derechos
            reservados.
          </p>
          <p className="inline-flex items-center gap-2">
            Hecho con
            <FiHeart className="text-accent-500" />
            en Córdoba, Argentina
          </p>
        </motion.div> */}
      </motion.div>
    </footer>
  )
}
