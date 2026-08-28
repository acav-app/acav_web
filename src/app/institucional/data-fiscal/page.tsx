import type { Metadata } from 'next'
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPercent,
  FiPhone,
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
    { Icon: FiBriefcase, label: 'Tipo de persona', value: dataFiscal.tipoPersona },
    { Icon: FiCalendar, label: 'Fecha de contrato social', value: dataFiscal.fechaContratoSocial },
    { Icon: FiPercent, label: 'Condición frente al IVA', value: dataFiscal.iva },
    { Icon: FiUsers, label: 'Empleador', value: dataFiscal.empleador },
    { Icon: FiMapPin, label: 'Provincia', value: dataFiscal.provincia },
    { Icon: FiMapPin, label: 'Localidad', value: dataFiscal.localidad },
  ]

  const contacto = [
    { Icon: FiMapPin, label: 'Domicilio fiscal', value: dataFiscal.domicilioFiscal, href: null },
    { Icon: FiMail, label: 'Email', value: 'info@acav.org.ar', href: 'mailto:info@acav.org.ar' },
    { Icon: FiPhone, label: 'Tel / Fax', value: '(0351) 422 4425', href: 'tel:+543514224425' },
  ]

  return (
    <section className="py-section md:py-section-lg">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase text-primary-600">Institucional</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">Data Fiscal</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
            Datos registrales y fiscales de la Asociación Cordobesa de Agencias de Viajes.
          </p>
        </div>


        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Datos registrales</h2>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {registrales.map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-slate-200 bg-white p-5 transition hover:border-primary-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Icon className="text-[15px]" />
                  </div>
                  <dt className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="mt-1 text-[15px] font-bold leading-snug text-slate-900">
                    {value ?? <span className="font-normal text-slate-400">A completar</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Contacto institucional</h2>

            <dl className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-[18px] border border-slate-200 bg-white">
              {contacto.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 px-6 py-5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="text-[15px]" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold leading-6 text-slate-900">
                      {href ? (
                        <a href={href} className="transition hover:text-primary-600">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
