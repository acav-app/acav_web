'use client'

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { siteConfig } from "../config/site";

export default function JoinSection() {
  const steps = useMemo(() => siteConfig.sections.join.steps, []);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="asociate" className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="grid gap-10 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 shadow-[0_22px_60px_rgba(15,23,42,0.06)] md:px-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase text-primary-600">
              Asociate a ACAV
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {siteConfig.sections.join.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Un proceso simple, claro e interactivo para sumarte y empezar a aprovechar beneficios, formación y comunidad.
            </p>

            <div className="mt-8 flex flex-col gap-2.5">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex items-center justify-between rounded-2xl border px-4.5 py-4 text-left transition ${
                    index === activeIndex
                      ? "border-primary-200 bg-white shadow-[0_14px_40px_rgba(0,136,216,0.1)]"
                      : "border-slate-200 bg-white/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex size-9 items-center justify-center rounded-full text-[11px] font-bold uppercase ${
                        index === activeIndex ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold uppercase text-slate-900">
                        {step.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] md:px-7 md:py-7">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase text-primary-600">
                Progreso
              </p>
              <p className="text-[11px] font-bold uppercase text-slate-500">
                Paso {activeIndex + 1} / {steps.length}
              </p>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary-600 transition-all duration-500"
                style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase text-slate-900">
                {steps[activeIndex]?.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {steps[activeIndex]?.description}
              </p>
            </div>

            <Link
              href={siteConfig.sections.join.cta.href}
              className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-5 text-xs font-bold uppercase text-white shadow-[0_14px_40px_rgba(249,73,16,0.2)] transition hover:bg-accent-600"
            >
              {siteConfig.sections.join.cta.label}
              <FiArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

