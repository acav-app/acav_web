'use client'

import { useState } from 'react'
import Image from 'next/image'

interface BenefitCard {
  title: string
  image: string
  description?: string
}

export default function BenefitsCards({ items }: { items: BenefitCard[] }) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [pinnedCard, setPinnedCard] = useState<string | null>(null)

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ title, image, description }) => {
        const flipped = hoveredCard === title || pinnedCard === title

        return (
          <button
            key={title}
            type="button"
            aria-label={flipped ? `Volver al logo de ${title}` : `Ver el beneficio de ${title}`}
            aria-pressed={pinnedCard === title}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setHoveredCard(title)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') {
                setHoveredCard((current) => (current === title ? null : current))
              }
            }}
            onClick={() => setPinnedCard((current) => (current === title ? null : title))}
            className="group block w-full rounded-[22px] text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 [perspective:1000px]"
          >
            <span
              className={`relative block h-[250px] w-full rounded-[22px] transition-transform duration-700 ease-in-out motion-reduce:transition-none sm:h-[270px] ${
                flipped ? '[transform:rotateY(180deg)]' : 'group-focus-visible:[transform:rotateY(180deg)]'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span
                aria-hidden={flipped}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)] [backface-visibility:hidden]"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <span className="relative min-h-0 flex-1 bg-white">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-contain p-4 sm:p-5"
                  />
                </span>
                <span className="flex min-h-14 items-center justify-center border-t border-slate-100 bg-slate-50/70 px-3 py-3 text-center">
                  <span className="text-xs font-bold leading-5 text-slate-800 sm:text-sm">{title}</span>
                </span>
              </span>

              <span
                aria-hidden={!flipped}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-y-auto rounded-[22px] border border-primary-700 bg-primary-600 p-4 text-center text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-5"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <span className="text-xs font-extrabold leading-5 sm:text-sm">{title}</span>
                {description ? (
                  <span className="text-[11px] leading-5 text-white/90 sm:text-xs sm:leading-6">{description}</span>
                ) : null}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
