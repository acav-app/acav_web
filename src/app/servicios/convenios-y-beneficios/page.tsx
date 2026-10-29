import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight, FiBriefcase, FiCalendar, FiGlobe, FiMapPin, FiUsers } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import PageAnimation from '../../components/page-animation'
import { AssociationCtaLink } from '../../components/association-cta'
import BenefitsCards, { type BenefitCard } from './benefits-cards'

type ServiceCard = {
  title: string
  benefit: string
  Icon: IconType
  href?: string
  linkLabel?: string
}

export const metadata: Metadata = {
  title: 'Convenios y Beneficios | ACAV',
  description:
    'Descuentos exclusivos, convenios institucionales, capacitaciones, asesoramiento y networking para las agencias asociadas a ACAV.',
}

const sociosBeneficios: BenefitCard[] = [
  {
    title: 'Hospital Italiano',
    image: '/images/beneficios/hospital italiano.png',
    badges: ['20% OFF', 'Planes de salud'],
    benefit: '20% de descuento en todos los planes de salud para socios titulares, dependientes de agencias y monotributistas.',
    contact: { label: '351 340 3427', href: 'tel:+543513403427' },
  },
  {
    title: 'Sancor Salud',
    image: '/images/beneficios/images.jpg',
    badges: ['40–45% OFF', 'Mínimo 5 integrantes'],
    benefit: 'Descuentos de entre el 40% y el 45% sobre el precio de lista al asociarse como empresa. Precios exclusivos para cada socio y su grupo familiar (mínimo de 5 integrantes).',
    contact: { label: '351 736 0097', href: 'tel:+543517360097' },
  },
  {
    title: 'Banco Macro',
    image: '/images/beneficios/MACFRO.jpg',
    badges: ['Paquetes bonificados', 'Cobros integrales'],
    benefit: 'Servicios exclusivos para comercios con paquetes bonificados, ideales para monotributistas, autónomos y sociedades. Soluciones de cobro integrales (Payway, MODO y QR Full Macro), créditos instantáneos, tarjeta Visa Business, seguros y programa de referidos.',
  },
  {
    title: 'Savia Group',
    subtitle: 'Sistema de gestión comercial, administrativa y contable',
    image: '/images/beneficios/savia group.jpg',
    badges: ['20% OFF', 'Fee de alta'],
    benefit: '20% de descuento en el costo de instalación (fee de alta) para nuevos usuarios de la plataforma.',
    contact: { label: '351 550 1680', href: 'tel:+543515501680' },
  },
  {
    title: 'TravelConnect',
    subtitle: 'Plataforma web, CRM y atención IA 24/7',
    image: '/images/beneficios/TRAVEL.png',
    badges: ['50% OFF web', 'U$S 75/mes'],
    benefit: '50% de bonificación sobre el valor de lista en el desarrollo de tu página web y abono mensual con tarifa preferencial exclusiva de U$S 75.',
    contact: {
      label: 'Contactar a TravelConnect',
      href: 'https://travelconnect.com.ar/#contacto',
      external: true,
    },
  },
  {
    title: 'Voy de Viaje',
    subtitle: 'Suplemento de turismo de La Voz del Interior',
    image: '/images/beneficios/VOY DE VIAJE.png',
    badges: ['50% OFF', 'Publicaciones'],
    benefit: '50% de descuento en publicaciones sobre el precio de tarifario en el suplemento y su portal web asociado.',
    contact: { label: 'voy@lavozdelinterior.com.ar', href: 'mailto:voy@lavozdelinterior.com.ar' },
  },
  {
    title: 'Hotel Howard Johnson',
    subtitle: 'Villa Carlos Paz',
    image: '/images/beneficios/HOWARD.jpg',
    badges: ['20% alojamiento', '10% Spa'],
    benefit: '20% de descuento en alojamiento y 10% de descuento en Spa.',
    contact: {
      label: 'reservas@hjvillacarlospaz.com.ar',
      href: 'mailto:reservas@hjvillacarlospaz.com.ar?cc=info%40acav.com.ar',
      note: 'Enviar el mail con copia a info@acav.com.ar.',
    },
  },
  {
    title: 'Hotel Yrigoyen / Y111',
    image: '/images/beneficios/HOTEL 111.png',
    badges: ['Salones bonificados', '50+ asistentes', '100+ · Habitación speaker'],
    benefit: 'Bonificación de salones para eventos de 50 o más asistentes, o por la contratación de dos servicios gastronómicos. Para eventos de 100 o más asistentes, incluye una habitación de cortesía para el speaker.',
    contact: { label: 'reservas1@y111hotel.com', href: 'mailto:reservas1@y111hotel.com' },
  },
  {
    title: 'Tren a las Nubes',
    image: '/images/beneficios/TREN DE LAS NUBES.jpg',
    badges: ['30 plazas por salida', 'Sin cargo hasta 5 días'],
    benefit: 'Cupo exclusivo de 30 plazas regulares bloqueadas por salida, con deadline sin cargo hasta 5 días antes del viaje.',
  },
]

const serviciosProfesionales: ServiceCard[] = [
  {
    title: 'Vinculación Laboral',
    benefit: 'Uso gratuito de la plataforma Red de Empleabilidad, exclusiva del rubro turismo, para publicar búsquedas laborales y recibir perfiles de candidatos.',
    Icon: FiUsers,
    href: '/servicios/empleabilidad',
    linkLabel: 'Conocer la plataforma',
  },
  {
    title: 'Asesoramiento Contable y Jurídico',
    benefit: 'Acompañamiento personalizado y adaptado a las necesidades operativas del sector turístico.',
    Icon: FiBriefcase,
  },
  {
    title: 'Trámites de Visas',
    benefit: 'Acompañamiento integral y tarifas preferenciales en la gestión de visas para destinos como Estados Unidos, Canadá, Australia, Reino Unido, China, Nueva Zelanda, entre muchos otros.',
    Icon: FiGlobe,
  },
]

