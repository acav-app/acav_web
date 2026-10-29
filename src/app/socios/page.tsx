import type { Metadata } from 'next'
import { FiArrowRight, FiCheckCircle, FiSearch } from 'react-icons/fi'

import PageAnimation from '../components/page-animation'
import { AssociationCtaLink } from '../components/association-cta'
import { listSociosActivos } from '@/lib/admin/repository'
import type { Socio } from '@/lib/admin/types'
import SociosClient from './socios-client'

export const metadata: Metadata = {
  title: 'Socios | ACAV',
  description:
    'Directorio de agencias de viajes y operadores asociados a ACAV. Buscá por nombre, categoría o localidad.',
}

export const revalidate = 300

export default async function SociosPage() {
  let socios: Socio[] = []

  try {
    socios = await listSociosActivos()
  } catch (error) {
    console.error('[socios]', error)
  }

  return (
    <PageAnimation>
      <section className="relative isolate overflow-hidden bg-[linear-gradient(145deg,#15203B_0%,#1B2B50_55%,#15203B_100%)] text-white">
        <div aria-hidden="true" className="socios-hero-orb socios-hero-orb--primary" />
        <div aria-hidden="true" className="socios-hero-orb socios-hero-orb--secondary" />
        <div aria-hidden="true" className="socios-hero-orb socios-hero-orb--tertiary" />
        <div aria-hidden="true" className="socios-hero-shade" />

        <div className="container relative z-10 py-section md:py-section-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/80 backdrop-blur-sm">
              <FiCheckCircle className="text-emerald-400" />
              Directorio oficial ACAV
            </div>

            <h1 className="mt-5 text-[30px] font-bold leading-[1.1] text-white sm:text-[38px] md:text-[46px]">
              Agencias y operadores asociados
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 md:text-base md:leading-8">
              Todas las agencias del directorio están habilitadas y verificadas por ACAV. Buscá por nombre,
              categoría o localidad.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AssociationCtaLink
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_12px_30px_rgba(249,73,16,0.35)] transition hover:-translate-y-0.5 hover:bg-accent-600"
              >
                Quiero asociarme
                <FiArrowRight />
              </AssociationCtaLink>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-white/60">
                <FiSearch className="text-[13px]" />
                {socios.length} socios activos
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-section md:py-section-lg">
        <div className="container">
          <SociosClient socios={socios} />
        </div>
      </section>
    </PageAnimation>
  )
}
