import type { Metadata } from 'next'

import PageAnimation from '../../components/page-animation'

export const metadata: Metadata = {
  title: 'Workshop | ACAV',
  description:
    'Los encuentros comerciales y profesionales de la industria turística más importantes del interior del país, organizados por ACAV.',
}

const STATS = [
  {
    value: '+65',
    label: 'Ediciones en Córdoba',
    detail: 'Trayectoria ininterrumpida organizando el encuentro comercial y profesional de la industria.',
  },
  {
    value: '+120',
    label: 'Expositores',
    detail: 'Presencia de operadores turísticos, aerolíneas, destinos y empresas del sector.',
  },
  {
    value: '+1500',
    label: 'Asistentes del sector',
    detail: 'Gran confluencia de agencias de viajes y profesionales del turismo.',
  },
  {
    value: '+50',
    label: 'Premios y sorteos',
    detail: 'Importantes beneficios y sorpresas para los asistentes durante la feria.',
  },
]

const VIDEO = '/mercado-de-viajes.mp4'

export default function WorkshopPage() {
  return (
    <PageAnimation>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Novedades</p>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.15] text-slate-900 md:text-[38px]">
              Workshop
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Los encuentros comerciales y profesionales de la industria turística más importantes del interior del
              país, organizados por ACAV desde hace más de 65 ediciones.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              En esta gran feria confluyen agencias de viajes, operadores turísticos, aerolíneas, destinos y empresas
              del sector junto al lanzamiento de temporada, llevándose a cabo en dos encuentros al año, en abril y
              noviembre.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((item) => (
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

          <div className="group mt-10 overflow-hidden rounded-[26px] border border-slate-200 bg-[#04112e] shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[linear-gradient(135deg,#0a2d69,#082559_55%,#051a41)] sm:aspect-[2/1] lg:aspect-[21/9]">
              <video
                src={VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.3)_0%,rgba(2,6,23,0.08)_55%,rgba(2,6,23,0.02)_100%)]" />
            </div>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
