import type { Metadata } from 'next'
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiHash,
  FiMail,
  FiMapPin,
  FiPercent,
  FiPhone,
  FiShield,
  FiUsers,
} from 'react-icons/fi'

import { siteConfig } from '../../config/site'

export const metadata: Metadata = {
  title: 'Data Fiscal | ACAV',
  description: 'Información fiscal e institucional de la Asociación Cordobesa de Agencias de Viajes.',
}

export default function DataFiscalPage() {
  const { dataFiscal } = siteConfig.institucional

  const registrales = [
    { Icon: FiShield, label: 'Razón Social', value: dataFiscal.razonSocial },
    { Icon: FiHash, label: 'C.U.I.T.', value: dataFiscal.cuit },
    { Icon: FiBriefcase, label: 'Tipo de persona', value: dataFiscal.tipoPersona },
    { Icon: FiCalendar, label: 'Fecha de contrato social', value: dataFiscal.fechaContratoSocial },
    { Icon: FiPercent, label: 'Frente al IVA', value: dataFiscal.iva },
    { Icon: FiUsers, label: 'Empleador registrante', value: dataFiscal.empleador },
    { Icon: FiMapPin, label: 'Provincia / Localidad', value: `${dataFiscal.provincia}, ${dataFiscal.localidad}` },
  ]

  const contacto = [
    { Icon: FiMapPin, label: 'Domicilio fiscal', value: dataFiscal.domicilioFiscal, href: null },
    { Icon: FiMail, label: 'Email oficial', value: 'info@acav.org.ar', href: 'mailto:info@acav.org.ar' },
    { Icon: FiPhone, label: 'Teléfono', value: '(0351) 422 4425', href: 'tel:+543514224425' },
  ]

  return (
    <section className="py-section md:py-section-lg bg-slate-50/40">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Header minimal */}
          <header className="mb-12 border-b border-slate-200/60 pb-8 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600">Institucional</p>
            <h1 className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-slate-900 md:text-[42px]">
              Información Fiscal
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base max-w-2xl">
              Datos fiscales y constitucionales oficiales de la Asociación Cordobesa de Agencias de Viajes, conforme a las normativas de transparencia y AFIP vigentes.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            {/* Columna Izquierda: Datos Registrales */}
            <div className="space-y-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Datos Registrales y Tributarios</h2>
              
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm divide-y divide-slate-100">
                {registrales.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                        <Icon className="text-[15px]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-500">{label}</span>
                    </div>
                    <span className="text-right text-sm font-bold text-slate-950 truncate max-w-[220px]">
                      {value ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Información de contacto / Domicilio */}
            <div className="space-y-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-semibold">Ubicación y Contacto</h2>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                {contacto.map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4 items-start pb-4 last:pb-0 border-b border-slate-100 last:border-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                      <Icon className="text-[16px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h3>
                      <div className="mt-1 text-sm font-semibold leading-relaxed text-slate-800 break-words">
                        {href ? (
                          <a href={href} className="transition hover:text-primary-600 block">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Sello de transparencia sutil / AFIP Mock */}
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <div className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                    <FiCheckCircle className="text-lg" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Entidad Verificada</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Sujeta a fiscalización de la Inspección de Personas Jurídicas de la Provincia de Córdoba.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
