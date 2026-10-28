'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { FiPlay, FiInstagram } from 'react-icons/fi'

import 'swiper/css'

interface InstagramPost {
  id: string
  type: 'video' | 'image'
  src: string
  thumbnail: string
  permalink: string
  caption: string
  timestamp: string
}

interface InstagramFeedProps {
  posts: InstagramPost[]
}

export default function InstagramFeed({ posts }: InstagramFeedProps) {
  const displayPosts = posts.slice(0, 12)

  return (
    <div className="relative mt-9 w-full min-w-0 overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
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
        {displayPosts.map((post, index) => (
          <SwiperSlide key={`${post.id}-${index}`}>
            <article className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              <div className="relative aspect-[4/5] w-full">
                <Link
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver en Instagram: ${post.caption.slice(0, 50)}...`}
                  className="absolute inset-0 z-10"
                />
                <Image
                  src={post.thumbnail}
                  alt={post.caption.slice(0, 100) || 'Post de Instagram ACAV'}
                  fill
                  sizes="(max-width: 768px) 70vw, 24vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.16)_40%,rgba(2,6,23,0.82)_100%)]" />

                {post.type === 'video' ? (
                  <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md">
                    <FiPlay className="ml-0.5 text-[14px]" />
                  </span>
                ) : null}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <p className="text-[13px] font-bold leading-5 text-white line-clamp-2">
                    {post.caption.slice(0, 80) || 'Publicación de ACAV'}
                  </p>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                    aria-label="Ver en Instagram"
                  >
                    <FiInstagram className="text-[14px]" />
                  </a>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}