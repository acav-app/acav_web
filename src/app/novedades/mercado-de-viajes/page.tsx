import type { Metadata } from 'next'
import Image from 'next/image'
import { FiArrowUpRight, FiCalendar, FiGlobe, FiUsers } from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'

export const metadata: Metadata = {
  title: 'Mercado de Viajes | ACAV',
  description: 'Accedé a Mercado de Viajes, el portal de novedades y actualidad del turismo argentino.',
}

const SITIO = 'https://mercadodeviajes.ar/'
export default function MercadoDeViajesPage() {
  return (
    <PageAnimation>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Novedades</p>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.15] text-slate-900 md:text-[38px]">
              Mercado de Viajes
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              La feria turística abierta al público más importante del interior de Argentina, organizada por ACAV. Un
              espacio diseñado para inspirar al viajero y conectar la oferta directamente con el público final,
              complementado por los tradicionales workshops profesionales de ACAV.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  value: '+150',
                  label: 'Agencias participantes',
                  detail: 'Agencias de viajes y turismo de todo el país.',
                },
                {
                  value: '100%',
                  label: 'Entrada libre y gratuita',
                  detail: 'Acceso abierto para todo el público general.',
                },
                {
                  value: 'ACAV',
                  label: 'Organiza',
                  detail: 'Asociación Cordobesa de Agencias de Viajes.',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                >
                  <p className="text-xl font-bold leading-none text-primary-600">{item.value}</p>
                  <p className="mt-2 text-[13px] font-bold leading-5 text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[26px] sm:aspect-[3/1]">
              <Image
                src="/images/mercado_de_viajes.png"
                alt="Encuentro profesional de la industria turística"
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover object-center"
              />
            </div>
            <div className="mt-5 flex justify-end">
              <a
                href={SITIO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white shadow-[0_12px_30px_rgba(249,73,16,0.2)] transition-colors hover:bg-accent-600"
              >
                Ir a Mercado de Viajes
                <FiArrowUpRight className="text-[14px]" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
