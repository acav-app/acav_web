import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight, FiAward, FiBookOpen, FiShield, FiUsers } from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'
import { siteConfig } from '../../config/site'
export const metadata: Metadata = {
  title: 'Quiénes somos | ACAV',
  description:
    'ACAV, Asociación Cordobesa de Agencias de Viajes: reunimos, representamos, capacitamos y defendemos los derechos de las agencias de viajes de Córdoba desde 1963.',
}

const pilares = [
  {
    Icon: FiShield,
    title: 'Representación',
    detail: 'Defendemos los intereses de nuestros socios ante organismos públicos y privados.',
  },
  {
    Icon: FiBookOpen,
    title: 'Formación continua',
    detail: 'Impulsamos la profesionalización del sector con capacitaciones y certificaciones.',
  },
  {
    Icon: FiUsers,
    title: 'Convenios',
    detail: 'Generamos acuerdos de cooperación con instituciones que potencian a las agencias.',
  },
  {
    Icon: FiAward,
    title: 'Asesoramiento',
    detail: 'Acompañamiento normativo permanente para operar con tranquilidad y respaldo.',
  },
]

export default function QuienesSomosPage() {
  return (
    <PageAnimation>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
            <div>
              <p className="text-[11px] font-bold uppercase text-primary-600">Institucional</p>
              <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
                Somos ACAV, Asociación Cordobesa de Agencias de Viajes
              </h1>

              <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                <p>
                  Somos la entidad que reúne, representa, capacita y defiende los derechos de las agencias de viajes
                  de Córdoba desde su fundación en 1963.
                </p>
                <p>
                  Representamos los intereses de nuestros socios ante organismos públicos y privados, impulsamos su
                  formación profesional continua, generamos convenios de cooperación con instituciones, y los
                  acompañamos con asesoramiento normativo permanente para que puedan enfocarse en lo que mejor saben
                  hacer: crear y concretar experiencias de viajes.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/institucional/comision-directiva"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-500 px-6 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-primary-600"
                >
                  Comisión Directiva
                  <FiArrowRight />
                </Link>
                <Link
                  href={siteConfig.nav.cta.href}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-6 text-[11px] font-bold uppercase text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Asociate
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[26px] border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <Image
                src="/images/placeholder.jpg"
                alt="Equipo de ACAV"
                width={900}
                height={700}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
