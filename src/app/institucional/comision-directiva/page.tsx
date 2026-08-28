import type { Metadata } from 'next'
import Image from 'next/image'

import { comisionDirectiva, iniciales } from '../../data/comision'

export const metadata: Metadata = {
  title: 'Comisión Directiva | ACAV',
  description:
    'Conocé a los integrantes de la Comisión Directiva de ACAV: mesa directiva, vocales y comisión revisora de cuentas.',
}

export default function ComisionDirectivaPage() {
  return (
    <>
      <section className="py-section md:py-section-lg">
        <div className="container space-y-14">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Institucional</p>
            <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
              Comisión Directiva
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              El equipo que conduce ACAV, elegido por sus socios para representar y fortalecer a las agencias de
              viajes de Córdoba.
            </p>
          </div>

          {comisionDirectiva.map((grupo) => (
            <div key={grupo.titulo}>
              <div className="max-w-2xl">
                <h2 className="text-[22px] font-bold leading-tight text-slate-900 md:text-[26px]">
                  {grupo.titulo}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{grupo.descripcion}</p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {grupo.miembros.map((miembro) => (
                  <article
                    key={miembro.nombre}
                    className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)]"
                  >
                    <div className="relative aspect-[4/5] bg-slate-100">
                      {miembro.foto ? (
                        <Image
                          src={miembro.foto}
                          alt={miembro.nombre}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
                          className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[34px] font-extrabold text-slate-300">
                          {iniciales(miembro.nombre)}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600">
                        {miembro.cargo}
                      </p>
                      <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-slate-900">{miembro.nombre}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
