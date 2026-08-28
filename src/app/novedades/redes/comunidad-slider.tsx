'use client'

import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { FiPlay } from 'react-icons/fi'

import 'swiper/css'

import { siteConfig } from '../../config/site'

export default function ComunidadSlider() {
  const items = siteConfig.sections.community.items

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3200, disableOnInteraction: false }}
        loop
        speed={650}
        spaceBetween={14}
        slidesPerView={1.2}
        breakpoints={{
          480: { slidesPerView: 1.7 },
          768: { slidesPerView: 2.6, spaceBetween: 18 },
          1024: { slidesPerView: 3.6, spaceBetween: 20 },
          1280: { slidesPerView: 4.4, spaceBetween: 22 },
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={`${item.label}-${index}`}>
            <article className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={item.type === 'video' ? item.poster : item.src}
                  alt={item.label}
                  fill
                  sizes="(max-width: 768px) 70vw, 24vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.16)_40%,rgba(2,6,23,0.82)_100%)]" />

                {item.type === 'video' ? (
                  <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md">
                    <FiPlay className="ml-0.5 text-[14px]" />
                  </span>
                ) : null}

                <p className="absolute bottom-4 left-4 right-4 text-[13px] font-bold leading-5 text-white">
                  {item.label}
                </p>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
