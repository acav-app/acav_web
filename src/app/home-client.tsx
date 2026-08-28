'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/pagination'

import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiFlag,
  FiGlobe,
  FiHeadphones,
  FiHeart,
  FiMapPin,
  FiMail,
  FiPercent,
  FiPhone,
  FiPlay,
  FiSend,
  FiShoppingBag,
  FiUsers,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiFacebook,
  FiCalendar as FiCalendar2,
  FiTarget,
} from 'react-icons/fi'

import HeroBanner from './components/hero-banner'
import Navbar from './components/navbar'
import SiteFooter from './components/site-footer'
import ContactForm from './contacto/contact-form'
import { comisionPlana, iniciales } from './data/comision'
import { siteConfig } from './config/site'
import type { BannerSlide } from '@/lib/admin/types'

const statIcons = [FiAward, FiUsers, FiBookOpen, FiGlobe]

// -------- Framer variants ---------------------------------------------
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

export default function HomeClient({ slides }: { slides: BannerSlide[] }) {
  const communitySwiper = useRef<SwiperType | null>(null)

  return (
    <>
      <Navbar />

      <main className="bg-white pt-16 md:pt-[72px]">
        {/* =============================================================
           HERO
        ============================================================= */}
        <HeroBanner slides={slides} />

        {/* =============================================================
           STATS
        ============================================================= */}
        <section className="relative z-20 -mt-8 pb-section md:-mt-10 md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#092859_0%,#05153a_55%,#030c24_100%)] px-4 py-4 shadow-[0_22px_55px_rgba(2,6,23,0.45)] sm:px-5 sm:gap-2 md:px-6 md:grid-cols-4 md:gap-0 md:py-3.5 lg:px-6.5">
              {siteConfig.hero.stats.map((stat, index) => {
                const Icon = statIcons[index] ?? FiUsers

                return (
                  <div
                    key={stat.label}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-white transition hover:bg-white/5 sm:px-3.5 sm:py-3.5 md:px-4 md:py-3.5 lg:px-5 lg:py-4 ${
                      index < siteConfig.hero.stats.length - 1 ? 'md:border-b-0 md:border-r md:border-white/10' : ''
                    } ${index % 2 === 0 ? 'border-r border-white/10 md:border-r md:border-white/10' : ''} ${index < 2 ? 'border-b border-white/10 md:border-b-0' : ''}`}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/7 text-lg text-white transition group-hover:bg-white/12 sm:size-11 sm:text-xl">
                      <Icon />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-none sm:text-2xl">{stat.value}</p>
                      <p className="mt-1.5 text-[10px] font-bold uppercase text-white">{stat.label}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase text-white/60">{stat.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           ABOUT ACAV
        ============================================================= */}
        <section id="institucional" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <motion.div variants={staggerWrap} className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 w-full min-w-0 overflow-hidden">
              <motion.div variants={fadeUp} className="w-full min-w-0 overflow-hidden">
                <p className="w-full min-w-0 break-words text-[11px] font-bold uppercase text-primary-600">SOBRE ACAV</p>
                <h2 className="mt-4 w-full min-w-0 md:max-w-md text-[26px] font-bold leading-[1.1] text-slate-900 md:text-3xl break-words">
                  Trabajamos por el crecimiento y la profesionalización del sector turístico.
                </h2>
                <p className="mt-4 w-full min-w-0 md:max-w-lg text-sm leading-7 text-slate-600 break-words">
                  Desde 1963 representamos a las agencias de viajes, defendiendo sus intereses y generando herramientas, capacitaciones y beneficios exclusivos para que sigan creciendo.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3.5">
                  {[
                    { Icon: FiFlag, label: 'Representación' },
                    { Icon: FiBookOpen, label: 'Capacitación' },
                    { Icon: FiPercent, label: 'Beneficios' },
                    { Icon: FiUsers, label: 'Comunidad' },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
                        <Icon className="text-[18px]" />
                      </div>
                      <p className="w-full text-[10px] sm:text-[12px] font-bold uppercase text-slate-700 leading-snug break-words">{label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="#historia"
                  className="mt-7 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase text-primary-600 transition hover:text-primary-700"
                >
                  CONOCE MÁS SOBRE ACAV
                  <FiArrowRight className="text-[13px]" />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="w-full min-w-0 overflow-hidden">
                <div className="relative w-full min-w-0 overflow-hidden rounded-[26px] border border-slate-200 bg-slate-900 shadow-[0_22px_55px_rgba(15,23,42,0.1)]">
                  <Image
                    src="/images/sobre-acav-video.jpg"
                    alt="Sobre ACAV"
                    width={1200}
                    height={720}
                    className="h-[320px] w-full object-cover md:h-[420px]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,12,36,0.08)_0%,rgba(3,12,36,0.36)_52%,rgba(3,12,36,0.66)_100%)]" />

                  <div className="absolute left-5 top-5 md:left-6 md:top-6">
                    <Image
                      src="/images/logo.png"
                      alt="ACAV"
                      width={180}
                      height={56}
                      className="h-9 w-auto drop-shadow-lg"
                    />
                    <p className="mt-1.5 text-[10px] font-bold uppercase text-white/85">
                      Asociación Cordobesa de Agencias de Viajes
                    </p>
                  </div>

                  <div className="absolute inset-0 grid place-items-center">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex size-[84px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md md:size-[96px]"
                      aria-label="Reproducir video"
                    >
                      <span className="flex size-[56px] items-center justify-center rounded-full bg-white text-primary-600 shadow-[0_18px_40px_rgba(255,255,255,0.25)] md:size-[64px]">
                        <FiPlay className="ml-1 text-[20px] md:text-[22px]" />
                      </span>
                    </motion.button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* =============================================================
           PROJECTS ACAV
        ============================================================= */}
        <section id="servicios" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <div className="hidden sm:grid gap-4 md:gap-5 md:grid-cols-2 lg:gap-6">
              {[
                {
                  eyebrow: 'PLATAFORMA LABORAL',
                  title: 'Empleabilidad ACAV',
                  desc: 'Conectamos talento con oportunidades. Publicá búsquedas o postulate a la plataforma líder de empleo turístico en Córdoba.',
                  cta: 'EXPLORAR EMPLEOS',
                  metrics: [
                    { v: '120+', l: 'Ofertas activas' },
                    { v: '850+', l: 'Perfiles registrados' },
                    { v: '60+', l: 'Agencias conectadas' },
                  ],
                  gradient: 'from-[#0a2d69] via-[#082559] to-[#051a41]',
                  glow: 'from-primary-400/40 via-primary-600/20',
                  mock: '/images/placeholder.jpg',
                  alt: 'Empleabilidad ACAV',
                },
                {
                  eyebrow: 'CAMPUS EDUCATIVO',
                  title: 'Cursos ACAV',
                  desc: 'Capacitate docente y crecé profesionalmente. Accedé a cursos, certificaciones y talleres con beneficios exclusivos para socios.',
                  cta: 'VER CURSOS',
                  metrics: [
                    { v: '35+', l: 'Cursos disponibles' },
                    { v: '2000+', l: 'Alumnos capacitados' },
                    { v: '15+', l: 'Certificaciones' },
                  ],
                  gradient: 'from-[#ff7a2d] via-[#f85a16] to-[#e24a0b]',
                  glow: 'from-accent-400/40 via-accent-600/20',
                  mock: '/images/placeholder.jpg',
                  alt: 'Cursos ACAV',
                },
              ].map((p) => (
                <article
                  key={p.title}
                  className={`relative isolate overflow-hidden rounded-[24px] border border-slate-900/10 bg-gradient-to-br ${p.gradient} px-5 pb-6 pt-6 text-white shadow-[0_24px_60px_rgba(6,28,74,0.28)] sm:px-6 sm:pt-7 md:px-7 md:pb-7 md:pt-8`}
                >
                  <div className="relative z-10 max-w-full sm:max-w-[52%]">
                    <p className="text-[10px] font-bold uppercase text-white/70">{p.eyebrow}</p>
                    <h3 className="mt-2.5 text-[22px] font-bold leading-[1.1] md:text-[28px]">{p.title}</h3>
                    <p className="mt-3 text-[13px] leading-6 text-white/85 md:text-sm md:leading-7">{p.desc}</p>
                    <Link
                      href="#"
                      className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-[11px] font-bold uppercase text-white ring-1 ring-inset ring-white/15 transition duration-300 hover:bg-white/15"
                    >
                      {p.cta}
                      <FiArrowRight className="text-[12px]" />
                    </Link>

                    <div className="mt-7 grid max-w-xs grid-cols-3 gap-3 border-t border-white/10 pt-4 sm:mt-8 sm:pt-5">
                      {p.metrics.map((m) => (
                        <div key={m.l}>
                          <p className="text-[18px] font-bold leading-none md:text-xl">{m.v}</p>
                          <p className="mt-1.5 text-[10px] font-bold uppercase text-white/75 leading-5">{m.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -bottom-4 left-1/2 z-0 w-[82%] -translate-x-1/2 sm:-bottom-6 sm:-translate-x-0 sm:left-auto sm:right-0 sm:top-8 sm:w-[58%] md:-right-6 md:top-10">
                    <div className="relative">
                      <div className={`absolute -inset-6 rounded-[32px] bg-gradient-to-br ${p.glow} to-transparent blur-2xl`} />
                      <Image
                        src={p.mock}
                        alt={p.alt}
                        width={900}
                        height={620}
                        unoptimized
                        className="relative rounded-t-[16px] sm:rounded-t-[18px] translate-x-1 translate-y-1 shadow-[0_24px_60px_rgba(2,6,23,0.35)]"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile: automatic slider minimalista */}
            <div className="sm:hidden w-full min-w-0 overflow-hidden">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 3600, disableOnInteraction: false }}
                pagination={{ clickable: true, el: '#projects-pagination' }}
                speed={650}
                loop
                spaceBetween={12}
                className="projects-slider"
              >
                {[
                  {
                    eyebrow: 'PLATAFORMA LABORAL',
                    title: 'Empleabilidad ACAV',
                    desc: 'Conectamos talento con oportunidades.',
                    cta: 'EXPLORAR EMPLEOS',
                    metrics: [
                      { v: '120+', l: 'Ofertas activas' },
                      { v: '850+', l: 'Perfiles registrados' },
                      { v: '60+', l: 'Agencias conectadas' },
                    ],
                    gradient: 'from-[#0a2d69] via-[#082559] to-[#051a41]',
                    glow: 'from-primary-400/40 via-primary-600/20',
                    mock: '/images/placeholder.jpg',
                    alt: 'Empleabilidad ACAV',
                  },
                  {
                    eyebrow: 'CAMPUS EDUCATIVO',
                    title: 'Cursos ACAV',
                    desc: 'Capacitate docente y crecé profesionalmente.',
                    cta: 'VER CURSOS',
                    metrics: [
                      { v: '35+', l: 'Cursos disponibles' },
                      { v: '2000+', l: 'Alumnos capacitados' },
                      { v: '15+', l: 'Certificaciones' },
                    ],
                    gradient: 'from-[#ff7a2d] via-[#f85a16] to-[#e24a0b]',
                    glow: 'from-accent-400/40 via-accent-600/20',
                    mock: '/images/placeholder.jpg',
                    alt: 'Cursos ACAV',
                  },
                ].map((p) => (
                  <SwiperSlide key={p.title}>
                    <article
                      className={`relative isolate overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br ${p.gradient} px-5 pb-6 pt-6 text-white`}
                    >
                      <p className="text-[10px] font-bold uppercase text-white/70">{p.eyebrow}</p>
                      <h3 className="mt-2 text-2xl font-bold leading-[1.1]">{p.title}</h3>
                      <p className="mt-2.5 text-sm leading-7 text-white/85">{p.desc}</p>

                      <div className="relative mt-5 h-[170px] w-full overflow-hidden rounded-[18px] bg-white/5 shadow-[0_18px_50px_rgba(2,6,23,0.25)]">
                        <div className={`absolute -inset-6 rounded-[32px] bg-gradient-to-br ${p.glow} to-transparent blur-2xl`} />
                        <Image
                          src={p.mock}
                          alt={p.alt}
                          fill
                          unoptimized
                          className="object-contain object-bottom"
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                        {p.metrics.map((m) => (
                          <div key={m.l}>
                            <p className="text-lg font-bold leading-none">{m.v}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase text-white/75 leading-5">{m.l}</p>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="#"
                        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-[11px] font-bold uppercase text-white ring-1 ring-inset ring-white/15"
                      >
                        {p.cta}
                        <FiArrowRight className="text-[12px]" />
                      </Link>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div id="projects-pagination" className="mt-4 flex justify-center" />
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           BENEFICIOS
        ============================================================= */}
        <section id="socios" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
              <div className="max-w-md">
                <p className="text-[11px] font-bold uppercase text-primary-600">BENEFICIOS PARA SOCIOS</p>
                <h2 className="mt-4 text-[26px] font-bold leading-[1.1] text-slate-900 md:text-[30px]">
                  Más beneficios, más oportunidades.
                </h2>
                <Link
                  href="/servicios/convenios-y-beneficios"
                  className="mt-5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase text-primary-600 transition hover:text-primary-700 md:mt-6"
                >
                  VER TODOS LOS BENEFICIOS
                  <FiArrowRight className="text-[13px]" />
                </Link>
              </div>

              {/* Desktop grid */}
              <div className="hidden flex-1 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7 lg:grid">
                {[
                  { label: 'Descuentos exclusivos', active: true, Icon: FiPercent },
                  { label: 'Capacitaciones y eventos', Icon: FiBookOpen },
                  { label: 'Asesoramiento profesional', Icon: FiHeadphones },
                  { label: 'Networking y vinculación', Icon: FiUsers },
                  { label: 'Comercio y alianzas', Icon: FiGlobe },
                  { label: 'Registro y beneficios', Icon: FiShoppingBag },
                  { label: 'Workshops y experiencias', Icon: FiCalendar },
                ].map(({ Icon, label, active }) => (
                  <div
                    key={label}
                    className={`group relative flex flex-col items-center gap-2.5 rounded-2xl border px-3 py-4 text-center transition duration-300 hover:-translate-y-0.5 ${
                      active
                        ? 'border-primary-200 bg-primary-50/60 shadow-[0_12px_30px_rgba(0,136,216,0.12)]'
                        : 'border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)] hover:border-slate-300'
                    }`}
                  >
                    {active ? (
                      <span className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-accent-500 ring-2 ring-white" />
                    ) : null}
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl transition ${
                        active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="text-[18px]" />
                    </div>
                    <p className="text-[10.5px] font-bold uppercase leading-5 text-slate-700">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile benefits slider */}
            <div className="mt-8 sm:hidden w-full min-w-0 overflow-hidden">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 2800, disableOnInteraction: false }}
                speed={550}
                loop
                spaceBetween={12}
                slidesPerView={2.3}
                pagination={{ clickable: true, el: '#benefits-icons-pagination' }}
              >
                {[
                  { label: 'Descuentos exclusivos', active: true, Icon: FiPercent },
                  { label: 'Capacitaciones y eventos', Icon: FiBookOpen },
                  { label: 'Asesoramiento profesional', Icon: FiHeadphones },
                  { label: 'Networking y vinculación', Icon: FiUsers },
                  { label: 'Comercio y alianzas', Icon: FiGlobe },
                  { label: 'Registro y beneficios', Icon: FiShoppingBag },
                  { label: 'Workshops y experiencias', Icon: FiCalendar },
                ].map(({ Icon, label, active }) => (
                  <SwiperSlide key={label}>
                    <div
                      className={`group relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center ${
                        active
                          ? 'border-primary-200 bg-primary-50/60 shadow-[0_12px_30px_rgba(0,136,216,0.12)]'
                          : 'border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)]'
                      }`}
                    >
                      {active ? (
                        <span className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-accent-500 ring-2 ring-white" />
                      ) : null}
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl ${
                          active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Icon className="text-[17px]" />
                      </div>
                      <p className="text-[10.5px] font-bold uppercase leading-5 text-slate-700">{label}</p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div id="benefits-icons-pagination" className="mt-3 flex justify-center" />
            </div>

            <div className="relative mt-8 md:mt-10">
              <div className="grid gap-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-5 md:px-7 md:py-6 min-w-0">
                <div className="relative h-[220px] overflow-hidden rounded-[22px] sm:h-[260px] md:h-full">
                  <Image
                    src="/images/benefits/placeholder.jpg"
                    alt="Descuentos exclusivos"
                    width={960}
                    height={540}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.18)_50%,rgba(15,23,42,0.38)_100%)]" />
                </div>

                <div className="flex flex-col justify-center rounded-[22px] border border-slate-100 bg-slate-50/50 px-4 py-5 sm:px-5 sm:py-6 md:p-8">
                  <h3 className="text-lg font-bold text-slate-900 md:text-xl">Descuentos exclusivos</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Accedé a descuentos y condiciones preferenciales en hoteles, aerolíneas, asistencia al viajero y mucho más.
                  </p>
                  <Link
                    href="#"
                    className="mt-5 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-[11px] font-bold uppercase text-white transition duration-300 hover:bg-slate-800"
                  >
                    VER BENEFICIOS
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           COMMUNITY SLIDER (mobile auto + desktop horizontal Swiper)
        ============================================================= */}
        <section id="eventos" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[11px] font-bold uppercase text-primary-600">
                ASÍ VIVE LA COMUNIDAD ACAV
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase text-primary-600 transition hover:text-primary-700"
              >
                VER MÁS EN REDES
                <FiArrowRight className="text-[13px]" />
              </Link>
            </div>

            <div className="relative mt-7 md:mt-8 w-full min-w-0 overflow-hidden">
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 3200, disableOnInteraction: false }}
                loop
                speed={650}
                spaceBetween={14}
                slidesPerView={1.2}
                breakpoints={{
                  480: { slidesPerView: 1.7 },
                  768: { slidesPerView: 2.6, spaceBetween: 18 },
                  1024: { slidesPerView: 3.6, spaceBetween: 20 },
                  1280: { slidesPerView: 4.4, spaceBetween: 22 },
                }}
                onSwiper={(s) => (communitySwiper.current = s)}
              >
                {[
                  { title: 'Convención anual', fecha: '20 Nov 2024', img: '/images/placeholder.jpg' },
                  { title: 'Workshop ACAV', fecha: '12 Oct 2024', img: '/images/placeholder.jpg' },
                  { title: 'Destinos Córdoba', fecha: '08 Sep 2024', img: '/images/placeholder.jpg' },
                  { title: 'Capacitación', fecha: '24 Ago 2024', img: '/images/placeholder.jpg' },
                  { title: 'Marketing Turístico', fecha: '15 Jul 2024', img: '/images/placeholder.jpg' },
                  { title: 'Workshop ventas', fecha: '02 Jul 2024', img: '/images/placeholder.jpg' },
                ].map((item, i) => (
                  <SwiperSlide key={i}>
                    <article className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 70vw, 24vw"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.16)_40%,rgba(2,6,23,0.82)_100%)]" />

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="absolute left-4 top-4"
                        >
                          <span className="flex size-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md">
                            <FiPlay className="ml-0.5 text-[14px]" />
                          </span>
                        </motion.div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-white/85">
                            <FiCalendar2 className="text-[12px]" />
                            {item.fecha}
                          </div>
                          <p className="mt-2 text-[13px] font-bold leading-5 text-white">{item.title}</p>
                        </div>
                      </div>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           HISTORY (mobile slider / desktop grid)
        ============================================================= */}
        <section id="historia" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <div className="relative overflow-hidden rounded-[28px] md:rounded-[32px] bg-[linear-gradient(135deg,#0a2e6d_0%,#071f4e_45%,#040f2d_100%)] px-5 pb-8 pt-8 text-white shadow-[0_30px_70px_rgba(4,15,45,0.35)] md:px-10 md:pb-12 md:pt-12">
              <div className="mb-10 max-w-lg md:mb-14">
                <p className="text-[11px] font-bold uppercase text-primary-200">NUESTRA HISTORIA</p>
                <h2 className="mt-4 text-[26px] font-bold leading-[1.1] md:text-[32px]">
                  Más de 60 años impulsando el turismo
                </h2>
              </div>

              {/* Desktop timeline grid */}
              <div className="relative mx-auto hidden sm:block">
                <div className="absolute left-0 right-0 top-10 h-px bg-white/15" />
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
                  {[
                    { year: '1963', title: 'Fundación de ACAV', img: '/images/placeholder.jpg' },
                    { year: '1975', title: '1ra Convención institucional', img: '/images/placeholder.jpg' },
                    { year: '1995', title: 'Premios estatutos y beneficios', img: '/images/placeholder.jpg' },
                    { year: '2010', title: 'Capacitaciones y formación', img: '/images/placeholder.jpg' },
                    { year: '2020', title: 'Transformación digital', img: '/images/placeholder.jpg' },
                    { year: 'Actualidad', title: 'Una comunidad que sigue creciendo', img: '/images/placeholder.jpg' },
                  ].map((h, i) => (
                    <div key={h.year} className="relative flex flex-col items-start gap-4 md:items-center md:text-center">
                      <div className="relative z-10 flex size-9 items-center justify-center rounded-full border-2 border-white/30 bg-[#071f4e] text-white ring-4 ring-[#0a2e6d] md:size-10">
                        <span className="size-1.5 rounded-full bg-primary-400" />
                      </div>

                      <div className="w-full md:flex md:flex-col md:items-center">
                        <p className="text-sm font-bold uppercase text-white/90 md:text-[13px]">{h.year}</p>
                        <p className="mt-1.5 text-[12px] font-semibold leading-5 text-white/75 md:max-w-[150px]">
                          {h.title}
                        </p>
                        <div className="mt-3 w-full overflow-hidden rounded-[14px] border border-white/10 bg-white/5 shadow-[0_12px_28px_rgba(2,6,23,0.35)]">
                          <Image
                            src={h.img}
                            alt={h.title}
                            width={240}
                            height={160}
                            className="h-[130px] md:h-[110px] w-full object-cover grayscale transition duration-500 hover:grayscale-0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile history slider */}
              <div className="sm:hidden w-full min-w-0 overflow-hidden">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  loop
                  spaceBetween={14}
                  slidesPerView={1.1}
                  speed={650}
                  pagination={{ clickable: true, el: '#history-pagination' }}
                >
                  {[
                    { year: '1963', title: 'Fundación de ACAV', img: '/images/placeholder.jpg' },
                    { year: '1975', title: '1ra Convención institucional', img: '/images/placeholder.jpg' },
                    { year: '1995', title: 'Premios estatutos y beneficios', img: '/images/placeholder.jpg' },
                    { year: '2010', title: 'Capacitaciones y formación', img: '/images/placeholder.jpg' },
                    { year: '2020', title: 'Transformación digital', img: '/images/placeholder.jpg' },
                    { year: 'Actualidad', title: 'Una comunidad que sigue creciendo', img: '/images/placeholder.jpg' },
                  ].map((h, i) => (
                    <SwiperSlide key={h.year + i}>
                      <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-9 items-center justify-center rounded-full border-2 border-white/30 bg-[#071f4e] ring-4 ring-[#0a2e6d]">
                            <span className="size-1.5 rounded-full bg-primary-400" />
                          </span>
                          <div>
                            <p className="text-sm font-bold uppercase text-white/90">{h.year}</p>
                            <p className="text-[12px] font-semibold leading-5 text-white/75">{h.title}</p>
                          </div>
                        </div>
                        <div className="relative mt-4 h-[150px] w-full overflow-hidden rounded-[16px] bg-slate-900">
                          <Image
                            src={h.img}
                            alt={h.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div id="history-pagination" className="mt-4 flex justify-center" />
              </div>

              <div className="mt-10 flex justify-center md:mt-14">
                <Link
                  href="#"
                  className="relative -mb-8 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-6 text-[11px] font-bold uppercase text-white backdrop-blur-md transition duration-300 hover:bg-slate-900/80 md:-mb-12"
                >
                  CONOCE TODA NUESTRA HISTORIA
                  <FiArrowRight className="text-[13px]" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           BOARD (mobile slider)
        ============================================================= */}
        <section id="comision" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <p className="text-[11px] font-bold uppercase text-primary-600">
              COMISIÓN DIRECTIVA 2025 - 2026
            </p>

            <div className="relative mt-7 md:mt-8 w-full min-w-0 overflow-hidden">
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop
                speed={650}
                spaceBetween={14}
                slidesPerView={2.3}
                breakpoints={{
                  480: { slidesPerView: 3 },
                  768: { slidesPerView: 4, spaceBetween: 18 },
                  1024: { slidesPerView: 6, spaceBetween: 20 },
                  1280: { slidesPerView: 7.5, spaceBetween: 22 },
                }}
              >
                {comisionPlana.map((member, idx) => (
                  <SwiperSlide key={`${member.cargo}-${member.nombre}-${idx}`}>
                    <article className="rounded-[22px] border border-slate-200 bg-white px-3 pb-4 pt-3 text-center shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5">
                      <div className="relative mx-auto size-[96px] overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.12)] md:size-[108px]">
                        {member.foto ? (
                          <Image
                            src={member.foto}
                            alt={member.nombre}
                            fill
                            sizes="108px"
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[22px] font-extrabold text-slate-300">
                            {iniciales(member.nombre)}
                          </span>
                        )}
                      </div>
                      <p className="mt-4 text-[10.5px] font-bold uppercase text-primary-600">{member.cargo}</p>
                      <p className="mt-2 text-sm font-bold leading-5 text-slate-900">{member.nombre}</p>
                      <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{member.grupo}</p>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           JOIN (mobile slider 4 steps / desktop 2 cols horizontal)
        ============================================================= */}
        <section id="asociate" className="pb-section md:pb-section-lg">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportTrigger}
            variants={sectionReveal}
            className="container"
          >
            <div className="grid gap-7 rounded-[24px] md:rounded-[28px] border border-slate-200 bg-slate-50/70 px-4 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] overflow-hidden sm:px-5 sm:py-7 md:gap-10 md:px-10 md:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-12">
              <div className="w-full min-w-0">
                <p className="text-[11px] font-bold uppercase text-primary-600">ASOCIATE A ACAV</p>
                <h2 className="mt-4 max-w-md text-[26px] font-bold leading-[1.1] text-slate-900 md:text-[30px]">
                  Sumate a nuestra comunidad y potenciá tu agencia.
                </h2>
                <Link
                  href="#"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_14px_32px_rgba(249,73,16,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  COMENZAR AHORA
                  <FiArrowRight className="text-[13px]" />
                </Link>
              </div>

              <div className="w-full min-w-0 overflow-hidden">
                <div className="relative hidden md:block w-full min-w-0 overflow-hidden">
                  <div className="absolute left-6 right-6 top-[30px] h-[3px] rounded-full bg-slate-200">
                    <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-300" />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-3.5 w-full min-w-0">
                    {[
                      { n: '01', title: 'Requisitos', desc: 'Conocé los requisitos para asociarte.', Icon: FiCheckCircle },
                      { n: '02', title: 'Beneficios', desc: 'Descubrí todo lo que podés obtener.', Icon: FiTarget },
                      { n: '03', title: 'Documentación', desc: 'Encontrá qué documentación debés presentar.', Icon: FiFileText },
                      { n: '04', title: 'Contacto', desc: 'Completá el formulario y envía tu solicitud.', Icon: FiSend },
                    ].map(({ n, title, desc, Icon }) => (
                      <div
                        key={n}
                        className="relative z-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] w-full min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[18px] font-extrabold leading-none text-primary-600">{n}</span>
                          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                            <Icon className="text-[16px]" />
                          </div>
                        </div>
                        <p className="mt-4 text-[12px] font-bold uppercase text-slate-900">{title}</p>
                        <p className="mt-2 text-[12.5px] leading-6 text-slate-600">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: slider de pasos */}
                <div className="md:hidden w-full min-w-0 overflow-hidden">
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    autoplay={{ delay: 4200, disableOnInteraction: false }}
                    loop
                    spaceBetween={12}
                    slidesPerView={1.15}
                    speed={600}
                    pagination={{ clickable: true, el: '#join-pagination' }}
                  >
                    {[
                      { n: '01', title: 'Requisitos', desc: 'Conocé los requisitos para asociarte.', Icon: FiCheckCircle },
                      { n: '02', title: 'Beneficios', desc: 'Descubrí todo lo que podés obtener.', Icon: FiTarget },
                      { n: '03', title: 'Documentación', desc: 'Qué documentación debés presentar.', Icon: FiFileText },
                      { n: '04', title: 'Contacto', desc: 'Completá el formulario y envía tu solicitud.', Icon: FiSend },
                    ].map(({ n, title, desc, Icon }) => (
                      <SwiperSlide key={n}>
                        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] w-full min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[20px] font-extrabold leading-none text-primary-600">{n}</span>
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                              <Icon className="text-[17px]" />
                            </div>
                          </div>
                          <p className="mt-5 text-[13px] font-bold uppercase text-slate-900">{title}</p>
                          <p className="mt-2 text-[13px] leading-6 text-slate-600">{desc}</p>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div id="join-pagination" className="mt-4 flex justify-center" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =============================================================
           CONTACTO (Sección Minimalista antes del Footer)
        ============================================================= */}
        <section id="contacto" className="py-section md:py-section-lg bg-slate-50/50">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16 xl:gap-20 items-stretch">
              {/* Columna Izquierda: Mensaje y Datos de contacto */}
              <div className="flex flex-col justify-between gap-10">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600">Contacto</p>
                  <h2 className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-slate-900 md:text-[42px]">
                    Hablemos
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-slate-600 md:text-[15px] md:leading-8 max-w-lg">
                    Escribinos, llamanos o acercate a nuestra sede en el centro de Córdoba. Estamos para acompañar a las agencias de la provincia y potenciar el sector.
                  </p>

                  <div className="mt-10 space-y-6">
                    {[
                      { Icon: FiMapPin, label: 'Dirección', value: 'Obispo Trejo 180 Piso 4, Córdoba, Argentina, CP 5000', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Obispo Trejo 180 Piso 4, Córdoba, Argentina, CP 5000')}` },
                      { Icon: FiMail, label: 'Email', value: 'info@acav.org.ar', href: 'mailto:info@acav.org.ar' },
                      { Icon: FiPhone, label: 'Tel / Fax', value: '(0351) 422 4425', href: 'tel:+543514224425' },
                      { Icon: FiCalendar, label: 'Atención', value: 'Lunes a viernes de 9 a 17 h', href: null },
                    ].map(({ Icon, label, value, href }) => (
                      <div key={label} className="flex gap-4 group">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-primary-500 transition group-hover:text-primary-600">
                          <Icon className="text-[17px]" />
                        </div>
                        <div className="min-w-0 text-left">
                          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h2>
                          <div className="mt-1 text-sm font-semibold text-slate-800 break-words">
                            {href ? (
                              <a
                                href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="transition hover:text-primary-600"
                              >
                                {value}
                              </a>
                            ) : (
                              value
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Formulario Minimalista */}
              <div className="flex flex-col justify-center rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 text-left">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary-500">¿Tienes dudas?</p>
                  <h2 className="mt-1.5 text-xl font-extrabold text-slate-900 md:text-2xl">Enviá un mensaje</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Dejanos tu consulta y nos pondremos en contacto a la brevedad.
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================
           FOOTER
        ============================================================= */}
        <SiteFooter />
      </main>
    </>
  )
}
