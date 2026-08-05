import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { siteConfig } from "../config/site";

export default function ProjectsSection() {
  return (
    <section id="servicios" className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-primary-600">
              Proyectos ACAV
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              Innovación para el turismo
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Plataformas pensadas para potenciar empleabilidad, formación y oportunidades comerciales dentro de la comunidad.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0b2f6e,#0a1d45)] px-6 pb-6 pt-7 text-white shadow-[0_26px_70px_rgba(2,6,23,0.3)] md:px-7 md:pb-7 md:pt-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,136,216,0.28),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_44%)]"></div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase text-white/70">
                Plataforma laboral
              </p>
              <h3 className="mt-4 text-2xl font-bold leading-tight">{siteConfig.sections.employability.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">
                {siteConfig.sections.employability.description}
              </p>

              <div className="mt-7 flex items-start justify-between gap-5">
                <div className="flex-1">
                  <Link
                    href={siteConfig.sections.employability.cta.href}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-white/10 px-5 text-xs font-bold uppercase text-white transition hover:bg-white/15"
                  >
                    {siteConfig.sections.employability.cta.label}
                    <FiArrowRight className="ms-2 text-base" />
                  </Link>
                </div>
                <div className="relative hidden w-[200px] lg:block">
                  <Image
                    src="/images/app.png"
                    width={420}
                    height={340}
                    alt="Empleabilidad ACAV"
                    className="h-auto w-full rounded-2xl border border-white/15 bg-white/5 shadow-[0_16px_50px_rgba(2,6,23,0.32)]"
                  />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2.5">
                {siteConfig.sections.employability.metrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3.5">
                    <p className="text-lg font-bold leading-none">{item.value}</p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase text-white/75">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#f06f1c,#f94910)] px-6 pb-6 pt-7 text-white shadow-[0_26px_70px_rgba(2,6,23,0.22)] md:px-7 md:pb-7 md:pt-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(8,27,69,0.22),transparent_44%)]"></div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase text-white/75">
                Campus educativo
              </p>
              <h3 className="mt-4 text-2xl font-bold leading-tight">{siteConfig.sections.courses.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/85">
                {siteConfig.sections.courses.description}
              </p>

              <div className="mt-7 flex items-start justify-between gap-5">
                <div className="flex-1">
                  <Link
                    href={siteConfig.sections.courses.cta.href}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-white/15 px-5 text-xs font-bold uppercase text-white transition hover:bg-white/20"
                  >
                    {siteConfig.sections.courses.cta.label}
                    <FiArrowRight className="ms-2 text-base" />
                  </Link>
                </div>
                <div className="relative hidden w-[200px] lg:block">
                  <Image
                    src="/images/mobile-hori.png"
                    width={420}
                    height={340}
                    alt="Cursos ACAV"
                    className="h-auto w-full rounded-2xl border border-white/20 bg-white/5 shadow-[0_16px_50px_rgba(2,6,23,0.26)]"
                  />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2.5">
                {siteConfig.sections.courses.metrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3.5">
                    <p className="text-lg font-bold leading-none">{item.value}</p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase text-white/85">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

