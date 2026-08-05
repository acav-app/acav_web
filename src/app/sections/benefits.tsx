import Image from "next/image";
import Link from "next/link";
import {
  FiBriefcase,
  FiCalendar,
  FiHome,
  FiLink,
  FiStar,
  FiTag,
  FiUsers,
} from "react-icons/fi";

import { siteConfig } from "../config/site";

const iconMap = {
  tag: FiTag,
  calendar: FiCalendar,
  briefcase: FiBriefcase,
  users: FiUsers,
  link: FiLink,
  home: FiHome,
  spark: FiStar,
} as const;

export default function BenefitsSection() {
  const featured = siteConfig.sections.benefits.featured;

  return (
    <section id="socios" className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary-600">
              Beneficios para socios
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {siteConfig.sections.benefits.description}
            </h2>
          </div>
          <Link
            href={siteConfig.sections.benefits.cta.href}
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-xs font-bold uppercase text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
          >
            {siteConfig.sections.benefits.cta.label}
          </Link>
        </div>

        <div className="mt-10 grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)] md:p-7 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            {featured.media.type === "image" ? (
              <Image
                src={featured.media.src}
                alt={featured.title}
                width={840}
                height={640}
                className="h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.65)_72%)]"></div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[11px] font-bold uppercase text-white/75">
                Destacado
              </p>
              <p className="mt-2.5 text-xl font-bold leading-tight text-white">{featured.title}</p>
              <p className="mt-2.5 text-sm leading-6 text-white/75">{featured.description}</p>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {siteConfig.sections.benefits.items.map((benefit) => {
              const Icon = iconMap[benefit.icon as keyof typeof iconMap] ?? FiTag;

              return (
                <div
                  key={benefit.title}
                  className="group rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary-600 transition duration-300 group-hover:bg-primary-100">
                    <Icon />
                  </div>
                  <p className="mt-4 text-sm font-bold uppercase text-slate-900">
                    {benefit.title}
                  </p>
                  <p className="mt-2.5 text-sm leading-6 text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
