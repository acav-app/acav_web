import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsappBtn({ phone }: { phone: string }) {
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 md:bottom-8 md:left-8 z-50 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-green-500 text-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-green-600 transition-all duration-300 hover:scale-110 group"
      aria-label="Contactar por WhatsApp"
    >
      <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
      <FaWhatsapp className="relative text-3xl" />
    </a>
  )
}
