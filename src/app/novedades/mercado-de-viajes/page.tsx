import type { Metadata } from 'next'
import { FiArrowUpRight, FiCalendar, FiGlobe, FiUsers } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Mercado de Viajes | ACAV',
  description: 'Accedé a Mercado de Viajes, el portal de novedades y actualidad del turismo argentino.',
}

const SITIO = 'https://mercadodeviajes.ar/'
const BANNER = '/images/mercado-de-viajes.jpg'

const destacados = [
  { Icon: FiGlobe, title: 'Actualidad del sector', detail: 'Noticias diarias del turismo nacional e internacional.' },
  { Icon: FiCalendar, title: 'Agenda', detail: 'Ferias, workshops y eventos de la industria.' },
  { Icon: FiUsers, title: 'Comunidad', detail: 'Entrevistas y coberturas del ecosistema de agencias.' },
]

export default function MercadoDeViajesPage() {
  return (
    <section className="py-section md:py-section-lg">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase text-primary-600">Novedades</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
            Mercado de Viajes
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
            Portal de novedades y actualidad del turismo argentino. Ingresá para leer las últimas noticias del
            sector.
          </p>
        </div>

        <a
          href={SITIO}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 block overflow-hidden rounded-[26px] border border-slate-200 bg-[#04112e] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.18)]"
        >
          <div className="relative aspect-[21/9] w-full bg-[linear-gradient(135deg,#0a2d69,#082559_55%,#051a41)] sm:aspect-[3/1]">
            {/* Banner opcional: si no existe el archivo, queda el degradado de fondo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BANNER}
              alt="Mercado de Viajes"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.6)_55%,rgba(2,6,23,0.25)_100%)]" />

            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white md:px-12">
              <span className="mt-5 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase shadow-[0_12px_30px_rgba(249,73,16,0.28)] transition group-hover:bg-accent-600">
                Visitar el portal
                <FiArrowUpRight className="text-[14px]" />
              </span>
            </div>
          </div>
        </a>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {destacados.map(({ Icon, title, detail }) => (
            <article
              key={title}
              className="rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="text-[18px]" />
              </div>
              <h2 className="mt-5 text-[15px] font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
