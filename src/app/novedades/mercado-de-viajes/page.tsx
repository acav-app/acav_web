import type { Metadata } from 'next'
import { FiArrowUpRight, FiCalendar, FiGlobe, FiInstagram, FiUsers } from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'

export const metadata: Metadata = {
  title: 'Mercado de Viajes | ACAV',
  description: 'Accedé a Mercado de Viajes, el portal de novedades y actualidad del turismo argentino.',
}

const SITIO = 'https://mercadodeviajes.ar/'
const INSTAGRAM = 'https://www.instagram.com/mercadodeviajesar/'
const VIDEO = '/mercado-de-viajes.mp4'

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

          <a
            href={SITIO}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 block overflow-hidden rounded-[26px] border border-slate-200 bg-[#04112e] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.18)]"
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-[linear-gradient(135deg,#0a2d69,#082559_55%,#051a41)] sm:aspect-[3/1]">
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
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.6)_55%,rgba(2,6,23,0.25)_100%)]" />

              <div className="absolute inset-0 flex flex-col justify-center px-8 text-white md:px-12">
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase shadow-[0_12px_30px_rgba(249,73,16,0.28)] transition group-hover:bg-accent-600">
                    Visitar el portal
                    <FiArrowUpRight className="text-[14px]" />
                  </span>
                  <a
                    href={INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mercado de Viajes en Instagram"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20"
                  >
                    <FiInstagram className="text-[17px]" />
                  </a>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>
    </PageAnimation>
  )
}
