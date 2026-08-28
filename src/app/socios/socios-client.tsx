'use client'

import { useMemo, useState } from 'react'
import {
  FiCheckCircle,
  FiCreditCard,
  FiGlobe,
  FiGrid,
  FiList,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
} from 'react-icons/fi'

import type { Socio } from '@/lib/admin/types'

type Vista = 'grilla' | 'lista'

function normalizar(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function urlDeSitio(sitio: string) {
  if (!sitio) return null
  return /^https?:\/\//i.test(sitio) ? sitio : `https://${sitio}`
}

function etiquetaDeSitio(sitio: string) {
  return sitio.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function DatoFila({
  Icon,
  label,
  children,
}: {
  Icon: typeof FiMail
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 border-t border-slate-100 py-2.5 first:border-t-0 min-w-0">
      <div className="flex items-center gap-2 shrink-0">
        <Icon className="shrink-0 text-[15px] text-slate-400" aria-hidden />
        <span className="text-[13px] text-slate-500">{label}</span>
      </div>
      <span className="sm:ml-auto min-w-0 truncate text-left sm:text-right text-[13px] font-semibold text-slate-900 break-words">
        {children}
      </span>
    </div>
  )
}

function TarjetaSocio({ socio }: { socio: Socio }) {
  const sitio = urlDeSitio(socio.sitio)

  return (
    <article className="flex h-full flex-col gap-5 rounded-[22px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:flex-row sm:p-6">
      <div className="flex justify-center sm:justify-start shrink-0">
        {socio.logo ? (
          // Los logos viven en R2; se sirven sin el optimizador de Next.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={socio.logo}
            alt={`Logo de ${socio.nombre}`}
            className="size-20 rounded-[18px] border border-slate-200 bg-white object-contain p-2 sm:size-[104px]"
          />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-[18px] bg-slate-100 text-[26px] font-extrabold text-slate-300 sm:size-[104px] sm:text-[32px]">
            {socio.nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h2 className="text-[18px] font-bold leading-snug text-slate-900 sm:text-[20px] break-words">{socio.nombre}</h2>

        {socio.localidad ? (
          <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-[13px] text-slate-500">
            <FiMapPin className="text-[13px]" aria-hidden />
            <span className="truncate">{socio.localidad}</span>
          </p>
        ) : null}

        <div className="flex justify-center sm:justify-start mt-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <FiCheckCircle className="text-[12px]" aria-hidden />
            Socio verificado ACAV
          </p>
        </div>

        <div className="mt-4 border-t border-slate-50 pt-2 text-left">
          {socio.legajo ? (
            <DatoFila Icon={FiCreditCard} label="Legajo RNAV">
              {socio.legajo}
            </DatoFila>
          ) : null}

          {socio.contacto.email ? (
            <DatoFila Icon={FiMail} label="Email">
              <a href={`mailto:${socio.contacto.email}`} className="text-primary-600 hover:text-primary-700 block truncate">
                {socio.contacto.email}
              </a>
            </DatoFila>
          ) : null}

          {socio.contacto.whatsapp ? (
            <DatoFila Icon={FiPhone} label="WhatsApp">
              {socio.contacto.whatsapp}
            </DatoFila>
          ) : null}

          {sitio ? (
            <DatoFila Icon={FiGlobe} label="Sitio web / Redes">
              <a
                href={sitio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 block truncate"
              >
                {etiquetaDeSitio(socio.sitio)}
              </a>
            </DatoFila>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function SociosClient({ socios }: { socios: Socio[] }) {
  const [query, setQuery] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [localidad, setLocalidad] = useState('todas')
  const [vista, setVista] = useState<Vista>('grilla')

  const categorias = useMemo(
    () => Array.from(new Set(socios.map((s) => s.categoria).filter(Boolean))).sort(),
    [socios]
  )

  const localidades = useMemo(
    () => Array.from(new Set(socios.map((s) => s.localidad).filter(Boolean))).sort(),
    [socios]
  )

  const filtrados = useMemo(() => {
    const term = normalizar(query.trim())

    return socios.filter((socio) => {
      if (categoria !== 'todas' && socio.categoria !== categoria) return false
      if (localidad !== 'todas' && socio.localidad !== localidad) return false
      if (!term) return true

      return normalizar(
        [socio.nombre, socio.legajo, socio.localidad, socio.contacto.email, socio.sitio].join(' ')
      ).includes(term)
    })
  }, [socios, query, categoria, localidad])

  const selectClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar agencia u operador"
            aria-label="Buscar agencia u operador"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <select
          value={categoria}
          onChange={(event) => setCategoria(event.target.value)}
          aria-label="Filtrar por categoría"
          className={selectClass}
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={localidad}
          onChange={(event) => setLocalidad(event.target.value)}
          aria-label="Filtrar por localidad"
          className={selectClass}
        >
          <option value="todas">Todas las localidades</option>
          {localidades.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              { value: 'grilla', label: 'Ver en grilla', Icon: FiGrid },
              { value: 'lista', label: 'Ver en lista', Icon: FiList },
            ] as const
          ).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setVista(value)}
              aria-pressed={vista === value}
              className={`inline-flex h-full items-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition ${
                vista === value ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="text-[15px]" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {filtrados.length} {filtrados.length === 1 ? 'socio' : 'socios'}
        {filtrados.length !== socios.length ? ` de ${socios.length}` : ''}
      </p>

      {filtrados.length === 0 ? (
        <div className="mt-6 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center text-sm text-slate-500">
          No encontramos socios con esos criterios.
        </div>
      ) : (
        <div
          className={`mt-6 grid gap-5 ${
            vista === 'grilla' ? 'md:grid-cols-2 xl:grid-cols-3' : 'max-w-4xl grid-cols-1'
          }`}
        >
          {filtrados.map((socio) => (
            <TarjetaSocio key={socio.id} socio={socio} />
          ))}
        </div>
      )}
    </>
  )
}
