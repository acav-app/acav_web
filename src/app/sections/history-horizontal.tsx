import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "../config/site";

export default function HistorySection() {
  return (
    <section id="historia" className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary-600">
              Nuestra historia
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {siteConfig.sections.history.description}
            </h2>
          </div>
          <Link
            href={siteConfig.sections.history.cta.href}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary-600 px-5 text-xs font-bold uppercase text-white shadow-[0_14px_40px_rgba(0,136,216,0.2)] transition hover:bg-primary-700"
          >
            {siteConfig.sections.history.cta.label}
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] md:px-7 md:py-8">
          <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {siteConfig.sections.history.timeline.map((item) => (
              <article
                key={item.year}
                className="group w-[240px] shrink-0 snap-start rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <Image
                    src={item.media}
                    alt={item.title}
                    width={520}
                    height={360}
                    className="h-36 w-full object-cover grayscale transition duration-500 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.0)_0%,rgba(15,23,42,0.55)_82%)]"></div>
                  <div className="absolute bottom-3 left-4">
                    <p className="text-[11px] font-bold uppercase text-white">
                      {item.year}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-5">
                  <p className="text-base font-bold text-slate-900">{item.title}</p>
                  <p className="mt-2.5 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

