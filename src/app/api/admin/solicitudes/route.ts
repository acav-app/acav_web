import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { listSolicitudes } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireSessionUser()
    return NextResponse.json({ items: await listSolicitudes() })
  } catch (error) {
    return handleApiError(error)
  }
}
