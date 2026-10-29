import type { Metadata } from 'next'
import Image from 'next/image'
import { FiArrowRight } from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'
import { AssociationCtaLink } from '../../components/association-cta'
import BenefitsCards from './benefits-cards'

export const metadata: Metadata = {
  title: 'Convenios y Beneficios | ACAV',
  description:
    'Descuentos exclusivos, convenios institucionales, capacitaciones, asesoramiento y networking para las agencias asociadas a ACAV.',
}

const sociosBeneficios = [
  { title: 'Voy de Viaje', image: '/images/beneficios/VOY DE VIAJE.png' },
  { title: 'Tren a las Nubes', image: '/images/beneficios/TREN DE LAS NUBES.jpg' },
  { title: 'Travel Connect', image: '/images/beneficios/TRAVEL.png' },
  { title: 'Savia Group', image: '/images/beneficios/savia group.jpg' },
  { title: 'Macro', image: '/images/beneficios/MACFRO.jpg' },
  {
    title: 'SANCOR SEGUROS',
    image: '/images/beneficios/images.jpg',
    description:
      'Descuentos de entre el 40% y el 45% sobre el precio de lista al asociarse como empresa. Cada socio de su agencia podrá acceder a precios exclusivos. (Mínimo 5 integrantes por grupo familiar)',
  },
  { title: 'Howard Johnson Plaza Villa Carlos Paz', image: '/images/beneficios/HOWARD.jpg' },
  { title: 'Hotel 111', image: '/images/beneficios/HOTEL 111.png' },
  { title: 'Hospital Italiano Córdoba', image: '/images/beneficios/hospital italiano.png' },
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
                src="/images/descuentos_exclusivos.jpg"
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
              <AssociationCtaLink
                className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-slate-900 px-6 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Quiero asociarme
                <FiArrowRight />
              </AssociationCtaLink>
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

          <BenefitsCards items={sociosBeneficios} />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[26px] bg-[#04112e] px-8 py-8 text-white md:px-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">¿Todavía no sos socio?</p>
              <p className="mt-2 text-[20px] font-bold leading-snug">
                Sumate y accedé a todos los convenios de ACAV.
              </p>
            </div>
            <AssociationCtaLink
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-accent-600"
            >
              Quiero asociarme
              <FiArrowRight />
            </AssociationCtaLink>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
