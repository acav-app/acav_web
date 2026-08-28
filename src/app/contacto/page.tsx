import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FiArrowRight,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiYoutube,
} from 'react-icons/fi'

import ContactForm from './contact-form'
import { siteConfig } from '../config/site'

export const metadata: Metadata = {
  title: 'Contacto | ACAV',
  description:
    'Contactate con la Asociación Cordobesa de Agencias de Viajes: Obispo Trejo 180 Piso 4, Córdoba. info@acav.org.ar · (0351) 422 4425.',
}

const DIRECCION = 'Obispo Trejo 180 Piso 4, Córdoba, Argentina, CP 5000'
const MAPA = `https://www.google.com/maps?q=${encodeURIComponent('Obispo Trejo 180, Córdoba, Argentina')}&output=embed`

const datos = [
  {
    Icon: FiMapPin,
    label: 'Dirección',
    value: DIRECCION,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION)}`,
  },
  { Icon: FiMail, label: 'Email', value: 'info@acav.org.ar', href: 'mailto:info@acav.org.ar' },
  { Icon: FiPhone, label: 'Tel / Fax', value: '(0351) 422 4425', href: 'tel:+543514224425' },
  { Icon: FiClock, label: 'Atención', value: 'Lunes a viernes de 9 a 17 h', href: null },
]

const redes = [
  { label: 'Instagram', Icon: FiInstagram, href: siteConfig.contact.social.instagram },
  { label: 'Facebook', Icon: FiFacebook, href: null },
  { label: 'LinkedIn', Icon: FiLinkedin, href: siteConfig.contact.social.linkedin },
  { label: 'YouTube', Icon: FiYoutube, href: siteConfig.contact.social.youtube },
]

export default function ContactoPage() {
  return (
    <>
      {/* Encabezado */}
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Contacto</p>
            <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
              Hablemos
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Escribinos, llamanos o acercate a nuestra sede en el centro de Córdoba. Estamos para acompañar a las
              agencias de viajes de la provincia.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-bold uppercase text-primary-600">Formulario</p>
            <h2 className="mt-3 text-[22px] font-bold leading-tight text-slate-900 md:text-[26px]">
              Escribinos un mensaje
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              Dejanos tu consulta y te respondemos a la brevedad.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-xl">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Información y mapa */}
      <section className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
            <div>
              <dl className="divide-y divide-slate-100 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                {datos.map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4 px-6 py-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon className="text-[16px]" />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="mt-1 text-sm font-semibold leading-6 text-slate-900">
                        {href ? (
                          <a
                            href={href}
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="transition hover:text-primary-600"
                          >
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

              <div className="mt-6 rounded-[22px] bg-[#04112e] p-7 text-white">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">Seguinos</p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {redes.map(({ label, Icon, href }) => (
                    <a
                      key={label}
                      href={href ?? '#'}
                      target={href ? '_blank' : undefined}
                      rel={href ? 'noopener noreferrer' : undefined}
                      aria-label={label}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="text-[16px]" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50/70 px-7 py-6">
                <div>
                  <p className="text-[11px] font-bold uppercase text-primary-600">¿Querés asociarte?</p>
                  <p className="mt-1.5 text-[15px] font-bold text-slate-900">Completá la solicitud de ingreso.</p>
                </div>
                <Link
                  href="/socios/asociate"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  Asociate
                  <FiArrowRight />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100">
              <iframe
                src={MAPA}
                title="Ubicación de ACAV"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[420px] w-full border-0 lg:h-full lg:min-h-[560px]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
