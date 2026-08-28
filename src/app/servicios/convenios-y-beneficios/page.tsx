import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiGlobe,
  FiHeadphones,
  FiHome,
  FiPercent,
  FiShoppingBag,
  FiStar,
  FiUsers,
} from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'

export const metadata: Metadata = {
  title: 'Convenios y Beneficios | ACAV',
  description:
    'Descuentos exclusivos, convenios institucionales, capacitaciones, asesoramiento y networking para las agencias asociadas a ACAV.',
}

const beneficios = [
  {
    Icon: FiPercent,
    title: 'Descuentos exclusivos',
    detail: 'Condiciones preferenciales en hoteles, aerolíneas, asistencia al viajero y más.',
    destacado: true,
  },
  {
    Icon: FiBookOpen,
    title: 'Capacitaciones y eventos',
    detail: 'Formación continua y una agenda activa durante todo el año.',
  },
  {
    Icon: FiHeadphones,
    title: 'Asesoramiento profesional',
    detail: 'Acompañamiento normativo, legal y comercial para tu agencia.',
  },
  {
    Icon: FiUsers,
    title: 'Networking y vinculación',
    detail: 'Comunidad activa y conexiones reales con colegas del sector.',
  },
  {
    Icon: FiGlobe,
    title: 'Convenios y alianzas',
    detail: 'Acuerdos institucionales con organismos, cámaras y empresas.',
  },
  {
    Icon: FiShoppingBag,
    title: 'Registro y beneficios',
    detail: 'Presencia en el directorio oficial de socios verificados de ACAV.',
  },
  {
    Icon: FiCalendar,
    title: 'Workshops y experiencias',
    detail: 'Eventos inmersivos, ferias y encuentros con operadores y destinos.',
  },
  {
    Icon: FiHome,
    title: 'Hotelería y servicios',
    detail: 'Beneficios pensados para todo el ecosistema turístico.',
  },
  {
    Icon: FiBriefcase,
    title: 'Herramientas de gestión',
    detail: 'Recursos y plataformas para profesionalizar el día a día de tu agencia.',
  },
]

export default function ConveniosYBeneficiosPage() {
  return (
    <PageAnimation>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Servicios · Socios</p>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.1] text-slate-900 md:text-[38px]">
              Convenios y Beneficios
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Más beneficios, más oportunidades. Generamos convenios de cooperación con instituciones and empresas
              para que tu agencia acceda a condiciones preferenciales y herramientas exclusivas.
            </p>
          </div>

          <div className="mt-10 grid gap-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-5 md:p-6">
            <div className="relative h-[220px] overflow-hidden rounded-[22px] sm:h-[280px] md:h-full">
              <Image
                src="/images/benefits/placeholder.jpg"
                alt="Descuentos exclusivos"
                width={960}
                height={540}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.18)_50%,rgba(15,23,42,0.38)_100%)]" />
            </div>

            <div className="flex flex-col justify-center rounded-[22px] border border-slate-100 bg-slate-50/60 p-6 md:p-9">
              <p className="text-[11px] font-bold uppercase text-primary-600">Destacado</p>
              <h2 className="mt-3 text-[22px] font-bold leading-tight text-slate-900">Descuentos exclusivos</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Accedé a descuentos y condiciones preferenciales en hoteles, aerolíneas, asistencia al viajero y
                mucho más para potenciar tu agencia y tus experiencias.
              </p>
              <Link
                href="/socios/asociate"
                className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-slate-900 px-6 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Quiero asociarme
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Beneficios para socios</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Todo lo que incluye ser parte de ACAV
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beneficios.map(({ Icon, title, detail, destacado }) => (
              <article
                key={title}
                className={`rounded-[22px] border p-6 transition hover:-translate-y-1 ${
                  destacado
                    ? 'border-primary-200 bg-primary-50/50 shadow-[0_12px_30px_rgba(0,136,216,0.12)]'
                    : 'border-slate-200 bg-white hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]'
                }`}
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${
                    destacado ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'
                  }`}
                >
                  <Icon className="text-[18px]" />
                </div>
                <h3 className="mt-5 text-[15px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-600">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[26px] bg-[#04112e] px-8 py-8 text-white md:px-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">¿Todavía no sos socio?</p>
              <p className="mt-2 text-[20px] font-bold leading-snug">
                Sumate y accedé a todos los convenios de ACAV.
              </p>
            </div>
            <Link
              href="/socios/asociate"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-accent-600"
            >
              Quiero asociarme
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
