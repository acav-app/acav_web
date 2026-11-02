import type { Metadata } from 'next'
import Link from 'next/link'
import { FiCheck, FiFileText } from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'
import CategoriasAsociado, { type Categoria } from './categorias-asociado'
import SolicitudIngresoWizard from './solicitud-ingreso-wizard'

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

const documentacion = [
  'DNI de titulares, delegado y subdelegado (frente y dorso)',
  'Contrato / Estatuto social o documentación equivalente',
  'Inscripción en ARCA',
  'Informe comercial (Nosis o Veraz)',
  'Legajo habilitante (si corresponde)',
  'Inscripción en el Registro Nacional de Agencias de Viajes',
  'Datos de 2 asociados activos que puedan avalar la solicitud',
]

export default function AsociatePage() {
  return (
    <PageAnimation>
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
                  href="#solicitud-intro"
                  className="inline-flex h-12 items-center rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  Iniciar solicitud
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

              <p className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/70">
                Completá la solicitud en línea y seguí el avance del trámite paso a paso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="pb-12 md:pb-16">
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

      {/* Requisitos */}
      <section id="requisitos" className="scroll-mt-24 pb-6 md:pb-8">
        <div className="container">
          <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary-600">Antes de comenzar</p>
              <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
                Documentación que vas a necesitar
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Prepará la documentación y los datos de dos asociados activos; los vas a necesitar para completar el trámite.
              </p>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {documentacion.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <FiFileText className="text-[13px]" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 bg-slate-50 pb-12 pt-8 md:pb-16 md:pt-10">
        <div className="container">
          <div className="mx-auto">
            <div className="mb-7 max-w-3xl scroll-mt-28" id="solicitud-intro">
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary-600">Solicitud de ingreso</p>
              <h2 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
                Completá tu solicitud paso a paso
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                El trámite tiene cinco pasos. Podés avanzar a tu ritmo: tus cambios se guardan automáticamente.
              </p>
            </div>

            <SolicitudIngresoWizard />
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
