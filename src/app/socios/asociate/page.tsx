import type { Metadata } from 'next'
import Link from 'next/link'
import { FiArrowRight, FiCheck, FiDownload, FiFileText } from 'react-icons/fi'

import CategoriasAsociado, { type Categoria } from './categorias-asociado'
import SolicitudForm from './solicitud-form'

export const metadata: Metadata = {
  title: 'Asociate | ACAV',
  description:
    'Sumate a ACAV: derechos y asesoramiento, capacitaciones continuas, beneficios exclusivos y networking comercial para tu agencia de viajes.',
}

const beneficios = [
  'Derechos y asesoramiento para tu agencia',
  'Capacitaciones continuas',
  'Beneficios exclusivos',
  'Networking comercial (eventos, congresos, workshops y participaciones)',
]

const categorias: Categoria[] = [
  {
    titulo: 'Asociado Activo',
    resumen:
      'Agencias de viajes / operadores habilitados por la autoridad competente y que cumplan con los requisitos establecidos por ACAV.',
    detalle:
      'Tienen voz y voto en las asambleas, pueden integrar la Comisión Directiva y acceden a la totalidad de los beneficios institucionales. Deben mantener vigente su habilitación y estar al día con la cuota social.',
  },
  {
    titulo: 'Asociado Adherente',
    resumen: 'Empresas, instituciones o personas vinculadas directa o indirectamente con la actividad turística.',
    detalle:
      'Participan de las actividades, capacitaciones y espacios de networking de la asociación. Tienen voz en las asambleas pero no voto, y no pueden integrar los órganos de conducción.',
  },
  {
    titulo: 'Asociado Honorario',
    resumen:
      'Distinción otorgada por la Comisión Directiva a personas o instituciones por su aporte al turismo y al sector.',
    detalle:
      'Se otorga como reconocimiento a una trayectoria o a una contribución destacada al desarrollo del turismo. Está exenta del pago de la cuota social.',
  },
]

const pasos = [
  { n: '01', title: 'Completar la Solicitud de Ingreso.' },
  { n: '02', title: 'Reunir la documentación requerida.' },
  { n: '03', title: 'Presentar toda la documentación.' },
  {
    n: '04',
    title: 'La Comisión Directiva evaluará la solicitud según el procedimiento establecido por el Estatuto.',
  },
]

const documentacion = [
  'Solicitud de ingreso',
  'DNI de titulares, delegado y subdelegado',
  'Contrato / Estatuto social o documentación equivalente',
  'Inscripción en ARCA',
  'Informe comercial (Nosis o Veraz)',
  'Legajo habilitante (cuando corresponda)',
  'Inscripción en el Registro Nacional de Agencias de Viajes',
  'Aval de 2 asociados activos',
]

const SOLICITUD_PDF = '/docs/solicitud-de-ingreso-acav.pdf'

export default function AsociatePage() {
  return (
    <>
      {/* Intro + beneficios */}
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
            <div>
              <p className="text-[11px] font-bold uppercase text-primary-600">Asociate</p>
              <h1 className="mt-3 text-[28px] font-bold leading-[1.1] text-slate-900 md:text-[38px]">
                Sumate a la comunidad que representa al turismo de Córdoba
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Formá parte de la comunidad que representa y fortalece a las agencias de viajes de Córdoba.
                Asociarte a ACAV significa acceder a una red de profesionales, espacios de capacitación,
                representación institucional, oportunidades de networking y acciones que impulsan el crecimiento
                del sector.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#solicitud"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white shadow-[0_14px_32px_rgba(249,73,16,0.3)] transition hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  Quiero asociarme
                  <FiArrowRight />
                </Link>
                <Link
                  href="#requisitos"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-7 text-[11px] font-bold uppercase text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Consultar requisitos
                </Link>
              </div>
            </div>

            <div className="rounded-[26px] bg-[#04112e] p-8 text-white md:p-10">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">Crecé con ACAV</p>
              <p className="mt-3 text-[20px] font-bold leading-snug">
                Crecé junto a más de 200 agencias de viajes asociadas.
              </p>

              <ul className="mt-7 space-y-4">
                {beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-3 text-sm leading-6 text-white/80">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                      <FiCheck className="text-[12px]" />
                    </span>
                    {beneficio}
                  </li>
                ))}
              </ul>

              <a
                href={SOLICITUD_PDF}
                download
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-[11px] font-bold uppercase text-white transition hover:border-white/30 hover:bg-white/10"
              >
                <FiDownload />
                Descargar solicitud de ingreso
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Categorías</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              ¿Quiénes pueden asociarse?
            </h2>
          </div>

          <div className="mt-8">
            <CategoriasAsociado categorias={categorias} />
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="requisitos" className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Proceso</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Quiero asociarme
            </h2>
          </div>

          <ol className="relative mt-9 grid gap-6 md:grid-cols-4 md:gap-5">
            <div className="absolute left-0 right-0 top-[22px] hidden h-[3px] rounded-full bg-slate-200 md:block" />

            {pasos.map((paso) => (
              <li key={paso.n} className="relative">
                <span className="relative z-10 flex size-11 items-center justify-center rounded-full bg-primary-500 text-[13px] font-bold text-white ring-8 ring-white">
                  {paso.n}
                </span>
                <p className="mt-4 text-sm leading-6 text-slate-600">{paso.title}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-8 rounded-[26px] border border-slate-200 bg-slate-50/70 p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:p-10">
            <div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <FiFileText className="text-[18px]" />
              </div>
              <h3 className="mt-5 text-[20px] font-bold leading-tight text-slate-900">
                Documentación requerida
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Preparala antes de enviar tu solicitud para agilizar la evaluación.
              </p>

              <a
                href={SOLICITUD_PDF}
                download
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary-500 px-6 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-primary-600"
              >
                <FiDownload />
                Descargar solicitud
              </a>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {documentacion.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] leading-6 text-slate-700"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <FiCheck className="text-[12px]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section id="solicitud" className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-bold uppercase text-primary-600">Solicitud de ingreso</p>
              <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
                Sumate a ACAV
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
                Completá el formulario y el equipo de ACAV se va a contactar con vos para continuar con el
                proceso de asociación.
              </p>
            </div>

            <SolicitudForm />
          </div>
        </div>
      </section>
    </>
  )
}
