import type { Metadata } from 'next'
import Link from 'next/link'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'

import { listAliadosActivos } from '@/lib/admin/repository'
import type { Aliado } from '@/lib/admin/types'

export const metadata: Metadata = {
  title: 'Aliados Estratégicos | ACAV',
  description:
    'Instituciones, cámaras y empresas que acompañan a ACAV y potencian el trabajo de las agencias de viajes de Córdoba.',
}

export const revalidate = 300

export default async function AliadosEstrategicosPage() {
  let aliados: Aliado[] = []

  try {
    aliados = await listAliadosActivos()
  } catch (error) {
    console.error('[aliados]', error)
  }

  return (
    <>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="mb-10 max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Institucional</p>
            <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
              Aliados Estratégicos
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Trabajamos junto a organismos, cámaras y empresas del sector para generar oportunidades reales para
              nuestros socios.
            </p>
          </div>
          {aliados.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center">
              <p className="text-[11px] font-bold uppercase text-primary-600">Próximamente</p>
              <h2 className="mt-3 text-[24px] font-bold text-slate-900">Estamos actualizando esta sección</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Muy pronto vas a encontrar acá a todas las instituciones y empresas que acompañan a ACAV. Si querés
                sumarte como aliado estratégico, escribinos.
              </p>
              <Link
                href="mailto:info@acav.org.ar"
                className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-primary-500 px-6 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-primary-600"
              >
                Contactanos
                <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aliados.map((aliado) => (
                <article
                  key={aliado.id}
                  className="flex flex-col rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-16 items-center">
                    {aliado.imagen ? (
                      // Los logos viven en R2; se sirven sin el optimizador de Next.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={aliado.imagen}
                        alt={aliado.nombre}
                        className="h-12 w-auto max-w-[180px] object-contain"
                      />
                    ) : (
                      <span className="text-[20px] font-extrabold text-slate-300">{aliado.nombre}</span>
                    )}
                  </div>

                  <h2 className="mt-5 text-[15px] font-bold text-slate-900">{aliado.nombre}</h2>
                  {aliado.descripcion ? (
                    <p className="mt-2 flex-1 text-[13px] leading-6 text-slate-600">{aliado.descripcion}</p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {aliado.sitio ? (
                    <a
                      href={aliado.sitio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase text-primary-600 transition hover:text-primary-700"
                    >
                      Visitar sitio
                      <FiExternalLink />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
