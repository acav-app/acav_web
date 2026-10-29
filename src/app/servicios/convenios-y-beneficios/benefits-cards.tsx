'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FiArrowLeft, FiArrowUpRight, FiCheckCircle, FiRefreshCw } from 'react-icons/fi'

export interface BenefitCard {
  title: string
  subtitle?: string
  image: string
  badges: string[]
  benefit: string
  contact?: {
    label: string
    href: string
    note?: string
    external?: boolean
  }
}

function BenefitFlipCard({ item }: { item: BenefitCard }) {
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const frontButtonRef = useRef<HTMLButtonElement>(null)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const focusBackAfterOpen = useRef(false)
  const focusFrontAfterClose = useRef(false)
  const flipped = hovered || pinned

  useEffect(() => {
    if (flipped && focusBackAfterOpen.current) {
      backButtonRef.current?.focus()
      focusBackAfterOpen.current = false
    } else if (!flipped && focusFrontAfterClose.current) {
      frontButtonRef.current?.focus()
      focusFrontAfterClose.current = false
    }
  }, [flipped])

  return (
    <article
      className="group h-full min-w-0 [perspective:1200px]"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false)
      }}
    >
      <div className="grid h-full w-full rounded-[24px] [transform-style:preserve-3d]">
        <div
          className={`col-start-1 row-start-1 grid h-full w-full rounded-[24px] transition-transform duration-700 ease-in-out motion-reduce:transition-none [transform-style:preserve-3d] ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <button
            ref={frontButtonRef}
            type="button"
            aria-label={`Ver beneficio y contacto de ${item.title}: ${item.badges.join(', ')}`}
            aria-expanded={flipped}
            aria-hidden={flipped}
            tabIndex={flipped ? -1 : 0}
            onClick={(event) => {
              focusBackAfterOpen.current = event.detail === 0
              setPinned(true)
            }}
            className="col-start-1 row-start-1 flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white p-0 text-left shadow-[0_4px_16px_rgba(15,23,42,0.035)] transition-[border-color,box-shadow] duration-300 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 [backface-visibility:hidden]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <span className="relative flex h-28 w-full shrink-0 items-center justify-center bg-slate-50/70 sm:h-32">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-4 sm:p-5"
              />
            </span>

            <span className="flex flex-1 flex-col p-4 sm:p-5">
              <span className="text-base font-bold leading-6 text-slate-900 sm:text-[17px]">{item.title}</span>
              {item.subtitle ? (
                <span className="mt-1 text-[11px] leading-4 text-slate-500">{item.subtitle}</span>
              ) : null}

              <span className="mt-3.5 flex flex-wrap gap-1.5">
                {item.badges.map((badge, index) => (
                  <span
                    key={badge}
                    className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-4 ${
                      index === 0
                        ? 'bg-accent-50 text-accent-700'
                        : 'border border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </span>

              <span className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500 transition group-hover:text-primary-700">
                <span>Ver beneficio</span>
                <FiRefreshCw aria-hidden="true" className="shrink-0 text-sm" />
              </span>
            </span>
          </button>

          <div
            aria-hidden={!flipped}
            className="col-start-1 row-start-1 flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.035)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h3 className="text-base font-bold leading-6 text-slate-900">{item.title}</h3>
                {item.subtitle ? <p className="mt-1 text-[11px] leading-4 text-slate-500">{item.subtitle}</p> : null}
              </div>
              <button
                ref={backButtonRef}
                type="button"
                aria-label={`Volver al frente de ${item.title}`}
                tabIndex={flipped ? 0 : -1}
                onClick={(event) => {
                  focusFrontAfterClose.current = event.detail === 0
                  setPinned(false)
                  setHovered(false)
                }}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <FiArrowLeft aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex flex-wrap gap-1.5">
                {item.badges.map((badge, index) => (
                  <span
                    key={badge}
                    className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-4 ${
                      index === 0 ? 'bg-accent-50 text-accent-700' : 'border border-slate-200 text-slate-600'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-700">
                  <FiCheckCircle aria-hidden="true" className="text-sm" />
                  Beneficio
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{item.benefit}</p>
              </div>

              {item.contact ? (
                <div className="mt-auto border-t border-slate-100 pt-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Contacto</p>
                  <a
                    href={item.contact.href}
                    target={item.contact.external ? '_blank' : undefined}
                    rel={item.contact.external ? 'noopener noreferrer' : undefined}
                    tabIndex={flipped ? 0 : -1}
                    className="mt-1.5 inline-flex max-w-full items-start gap-1.5 text-sm font-semibold leading-5 text-primary-700 underline decoration-primary-200 underline-offset-4 transition hover:text-primary-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    <span className="break-all">{item.contact.label}</span>
                    {item.contact.external ? <FiArrowUpRight aria-hidden="true" className="mt-0.5 shrink-0" /> : null}
                  </a>
                  {item.contact.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.contact.note}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function BenefitsCards({ items }: { items: BenefitCard[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <BenefitFlipCard key={item.title} item={item} />
      ))}
    </div>
  )
}
