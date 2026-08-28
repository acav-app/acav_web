'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiFacebook, FiHeart, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiPhone, FiYoutube } from 'react-icons/fi'

import { siteConfig } from '../config/site'

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
          className="grid gap-8 pb-section sm:gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8"
        >
          <motion.div variants={fadeUp}>
            <Image src="/images/logo.png" alt="ACAV" width={180} height={56} className="h-11 w-auto" />
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="mt-1 text-[14px] text-white/60" />
                <span>Obispo Trejo 180 Piso 4, Córdoba, Argentina, CP 5000</span>
              </div>
              <div className="flex items-start gap-2.5">
                <FiMail className="mt-1 text-[14px] text-white/60" />
                <a href="mailto:info@acav.org.ar" className="transition hover:text-white">
                  info@acav.org.ar
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <FiPhone className="mt-1 text-[14px] text-white/60" />
                <a href="tel:+543514224425" className="transition hover:text-white">
                  Tel/Fax: (0351) 422 4425
                </a>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-2.5">
              {[
                { href: '#', Icon: FiInstagram, label: 'Instagram' },
                { href: '#', Icon: FiFacebook, label: 'Facebook' },
                { href: '#', Icon: FiLinkedin, label: 'LinkedIn' },
                { href: '#', Icon: FiYoutube, label: 'YouTube' },
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

          <motion.div variants={fadeUp}>
            <p className="text-[11px] font-bold uppercase text-white/80">Navegación</p>
            <div className="mt-5 flex flex-col gap-2.5 text-sm text-white/70">
              <Link href="/#home" className="transition hover:text-white">Home</Link>
              <Link href="/institucional/quienes-somos" className="transition hover:text-white">Institucional</Link>
              <Link href="/socios" className="transition hover:text-white">Socios</Link>
              <Link href="/socios/asociate" className="transition hover:text-white">Asociate</Link>
              <Link href="/servicios/capacitaciones" className="transition hover:text-white">Servicios</Link>
              <Link href="/novedades/actualidad" className="transition hover:text-white">Novedades</Link>
              <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-[11px] font-bold uppercase text-white/80">Servicios</p>
            <div className="mt-5 flex flex-col gap-2.5 text-sm text-white/70">
              {siteConfig.servicios.links.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-[11px] font-bold uppercase text-white/80">Institucional</p>
            <div className="mt-5 flex flex-col gap-2.5 text-sm text-white/70">
              {siteConfig.institucional.links.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-[11px] font-bold uppercase text-white/80">Alianzas institucionales</p>
            <div className="mt-5 grid grid-cols-1 gap-2.5">
              {(siteConfig.contact.institutionalLogos ?? []).map((l) => (
                <a
                  key={l.label}
                  href={l.href ?? '#'}
                  className="inline-flex h-12 items-center justify-start rounded-xl border border-white/10 bg-white/5 px-4 transition hover:border-white/20 hover:bg-white/10"
                >
                  <Image src={l.src} alt={l.label} width={100} height={30} className="h-6 w-auto" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="h-px w-full bg-white/10" />

        <motion.div
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
        </motion.div>
      </motion.div>
    </footer>
  )
}
