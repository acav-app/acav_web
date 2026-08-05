import { siteConfig } from "../config/site";
import Link from "next/link";
import { FiBookOpen, FiBriefcase, FiShield, FiUsers } from "react-icons/fi";

export default function AboutAcavSection() {
  const pillarIcons = [FiShield, FiBookOpen, FiBriefcase, FiUsers];

  return (
    <section id="institucional" className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase text-primary-600">
              Sobre ACAV
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              Trabajamos por el crecimiento y la profesionalización del sector turístico
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
              {siteConfig.sections.about.description}
            </p>

            <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {siteConfig.sections.about.pillars.map((pillar, index) => {
                const Icon = pillarIcons[index] ?? FiUsers;

                return (
                  <div
                    key={pillar.title}
                    className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary-600 transition duration-300 group-hover:bg-primary-100">
                        <Icon />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase text-slate-900">
                          {pillar.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {pillar.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="#institucional"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary-600 px-5 text-xs font-bold uppercase text-white transition hover:bg-primary-700"
            >
              Conocé más sobre ACAV
            </Link>
          </div>

          <div>
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-navy-950 shadow-[0_22px_60px_rgba(2,6,23,0.22)]">
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={siteConfig.hero.video.poster}
              >
                <source src={siteConfig.hero.video.src} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.7)_74%)]"></div>
              <div className="relative z-10 flex h-[280px] items-center justify-center md:h-[320px]">
                <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition duration-300 group-hover:bg-white/15">
                  <span className="sr-only">Ver video</span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 8.5V15.5L16 12L10 8.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-5 left-5 right-5 z-10">
                <p className="text-[11px] font-bold uppercase text-primary-200">
                  {siteConfig.brand.longName}
                </p>
                <p className="mt-2 text-xl font-bold leading-tight text-white">
                  {siteConfig.brand.tagline}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {siteConfig.sections.about.quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-bold uppercase text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
