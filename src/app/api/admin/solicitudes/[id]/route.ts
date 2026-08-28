import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { deleteSolicitud, updateSolicitudEstado } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const solicitud = await updateSolicitudEstado(params.id, await request.json())
    return NextResponse.json({ item: solicitud })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    await deleteSolicitud(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
