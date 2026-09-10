'use client'

import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

import type { ComisionHistorica } from '@/app/data/comisiones-historicas'

export default function ComisionesHistoricasAccordion({
  comisiones,
}: {
  comisiones: ComisionHistorica[]
}) {
  const [openPeriodo, setOpenPeriodo] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {comisiones.map((comision) => {
        const isOpen = openPeriodo === comision.periodo

        return (
          <div
            key={comision.periodo}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <button
              type="button"
              onClick={() => setOpenPeriodo(isOpen ? null : comision.periodo)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-base font-bold text-slate-900 sm:text-lg">{comision.periodo}</span>
                <span className="text-xs font-medium text-slate-400">
                  {comision.miembros.length} {comision.miembros.length === 1 ? 'integrante' : 'integrantes'}
                </span>
              </div>
              <FiChevronDown
                className={`shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
              />
            </button>

            {isOpen ? (
              <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {comision.miembros.map((miembro) => (
                    <div
                      key={miembro.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600">
                        {miembro.cargo}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{miembro.nombre}</p>
                      {miembro.agencia ? (
                        <p className="mt-1 text-xs leading-5 text-slate-500">{miembro.agencia}</p>
                      ) : null}
                      {miembro.vigencia ? (
                        <p className="mt-1 text-[11px] leading-5 text-slate-400">
                          Vigencia: {miembro.vigencia}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
