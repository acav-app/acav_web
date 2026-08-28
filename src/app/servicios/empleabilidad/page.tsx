import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowRight, FiBriefcase, FiCheck, FiSearch, FiSend, FiUserPlus } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Red de Empleabilidad | ACAV',
  description:
    'Plataforma laboral de ACAV: conectamos agencias de viajes con profesionales del sector turístico de Córdoba.',
}

const metricas = [
  { value: '120+', label: 'Ofertas activas' },
  { value: '850+', label: 'Perfiles registrados' },
  { value: '60+', label: 'Agencias conectadas' },
]

const paraAgencias = [
  'Publicá búsquedas laborales sin costo adicional',
  'Accedé a perfiles ya vinculados al turismo',
  'Filtrá por experiencia, puesto y localidad',
  'Gestioná las postulaciones desde un solo lugar',
]

const paraProfesionales = [
  'Creá tu perfil profesional del sector turístico',
  'Postulate a búsquedas de agencias asociadas',
  'Sumá capacitaciones y certificaciones de ACAV',
  'Recibí novedades de nuevas oportunidades',
]

const pasos = [
  { Icon: FiUserPlus, title: 'Registrate', detail: 'Como agencia asociada o como profesional del turismo.' },
  { Icon: FiSearch, title: 'Explorá', detail: 'Buscá perfiles o búsquedas laborales activas.' },
  { Icon: FiSend, title: 'Conectá', detail: 'Postulate o contactá directamente a los candidatos.' },
]

export default function EmpleabilidadPage() {
  return (
    <>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
            <div>
              <p className="text-[11px] font-bold uppercase text-primary-600">Servicios · Plataforma laboral</p>
              <h1 className="mt-3 text-[28px] font-bold leading-[1.1] text-slate-900 md:text-[38px]">
                Red de Empleabilidad
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Conectamos talento con oportunidades. Publicá búsquedas o postulate a la plataforma de empleo
                turístico de Córdoba, destinada a vincular agencias de viajes con profesionales del sector.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="https://acav-empleos.vercel.app/"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white shadow-[0_14px_32px_rgba(249,73,16,0.3)] transition hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  Explorar empleos
                  <FiArrowRight />
                </Link>
                <Link
                  href="https://acav-empleos.vercel.app/"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-7 text-[11px] font-bold uppercase text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Publicar una búsqueda
                </Link>
              </div>
            </div>

            <div className="rounded-[26px] bg-[linear-gradient(135deg,#0a2d69,#082559_55%,#051a41)] p-8 text-white md:p-10 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_55px_rgba(10,45,105,0.22)] min-h-[360px] lg:min-h-[440px]">
              <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <Image
                  src="/images/acav_empleos.png"
                  alt="Empleabilidad ACAV"
                  fill
                  priority
                  className="object-cover md:object-contain object-bottom scale-105 origin-bottom opacity-20"
                />
              </div>

              <div className="relative z-10">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-300">
                  <FiBriefcase className="text-[24px]" />
                </span>
                <p className="mt-6 text-[20px] font-bold leading-snug md:text-2xl">
                  Empleabilidad ACAV, la puerta de entrada al empleo turístico en Córdoba.
                </p>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
                {metricas.map((metrica) => (
                  <div key={metrica.label}>
                    <p className="text-[22px] font-bold leading-none md:text-3xl">{metrica.value}</p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase leading-5 text-white/70">
                      {metrica.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { titulo: 'Para agencias', items: paraAgencias },
              { titulo: 'Para profesionales', items: paraProfesionales },
            ].map((bloque) => (
              <article key={bloque.titulo} className="rounded-[26px] border border-slate-200 bg-white p-8">
                <h2 className="text-[20px] font-bold text-slate-900">{bloque.titulo}</h2>
                <ul className="mt-6 space-y-3.5">
                  {bloque.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <FiCheck className="text-[12px]" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {pasos.map(({ Icon, title, detail }) => (
              <article
                key={title}
                className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-6 transition hover:-translate-y-1 hover:border-primary-200"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <Icon className="text-[18px]" />
                </div>
                <h3 className="mt-5 text-[15px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-600">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
