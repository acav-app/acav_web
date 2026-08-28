'use client'

import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export interface Categoria {
  titulo: string
  resumen: string
  detalle: string
}

export default function CategoriasAsociado({ categorias }: { categorias: Categoria[] }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {categorias.map((categoria) => (
          <article
            key={categoria.titulo}
            className="rounded-[22px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
          >
            <h3 className="text-[16px] font-bold text-slate-900">{categoria.titulo}</h3>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">{categoria.resumen}</p>

            {abierto ? (
              <p className="mt-4 border-t border-slate-100 pt-4 text-[13px] leading-6 text-slate-500">
                {categoria.detalle}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-expanded={abierto}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-6 text-[11px] font-bold uppercase text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
      >
        {abierto ? 'Ocultar detalle de categorías' : 'Ver detalle de categorías'}
        <FiChevronDown className={`transition ${abierto ? 'rotate-180' : ''}`} />
      </button>
    </>
  )
}
