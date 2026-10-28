import type { Metadata } from 'next'

import FirmaAvalClient from './firma-aval-client'

export const metadata: Metadata = {
  title: 'Revisión y firma de aval | ACAV',
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'no-referrer',
}

export default function FirmaAvalPage({ params }: { params: { token: string } }) {
  return <FirmaAvalClient token={params.token} />
}
