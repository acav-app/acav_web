'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { FiArrowRight, FiPlay } from 'react-icons/fi'

import { siteConfig } from '../config/site'
import type { BannerSlide } from '@/lib/admin/types'

const easeOutCubic = [0.22, 1, 0.36, 1] as const
const AUTOPLAY_MS = 8000

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutCubic } },
}

const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
}

/** Se usa cuando todavía no hay slides cargados desde el panel. */
const slideFallback: BannerSlide = {
  id: 'fallback',
  titulo: siteConfig.hero.headline,
  subtitulo: siteConfig.hero.subheadline,
  tipo: 'video',
  media: siteConfig.hero.video.src,
  poster: siteConfig.hero.video.poster,
  ctaPrimario: { label: 'Sumate a ACAV', href: '/socios/asociate' },
  ctaSecundario: { label: 'Asociate', href: '/socios' },
  orden: 0,
  activo: true,
  createdAt: null,
  updatedAt: null,
}

function Media({ slide }: { slide: BannerSlide }) {
  if (slide.tipo === 'video') {
    return (
      <video
        key={slide.media}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={slide.poster || undefined}
      >
        <source src={slide.media} />
      </video>
    )
  }

  return (
    // Los archivos viven en R2; se sirven sin el optimizador de Next.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={slide.media} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
  )
}

export default function HeroBanner({ slides }: { slides: BannerSlide[] }) {
  const items = slides.length > 0 ? slides : [slideFallback]
  const [index, setIndex] = useState(0)

  const activo = items[Math.min(index, items.length - 1)]

  const goTo = useCallback((next: number) => setIndex(next), [])

  useEffect(() => {
    if (items.length < 2) return
    const timer = window.setInterval(() => setIndex((prev) => (prev + 1) % items.length), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [items.length])

  return (
    <section
      id="home"
      className="relative flex min-h-[640px] items-center overflow-hidden bg-slate-900 text-white md:min-h-[720px]"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={activo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: easeOutCubic }}
          className="absolute inset-0"
        >
          <Media slide={activo} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.78)_48%,rgba(2,6,23,0.56)_72%,rgba(2,6,23,0.8)_100%)]" />

      <div className="container relative z-10 w-full py-section md:py-section-lg">
        <motion.div
          key={`texto-${activo.id}`}
          initial="hidden"
          animate="show"
          variants={staggerWrap}
          className={`grid items-start gap-8 md:gap-10 ${
            items.length > 1 ? 'lg:grid-cols-[minmax(0,1.15fr)_220px]' : ''
          }`}
        >
          <div className="max-w-3xl">
            <motion.h1
              variants={fadeUp}
              className="max-w-[520px] text-[34px] font-bold leading-[1.04] text-white sm:max-w-[620px] sm:text-[38px] md:max-w-[640px] md:text-[44px] lg:max-w-[780px] lg:text-[56px]"
            >
              {activo.titulo}
            </motion.h1>

            {activo.subtitulo ? (
              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-lg text-sm leading-6 text-white/86 md:mt-5 md:max-w-xl md:text-base md:leading-8"
              >
                {activo.subtitulo}
              </motion.p>
            ) : null}

            <motion.div
              variants={staggerWrap}
              className="mt-6 flex flex-wrap items-center gap-3 md:mt-8 md:gap-3.5"
            >
              {activo.ctaPrimario.label && activo.ctaPrimario.href ? (
                <motion.div variants={fadeUp}>
                  <Link
                    href={activo.ctaPrimario.href}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_14px_30px_rgba(249,73,16,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-600"
                  >
                    {activo.ctaPrimario.label}
                    <FiArrowRight className="text-[13px]" />
                  </Link>
                </motion.div>
              ) : null}

              {activo.ctaSecundario.label && activo.ctaSecundario.href ? (
                <motion.div variants={fadeUp}>
                  <Link
                    href={activo.ctaSecundario.href}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/35 px-6 text-[11px] font-bold uppercase text-white transition duration-300 hover:border-white/60 hover:bg-white/10"
                  >
                    {activo.ctaSecundario.label}
                  </Link>
                </motion.div>
              ) : null}
            </motion.div>
          </div>

          {items.length > 1 ? (
            <motion.div variants={fadeUp} className="justify-center md:flex md:justify-start lg:justify-end">
              <div className="mx-auto w-full max-w-[300px] md:mx-0 md:max-w-[240px]">
                <div className="grid grid-cols-4 gap-2 md:grid-cols-2 md:gap-2.5 lg:grid-cols-1 lg:gap-2.5">
                  {items.slice(0, 4).map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Ver: ${slide.titulo}`}
                      aria-current={i === index}
                      className={`group relative h-[74px] w-full overflow-hidden rounded-[12px] border bg-slate-900/40 shadow-[0_10px_24px_rgba(2,6,23,0.35)] transition sm:h-[86px] md:h-[106px] md:rounded-[14px] lg:h-[96px] ${
                        i === index ? 'border-white/70' : 'border-white/15 hover:border-white/40'
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${slide.poster || slide.media})` }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(2,6,23,0.72))]" />

                      {slide.tipo === 'video' ? (
                        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white text-slate-900 shadow-md md:right-2.5 md:top-2.5 md:size-7">
                          <FiPlay className="ml-0.5 text-[10px] md:text-[11px]" />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}