const actividadesInstitucionales: ServiceCard[] = [
  {
    title: 'Congresos y Eventos',
    benefit: 'Tarifas preferenciales en capacitaciones, salidas a la FIT y eventos del sector.',
    Icon: FiCalendar,
    href: '/servicios/capacitaciones',
    linkLabel: 'Ver capacitaciones',
  },
  {
    title: 'Sede Institucional',
    benefit: 'Uso de nuestra Sede a precio exclusivo para actividades, reuniones o capacitaciones afines a tu agencia.',
    Icon: FiMapPin,
  },
]

function ServiceCards({ items }: { items: ServiceCard[] }) {
  return (
    <div className={`grid items-stretch gap-4 ${items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {items.map(({ title, benefit, Icon, href, linkLabel }) => (
        <article
          key={title}
          className="group flex h-full min-w-0 flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
            <Icon aria-hidden="true" className="text-xl" />
          </div>
          <h3 className="mt-5 text-base font-bold leading-6 text-slate-900 sm:text-lg">{title}</h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{benefit}</p>
          {href && linkLabel ? (
            <Link
              href={href}
              className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-primary-700 transition hover:text-primary-900"
            >
              {linkLabel}
              <FiArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  )
}

export default function ConveniosYBeneficiosPage() {
  return (
    <PageAnimation>
      <section className="service-hero service-hero--benefits relative isolate overflow-hidden bg-[linear-gradient(145deg,#15203B_0%,#1B2B50_55%,#15203B_100%)] text-white">
        <div aria-hidden="true" className="service-hero__glow service-hero__glow--benefits-one" />
        <div aria-hidden="true" className="service-hero__glow service-hero__glow--benefits-two" />
        <div aria-hidden="true" className="service-hero__shade" />

        <div className="container relative z-10 py-section md:py-section-lg">
          <div className="grid gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-300">Servicios · Socios</p>
              <h1 className="mt-3 text-[30px] font-bold leading-[1.1] text-white sm:text-[36px] md:text-[42px]">
                Convenios y Beneficios
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/75 md:text-base md:leading-8">
                Más beneficios, más oportunidades. Generamos convenios con instituciones y empresas para que tu agencia
                acceda a descuentos y condiciones preferenciales en hoteles, aerolíneas, asistencia al viajero y mucho
                más.
              </p>
              <AssociationCtaLink
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white shadow-[0_14px_32px_rgba(249,73,16,0.3)] transition hover:-translate-y-0.5 hover:bg-accent-600"
              >
                Quiero asociarme
                <FiArrowRight aria-hidden="true" />
              </AssociationCtaLink>
            </div>

            <div className="relative h-[240px] min-h-[240px] w-full overflow-hidden rounded-[26px] border border-white/15 bg-[#0B1B3B] shadow-[0_24px_70px_rgba(4,13,36,0.35)] sm:h-[320px] md:h-[380px] lg:h-[420px]">
              <Image
                src="/images/descuentos_exclusivos.jpg"
                alt="Asesoramiento y beneficios para agencias asociadas a ACAV"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07142f]/65 via-transparent to-[#07142f]/10" />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-[#15203B]/65 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-md sm:bottom-5 sm:left-5">
                Convenios exclusivos para socios
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 pb-section sm:pt-10 md:pt-14 md:pb-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Beneficios para socios</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]">
              Todo lo que incluye ser parte de ACAV
            </h2>
          </div>

          <BenefitsCards items={sociosBeneficios} />

          <section
            aria-labelledby="servicios-profesionales-title"
            className="mt-14 border-t border-slate-200 pt-12 md:mt-16 md:pt-14"
          >
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-600">
                Acompañamiento para tu agencia
              </p>
              <h2
                id="servicios-profesionales-title"
                className="mt-3 text-[24px] font-bold leading-tight text-slate-900 md:text-[30px]"
              >
                Servicios Profesionales y Asesoramiento
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Herramientas y orientación pensadas para acompañar el trabajo cotidiano de las agencias de viajes.
              </p>
            </div>

            <div className="mt-8">
              <ServiceCards items={serviciosProfesionales} />
            </div>

            <section aria-labelledby="eventos-institucionales-title" className="mt-14 md:mt-16">
              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-600">Comunidad ACAV</p>
                <h3
                  id="eventos-institucionales-title"
                  className="mt-3 text-[21px] font-bold leading-tight text-slate-900 md:text-[26px]"
                >
                  Eventos, Capacitaciones y Espacios Institucionales
                </h3>
              </div>
              <div className="mt-7">
                <ServiceCards items={actividadesInstitucionales} />
              </div>
            </section>
          </section>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-[26px] bg-[#04112e] px-6 py-7 text-white sm:px-8 sm:py-8 md:px-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">¿Todavía no sos socio?</p>
              <p className="mt-2 text-[20px] font-bold leading-snug">
                Sumate y accedé a todos los convenios de ACAV.
              </p>
            </div>
            <AssociationCtaLink
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-[11px] font-bold uppercase text-white transition hover:-translate-y-0.5 hover:bg-accent-600"
            >
              Quiero asociarme
              <FiArrowRight />
            </AssociationCtaLink>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
