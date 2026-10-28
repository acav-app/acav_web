import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { listarSolicitudesIngreso } from '@/lib/solicitudes/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireIngresoAdmin()
    return NextResponse.json({ items: await listarSolicitudesIngreso() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return handleApiError(error)
  }
}
