import { NextResponse } from 'next/server'

import { getAssociationCtaSettings } from '@/lib/admin/association-cta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getAssociationCtaSettings()

  return NextResponse.json(
    { settings },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
