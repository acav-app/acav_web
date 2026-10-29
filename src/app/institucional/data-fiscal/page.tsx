import type { Metadata } from 'next'
import {
  FiArrowUpRight,
  FiCalendar,
  FiHash,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPercent,
  FiPhone,
  FiUsers,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

import PageAnimation from '../../components/page-animation'
import { siteConfig } from '../../config/site'

export const metadata: Metadata = {
  title: 'Data Fiscal | ACAV',
  description: 'Información fiscal e institucional de la Asociación Cordobesa de Agencias de Viajes.',
}

export default function DataFiscalPage() {
  const { dataFiscal } = siteConfig.institucional

  const registrales = [
    { Icon: FiCalendar, label: 'Fecha de contrato social', value: dataFiscal.fechaContratoSocial },
    { Icon: FiPercent, label: 'Frente al IVA', value: dataFiscal.iva },
    { Icon: FiUsers, label: 'Empleador registrante', value: dataFiscal.empleador },
    { Icon: FiMapPin, label: 'Provincia / Localidad', value: `${dataFiscal.provincia}, ${dataFiscal.localidad}` },
  ]

  const direccionHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dataFiscal.domicilioFiscal)}`
  const contacto = [
    {
      Icon: FiMapPin,
      label: 'Domicilio fiscal',
      value: dataFiscal.domicilioFiscal,
      href: direccionHref,
      external: true,
      wide: true,
    },
    ...siteConfig.contact.emails.map(({ label, address }) => ({
      Icon: FiMail,
      label: `Email · ${label}`,
      value: address,
      href: `mailto:${address}`,
      external: false,
      wide: false,
    })),
    {
      Icon: FiPhone,
      label: 'Teléfono',
      value: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phoneHref}`,
      external: false,
      wide: false,
    },
    {
      Icon: FaWhatsapp,
      label: 'WhatsApp',
      value: siteConfig.contact.whatsappDisplay,
      href: `https://wa.me/${siteConfig.contact.whatsapp}`,
      external: true,
      wide: false,
    },
  ]

  return (
    <PageAnimation>
      <section className="bg-white py-section md:py-section-lg">
        <div className="container">
          <header className="border-b border-slate-200 pb-8 md:pb-9">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-600">Institucional</p>
              <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[38px]">
                Datos fiscales
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Información registral, tributaria y de contacto de la Asociación Cordobesa de Agencias de Viajes.
              </p>
            </div>
          </header>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
            <section
              aria-labelledby="registrales-title"
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">Registro</p>
                <h2 id="registrales-title" className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Datos registrales y tributarios
                </h2>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Razón social</dt>
                  <dd className="mt-2 break-words text-sm font-semibold leading-6 text-slate-900">
                    {dataFiscal.razonSocial}
                  </dd>
                </div>
                <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <FiHash aria-hidden="true" className="text-slate-400" />
                    C.U.I.T.
                  </dt>
                  <dd className="mt-2 break-words font-mono text-base font-bold tracking-tight text-slate-900">
                    {dataFiscal.cuit}
                  </dd>
                </div>
              </dl>

              <dl className="mt-3 divide-y divide-slate-100">
                <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500">Tipo de persona</dt>
                  <dd className="text-sm font-semibold text-slate-900">{dataFiscal.tipoPersona}</dd>
                </div>
                {registrales.map(({ Icon, label, value }) => (
                  <div key={label} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4">
                    <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Icon aria-hidden="true" className="shrink-0 text-slate-400" />
                      {label}
                    </dt>
                    <dd className="break-words text-sm font-semibold text-slate-900">{value ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section
              aria-labelledby="contacto-title"
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">Contacto</p>
                <h2 id="contacto-title" className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Domicilio y contacto
                </h2>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {contacto.map(({ Icon, label, value, href, external, wide }) => (
                  <div
                    key={label}
                    className={`min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 ${wide ? 'sm:col-span-2' : ''}`}
                  >
                    <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                      <Icon aria-hidden="true" className="shrink-0 text-primary-600" />
                      {label}
                    </dt>
                    <dd className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
                      <a
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="inline-flex max-w-full items-start gap-1 transition-colors hover:text-primary-600"
                      >
                        <span className="break-words">{value}</span>
                        {external ? (
                          <FiArrowUpRight aria-hidden="true" className="mt-1 shrink-0 text-xs text-slate-400" />
                        ) : null}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside className="mt-6 flex items-start gap-3 border-l-2 border-primary-500 py-1 pl-4 sm:mt-7">
            <FiInfo aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <h2 className="text-xs font-semibold text-slate-800">Marco institucional</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                La Asociación está sujeta a fiscalización de la Inspección de Personas Jurídicas de la Provincia de Córdoba.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PageAnimation>
  )
}
