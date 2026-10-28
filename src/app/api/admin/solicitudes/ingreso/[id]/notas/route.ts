import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireIngresoAdmin } from '@/lib/solicitudes/admin'
import { guardarNotasIngreso } from '@/lib/solicitudes/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireIngresoAdmin()
    const body = (await request.json()) as { notas?: string }
    await guardarNotasIngreso(params.id, body.notas ?? '')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
