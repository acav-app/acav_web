'use client'

import React, { useRef } from "react";
import Masonry from "react-masonry-css";

import { siteConfig } from "../config/site";

type MediaItem =
  | { type: "image"; src: string; label: string }
  | { type: "video"; src: string; poster: string; label: string };

const breakpointColumnsObj = {
  default: 4,
  1280: 3,
  768: 2,
  540: 1,
};

export default function CommunitySection() {
  const items = siteConfig.sections.community.items as unknown as MediaItem[];
  const refs = useRef<Record<number, HTMLVideoElement | null>>({});

  return (
    <section id="eventos" className="bg-navy-950 py-16 text-white md:py-20">
      <div className="container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary-200">
              Comunidad ACAV
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              {siteConfig.sections.community.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              {siteConfig.sections.community.description}
            </p>
          </div>
          <a
            href={siteConfig.sections.community.cta.href}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-xs font-bold uppercase text-white shadow-[0_12px_40px_rgba(2,6,23,0.3)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white/10"
          >
            {siteConfig.sections.community.cta.label}
          </a>
        </div>

        <div className="mt-10">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="-ml-4 flex w-auto"
            columnClassName="pl-4"
          >
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="group relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(2,6,23,0.32)]"
              >
                {item.type === "image" ? (
                  <div
                    className="aspect-[4/5] w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${item.src})` }}
                  ></div>
                ) : (
                  <video
                    ref={(el) => {
                      refs.current[index] = el;
                    }}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={item.poster}
                    onMouseEnter={() => refs.current[index]?.play()}
                    onMouseLeave={() => refs.current[index]?.pause()}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05)_0%,rgba(2,6,23,0.78)_76%)] opacity-90 transition duration-300 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[10px] font-bold uppercase text-white/85">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    </section>
  );
}

