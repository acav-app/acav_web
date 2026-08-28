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
      {/* Sección Hero + Formulario Integrado (Full Minimal, UI UX) */}
      <section className="py-section md:py-section-lg bg-slate-50/50">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16 xl:gap-20 items-stretch">
            {/* Columna Izquierda: Mensaje y Datos de contacto */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600">Contacto</p>
                <h1 className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-slate-900 md:text-[42px]">
                  Hablemos
                </h1>
                <p className="mt-5 text-sm leading-7 text-slate-600 md:text-[15px] md:leading-8 max-w-lg">
                  Escribinos, llamanos o acercate a nuestra sede en el centro de Córdoba. Estamos para acompañar a las agencias de la provincia y potenciar el sector.
                </p>

                <div className="mt-10 space-y-6">
                  {datos.map(({ Icon, label, value, href }) => (
                    <div key={label} className="flex gap-4 group">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-primary-500 transition group-hover:text-primary-600">
                        <Icon className="text-[17px]" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h2>
                        <div className="mt-1 text-sm font-semibold text-slate-800">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de asociarse + Redes Integradas */}
              <div className="mt-12 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase text-primary-600">¿Querés asociarte?</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">Completá la solicitud de ingreso.</p>
                  </div>
                  <Link
                    href="/socios/asociate"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-500 px-5 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-accent-600 shadow-[0_10px_25px_rgba(249,73,16,0.15)]"
                  >
                    Asociate
                    <FiArrowRight />
                  </Link>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#04112e] px-6 py-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Síguenos en redes</p>
                  <div className="flex gap-2">
                    {redes.map(({ label, Icon, href }) => (
                      <a
                        key={label}
                        href={href ?? '#'}
                        target={href ? '_blank' : undefined}
                        rel={href ? 'noopener noreferrer' : undefined}
                        aria-label={label}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="text-[14px]" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario Minimalista */}
            <div className="flex flex-col justify-center rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-500">¿Tienes dudas?</p>
                <h2 className="mt-1.5 text-xl font-extrabold text-slate-900 md:text-2xl">Enviá un mensaje</h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Dejanos tu consulta y nos pondremos en contacto a la brevedad.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Mapa Full Width Minimalista */}
      <section className="bg-white">
        <div className="w-full h-[400px] md:h-[450px] relative border-t border-slate-100 overflow-hidden">
          <iframe
            src={MAPA}
            title="Ubicación de ACAV"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 grayscale opacity-85 transition duration-500 hover:grayscale-0"
          />
        </div>
      </section>
    </>
  )
}
