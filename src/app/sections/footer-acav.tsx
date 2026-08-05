import Image from "next/image";
import Link from "next/link";
import { FiInstagram, FiLinkedin, FiMail, FiMapPin, FiPhone, FiYoutube } from "react-icons/fi";

import { siteConfig } from "../config/site";

export default function FooterAcav() {
  const contact = siteConfig.contact;

  return (
    <footer className="bg-navy-950 pb-8 pt-14 text-white">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
          <div>
            <Image
              src="/images/logo.png"
              alt="ACAV"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
            <p className="mt-4.5 text-sm leading-6 text-white/70">
              {siteConfig.brand.longName}. Desde 1963 representando, conectando y fortaleciendo a las agencias de viajes de Córdoba.
            </p>

            <div className="mt-7 space-y-2.5 text-sm text-white/70">
              {contact.address ? (
                <div className="flex items-start gap-2.5">
                  <FiMapPin className="mt-1 text-sm text-white/70" />
                  <span>{contact.address}</span>
                </div>
              ) : null}
              {contact.email ? (
                <div className="flex items-start gap-2.5">
                  <FiMail className="mt-1 text-sm text-white/70" />
                  <a href={`mailto:${contact.email}`} className="transition hover:text-white">
                    {contact.email}
                  </a>
                </div>
              ) : null}
              {contact.phone ? (
                <div className="flex items-start gap-2.5">
                  <FiPhone className="mt-1 text-sm text-white/70" />
                  <a href={`tel:${contact.phone}`} className="transition hover:text-white">
                    {contact.phone}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="mt-7 flex items-center gap-2.5">
              {contact.social.instagram ? (
                <a
                  href={contact.social.instagram}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-primary-200 hover:bg-white/10 hover:text-white"
                  aria-label="Instagram"
                >
                  <FiInstagram className="text-sm" />
                </a>
              ) : null}
              {contact.social.youtube ? (
                <a
                  href={contact.social.youtube}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-primary-200 hover:bg-white/10 hover:text-white"
                  aria-label="YouTube"
                >
                  <FiYoutube className="text-sm" />
                </a>
              ) : null}
              {contact.social.linkedin ? (
                <a
                  href={contact.social.linkedin}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-primary-200 hover:bg-white/10 hover:text-white"
                  aria-label="LinkedIn"
                >
                  <FiLinkedin className="text-sm" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-white/75">
                Accesos rápidos
              </p>
              <div className="mt-5 flex flex-col gap-2.5 text-sm text-white/70">
                {siteConfig.nav.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href={siteConfig.nav.cta.href} className="transition hover:text-white">
                  {siteConfig.nav.cta.label}
                </Link>
              </div>
            </div>

            <div id="estatuto">
              <p className="text-[11px] font-bold uppercase text-white/75">
                Institucional
              </p>
              <div className="mt-5 flex flex-col gap-2.5 text-sm text-white/70">
                <Link href="#historia" className="transition hover:text-white">
                  Nuestra historia
                </Link>
                <Link href="#comision" className="transition hover:text-white">
                  Comisión directiva
                </Link>
                <Link href="#asociate" className="transition hover:text-white">
                  Estatuto
                </Link>
              </div>
            </div>

            {contact.institutionalLogos.length > 0 ? (
              <div>
                <p className="text-[11px] font-bold uppercase text-white/75">
                  Alianzas
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {contact.institutionalLogos.map((logo) => (
                    <a
                      key={logo.label}
                      href={logo.href ?? "#"}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[10px] font-bold uppercase text-white/75 transition hover:border-primary-200 hover:bg-white/10"
                    >
                      <Image src={logo.src} alt={logo.label} width={90} height={28} className="h-6 w-auto" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-white/10"></div>
        <div className="mt-6 flex flex-col gap-2.5 text-center text-[11px] font-bold uppercase text-white/55 md:flex-row md:items-center md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} ACAV. Todos los derechos reservados.</p>
          <p>Córdoba, Argentina</p>
        </div>
      </div>
    </footer>
  );
}

