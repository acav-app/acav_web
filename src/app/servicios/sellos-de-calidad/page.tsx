import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiEye,
  FiUserCheck,
  FiUsers,
  FiVolume2,
} from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'

export const metadata: Metadata = {
  title: 'Proyecto Sellos de Calidad | ACAV',
  description:
    'Proyecto aprobado N° 437: acompañamiento de ACAV a las agencias de viajes y turismo de Córdoba para alcanzar los niveles plata y oro del Sello Federal de Calidad Turística.',
}

const instituciones = [
  {
    rol: 'Solicitante / Ejecutora',
    nombre: 'ACAV',
    detalle: 'Asociación Cordobesa de Agencias de Viajes',
    logos: ['/images/logo-azul.png'],
  },
  {
    rol: 'Co-financia',
    nombre: 'ADEC',
    detalle: 'Agencia para el Desarrollo Económico de Córdoba',
    logos: ['/images/adec.png'],
  },
  {
    rol: 'Otorgan los sellos',
    nombre: 'FAEVYT e INCATUR',
    detalle: 'Instituciones certificantes del Sello Federal de Calidad Turística',
    logos: ['/images/faevyt.png', '/images/incatur.png'],
  },
]

const componentes = [
  { Icon: FiClipboard, title: 'Diagnóstico', detail: 'Relevamiento de la situación actual de cada agencia.' },
  { Icon: FiEye, title: 'Sensibilización', detail: 'Instancias para comprender el alcance y valor del sello.' },
  { Icon: FiActivity, title: 'Capacitación', detail: 'Formación sobre procesos, gestión y mejora continua.' },
  { Icon: FiUserCheck, title: 'Asistencia técnica', detail: 'Acompañamiento experto en la implementación.' },
  { Icon: FiUsers, title: 'Mentorías', detail: 'Trabajo cercano y sostenido con cada empresa.' },
  { Icon: FiCheckCircle, title: 'Seguimiento', detail: 'Hitos y entregables parciales a lo largo del proceso.' },
  {
    Icon: FiVolume2,
    title: 'Visibilización',
    detail: 'Concientización a pasajeros y compradores en medios de Córdoba.',
  },
]

const alcance = [
  'Diagnosticar la situación actual de la empresa',
  'Identificar brechas respecto del estándar',
  'Mejorar procesos de gestión y calidad',
  'Avanzar concretamente hacia la acreditación',
]

const niveles = [
  {
    nombre: 'Bronce',
    numero: 1,
    descripcion:
      'Reconoce a las agencias que cumplen con los requisitos fundamentales del programa y demuestran compromiso con la mejora de sus procesos y servicios.',
    requisitos: ['Inscripción en RNAV', 'Inscripción en INCATUR', 'Curso Sello de Calidad'],
    anillo: 'from-[#c1642a] to-[#8a3f16]',
    pastilla: 'bg-[#c1642a]',
    badge: 'bg-[#e9a72c]',
  },
  {
    nombre: 'Plata',
    numero: 2,
    descripcion:
      'Distingue a las agencias que evidencian una gestión consolidada, procesos más desarrollados y una orientación sostenida hacia la calidad del servicio.',
    requisitos: ['Nivel bronce completo', 'Mínimo 6 pautas cumplidas', 'Evidencias validadas'],
    anillo: 'from-[#b4bfc2] to-[#7d8b90]',
    pastilla: 'bg-[#8f9ca1]',
    badge: 'bg-[#e9a72c]',
  },
  {
    nombre: 'Oro',
    numero: 3,
    descripcion:
      'Otorgado a agencias que alcanzan estándares de calidad en la experiencia brindada a los viajeros.',
    requisitos: [
      'Nivel bronce completo',
      '10 pautas cumplidas',
      'Evidencias validadas',
      'Verificación aprobada',
    ],
    anillo: 'from-[#f0c33c] to-[#c99411]',
    pastilla: 'bg-[#d5a520]',
    badge: 'bg-[#e9a72c]',
  },
]

