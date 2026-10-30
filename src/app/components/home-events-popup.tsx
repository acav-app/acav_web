'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiX } from 'react-icons/fi'

const events = [
  {
    title: 'Workshop',
    eyebrow: 'ENCUENTRO PROFESIONAL',
    description: 'Conectá con quienes impulsan la industria turística.',
    image: '/images/hero.png',
    imageAlt: 'Profesionales participando de un encuentro de turismo',
    href: 'https://acreditacion.rafarearte.com/registro/registro-publico.html?eventId=48',
  },
  {
    title: 'Mercado de Viajes',
    eyebrow: 'DESTINOS Y EXPERIENCIAS',
    description: 'Descubrí propuestas, destinos y experiencias para viajar.',
    image: '/images/mercado_de_viajes.png',
    imageAlt: 'Gráfica promocional de Mercado de Viajes',
    href: 'https://acreditacion.rafarearte.com/registro/registro-publico.html?eventId=47',
  },
]

export default function HomeEventsPopup() {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 450)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
  }, [open])

  function closePopup() {
    setOpen(false)
  }

  const overlayTransition = { duration: prefersReducedMotion ? 0.12 : 0.3 }
  const panelTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { type: 'spring' as const, stiffness: 280, damping: 25, mass: 0.85 }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="home-events-title"
      aria-describedby="home-events-description"
      onCancel={(event) => {
        event.preventDefault()
        closePopup()
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-slate-900 backdrop:bg-transparent"
    >
      <AnimatePresence
        onExitComplete={() => {
          if (!open && dialogRef.current?.open) dialogRef.current.close()
        }}
      >
        {open ? (
          <motion.div
            key="events-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={(event) => {
              if (event.target === event.currentTarget) closePopup()
            }}
            className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[6px] sm:p-6"
          >
            <motion.section
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 24, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 12, scale: 0.98 }
              }
              transition={panelTransition}
              className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-[900px] overflow-y-auto overscroll-contain rounded-[26px] border border-white/70 bg-white/95 shadow-[0_32px_100px_rgba(2,12,35,0.35)] backdrop-blur-2xl sm:max-h-none sm:overflow-hidden sm:rounded-[32px]"
            >
              <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:gap-5 sm:px-8 sm:pb-5 sm:pt-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">
                    AGENDA ACAV
                  </p>
                  <h2
                    id="home-events-title"
                    className="mt-2 text-[21px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[30px]"
                  >
                    Encontrémonos en el próximo evento
                  </h2>
                  <p
                    id="home-events-description"
                    className="mt-1.5 max-w-xl text-[13px] leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6"
                  >
                    Dos propuestas para conectar con el turismo. Elegí la tuya y reservá tu lugar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePopup}
                  aria-label="Cerrar anuncios de eventos"
                  className="-mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:size-11"
                >
                  <FiX aria-hidden="true" className="text-[19px]" />
                </button>
              </div>

              <div className="grid gap-2.5 px-3 pb-3 sm:grid-cols-2 sm:gap-4 sm:px-8 sm:pb-8">
                {events.map((event, index) => (
                  <motion.a
                    key={event.title}
                    href={event.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Inscribite a ${event.title} (abre en una pestaña nueva)`}
                    initial={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.12 : 0.35,
                      delay: prefersReducedMotion ? 0 : 0.12 + index * 0.08,
                    }}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[3/1] w-full overflow-hidden bg-slate-100 sm:aspect-[2/1]">
                      <Image
                        src={event.image}
                        alt={event.imageAlt}
                        fill
                        sizes="(max-width: 639px) 90vw, (max-width: 900px) 42vw, 390px"
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex flex-1 items-end justify-between gap-3 p-3 sm:gap-4 sm:p-5">
                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary-600 sm:text-[9px]">
                          {event.eyebrow}
                        </p>
                        <h3 className="mt-1 text-base font-bold leading-tight text-slate-900 sm:mt-1.5 sm:text-xl">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:mt-1.5 sm:text-[13px] sm:leading-5">
                          {event.description}
                        </p>
                      </div>
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition duration-300 group-hover:bg-primary-600 sm:size-10">
                        <FiArrowUpRight aria-hidden="true" className="text-[17px]" />
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  )
}
