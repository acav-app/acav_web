'use client'

import { usePathname } from 'next/navigation'

import WhatsappBtn from './whatsapp-btn'

export default function WhatsappFloating({ phone }: { phone: string }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <WhatsappBtn phone={phone} />
}