export default function SellosDeCalidadPage() {
  return (
    <PageAnimation>
      {/* Encabezado */}
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14">
            <div>
              <p className="text-[11px] font-bold uppercase text-primary-600">Servicios · Proyecto aprobado</p>
              <h1 className="mt-3 text-[28px] font-bold leading-[1.1] text-slate-900 md:text-[38px]">
                Sellos de Calidad — Agencias de Turismo en Córdoba
              </h1>

              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[12px] font-bold uppercase text-emerald-700">
                <FiCheckCircle className="text-[14px]" />
                Proyecto N° 437 · Aprobado
              </p>

              <p className="mt-6 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Se aprobó recientemente el proyecto de acompañamiento a los Sellos de Calidad, impulsado a nivel
                federal, que busca fortalecer la competitividad ya profesionalización de las empresas de viajes y
                turismo de Córdoba mediante la implementación de un modelo de mejora de procesos de gestión y
                calidad creado ad hoc.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                El objetivo es que, en conjunto, podamos acompañar a las EVT a alcanzar los niveles{' '}
                <strong className="font-semibold text-slate-900">plata y oro</strong> del Sello Federal de Calidad
                Turística. Las agencias podrán ir haciendo el recorrido en conjunto y con asistencia de ACAV.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="mailto:info@acav.org.ar?subject=Proyecto%20Sellos%20de%20Calidad%20ACAV"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white shadow-[0_14px_32px_rgba(249,73,16,0.3)] transition hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  Quiero participar
                  <FiArrowRight />
                </Link>
                <Link
                  href="/socios"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-7 text-[11px] font-bold uppercase text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Ver socios verificados
                </Link>
              </div>
            </div>

            <div className="rounded-[26px] bg-[#04112e] p-8 text-white md:p-10">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-300">
                <FiAward className="text-[24px]" />
              </span>

              <p className="mt-6 text-[20px] font-bold leading-snug">
                Un camino conjunto hacia el Sello Federal de Calidad Turística.
              </p>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-start gap-3">
                  <FiCalendar className="mt-0.5 shrink-0 text-[16px] text-primary-300" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Duración</p>
                    <p className="mt-1 text-sm font-semibold">6 meses · agosto 2026 a enero 2027</p>
                    <p className="mt-1 text-[13px] leading-6 text-white/60">
                      Con hitos de seguimiento y entregables parciales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiAward className="mt-0.5 shrink-0 text-[16px] text-primary-300" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Meta</p>
                    <p className="mt-1 text-sm font-semibold">Niveles plata y oro del Sello Federal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instituciones */}
      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Instituciones</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Quiénes participan
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {instituciones.map(({ rol, nombre, detalle, logos }) => (
              <article
                key={rol}
                className="rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
              >
                <div className="flex h-12 items-center gap-5">
                  {logos.map((logo) => (
                    <Image
                      key={logo}
                      src={logo}
                      alt={nombre}
                      width={200}
                      height={64}
                      className="h-10 w-auto max-w-[130px] object-contain object-left"
                    />
                  ))}
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-wide text-slate-400">{rol}</p>
                <h3 className="mt-1.5 text-[18px] font-bold text-slate-900">{nombre}</h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-600">{detalle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Componentes */}
      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Qué contempla</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Componentes del programa
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {componentes.map(({ Icon, title, detail }) => (
              <article
                key={title}
                className="rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="text-[18px]" />
                </div>
                <h3 className="mt-5 text-[15px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-600">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* Niveles */}
      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Niveles</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Los tres sellos del programa
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {niveles.map((nivel) => (
              <article key={nivel.nombre} className="text-center">
                <div className="relative mx-auto w-fit">
                  <div
                    className={`flex size-[104px] items-center justify-center rounded-full bg-gradient-to-br ${nivel.anillo} p-[9px] shadow-[0_14px_32px_rgba(15,23,42,0.14)]`}
                  >
                    <span className="flex size-full items-center justify-center rounded-full bg-white">
                      <span className="flex size-[62px] items-center justify-center rounded-full bg-[#1c4b8f] text-white">
                        <FiCheck className="text-[26px]" strokeWidth={3} />
                      </span>
                    </span>
                  </div>

                  <span
                    className={`absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full ${nivel.badge} text-[13px] font-bold text-white ring-4 ring-white`}
                  >
                    {nivel.numero}
                  </span>
                </div>

                <p
                  className={`mx-auto mt-5 inline-flex h-8 items-center rounded-full px-6 text-[12px] font-bold uppercase tracking-wide text-white ${nivel.pastilla}`}
                >
                  {nivel.nombre}
                </p>

                <p className="mt-5 text-[14px] font-semibold leading-6 text-[#1c4b8f]">{nivel.descripcion}</p>

                <ul className="mx-auto mt-6 w-fit space-y-2.5 text-left">
                  {nivel.requisitos.map((requisito) => (
                    <li key={requisito} className="flex items-start gap-2.5 text-[13px] leading-6 text-slate-600">
                      <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary-500" />
                      {requisito}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
