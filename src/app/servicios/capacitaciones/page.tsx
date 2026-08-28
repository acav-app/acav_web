import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowRight, FiAward, FiBookOpen, FiCheck, FiMonitor, FiUsers } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Capacitaciones y Cursos | ACAV',
  description:
    'Campus educativo de ACAV: cursos, certificaciones y talleres con beneficios exclusivos para socios.',
}

const metricas = [
  { value: '35+', label: 'Cursos disponibles' },
  { value: '2000+', label: 'Alumnos capacitados' },
  { value: '15+', label: 'Certificaciones emitidas' },
]

const propuestas = [
  {
    Icon: FiMonitor,
    title: 'Campus virtual',
    detail: 'Cursos online autogestionados para capacitarte a tu ritmo, desde cualquier lugar del país.',
  },
  {
    Icon: FiBookOpen,
    title: 'Talleres y workshops',
    detail: 'Encuentros prácticos sobre ventas, destinos, marketing turístico y gestión de agencias.',
  },
  {
    Icon: FiAward,
    title: 'Certificaciones',
    detail: 'Formación certificada que acredita la profesionalización de tu equipo ante el sector.',
  },
  {
    Icon: FiUsers,
    title: 'Capacitación in company',
    detail: 'Programas a medida para el equipo de tu agencia, coordinados junto a ACAV.',
  },
]

const beneficios = [
  'Aranceles preferenciales para socios y sus equipos',
  'Certificados emitidos por ACAV',
  'Docentes y referentes del sector turístico',
  'Agenda de más de 100 capacitaciones al año',
]

export default function CapacitacionesPage() {
  return (
    <>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
            <div>
              <p className="text-[11px] font-bold uppercase text-primary-600">Servicios · Campus educativo</p>
              <h1 className="mt-3 text-[28px] font-bold leading-[1.1] text-slate-900 md:text-[38px]">
                Capacitaciones y Cursos
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Capacitate y crecé profesionalmente. Accedé a cursos, certificaciones y talleres con beneficios
                exclusivos para socios, dictados por referentes del turismo.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="https://acav-cursos.vercel.app/"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white shadow-[0_14px_32px_rgba(249,73,16,0.3)] transition hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  Quiero capacitarme
                  <FiArrowRight />
                </Link>
                <Link
                  href="mailto:info@acav.org.ar"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-7 text-[11px] font-bold uppercase text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Consultar agenda
                </Link>
              </div>
            </div>

            <div className="rounded-[26px] bg-[linear-gradient(135deg,#ff7a2d,#f85a16_55%,#e24a0b)] p-8 text-white md:p-10 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_55px_rgba(248,90,22,0.22)]">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/acav_cursos.png"
                  alt="Cursos ACAV"
                  fill
                  priority
                  className="object-cover opacity-15 select-none pointer-events-none"
                />
              </div>

              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">Cursos ACAV</p>
                <p className="mt-3 text-[20px] font-bold leading-snug">
                  Campus educativo para capacitaciones, certificaciones y formación profesional.
                </p>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 border-t border-white/20 pt-6">
                {metricas.map((metrica) => (
                  <div key={metrica.label}>
                    <p className="text-[22px] font-bold leading-none">{metrica.value}</p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase leading-5 text-white/80">
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
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Propuesta formativa</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Formación continua para tu agencia
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {propuestas.map(({ Icon, title, detail }) => (
              <article
                key={title}
                className="rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
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
