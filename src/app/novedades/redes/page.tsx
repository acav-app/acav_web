import type { Metadata } from 'next'
import { FiFacebook, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi'

import InstagramFeedWidget from '../../components/instagram-feed-widget'
import PageAnimation from '../../components/page-animation'
import { siteConfig } from '../../config/site'

export const metadata: Metadata = {
  title: 'Redes | ACAV',
  description:
    'Así vive la comunidad ACAV: workshops, capacitaciones, testimonios y eventos. Seguinos en nuestras redes sociales.',
}

const redes = [
  { label: 'Instagram', Icon: FiInstagram, href: 'https://www.instagram.com/acavoficial/' },
  { label: 'Facebook', Icon: FiFacebook, href: 'https://www.facebook.com/acav.cba/' },
  { label: 'LinkedIn', Icon: FiLinkedin, href: 'https://www.linkedin.com/company/asociaci%C3%B3n-cordobesa-de-agencias-de-viajes/' },
  { label: 'YouTube', Icon: FiYoutube, href: '' },
]

export default function RedesPage() {
  return (
    <PageAnimation>
      <section className="py-section md:py-section-lg">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase text-primary-600">Novedades</p>
            <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">
              Así vive la comunidad ACAV
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              {siteConfig.sections.community.description}
            </p>
          </div>

          <div className="mt-9">
            <InstagramFeedWidget />
          </div>

          <div className="mt-12 rounded-[26px] bg-[#04112e] px-8 py-9 text-white md:px-10">
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">Seguinos</p>
            <p className="mt-2 text-[20px] font-bold leading-snug">
              Contenido, eventos y novedades del turismo cordobés.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {redes.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href ?? '#'}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/25 hover:bg-white/10"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Icon className="text-[16px]" />
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageAnimation>
  )
}
