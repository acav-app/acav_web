import type { Metadata } from 'next'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

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
    <section className="py-section md:py-section-lg">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Socios</p>
            <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
              Agencias y operadores asociados
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Todas las agencias del directorio están habilitadas y verificadas por ACAV. Buscá por nombre,
              categoría o localidad.
            </p>
          </div>

          <Link
            href="/socios/asociate"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_12px_30px_rgba(249,73,16,0.28)] transition hover:-translate-y-0.5 hover:bg-accent-600"
          >
            Quiero asociarme
            <FiArrowRight />
          </Link>
        </div>

        <SociosClient socios={socios} />
      </div>
    </section>
  )
}
