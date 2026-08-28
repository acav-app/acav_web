import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { deleteSocio, getSocio, normalizeSocio, updateSocio } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const socio = await getSocio(params.id)
    if (!socio) return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 })
    return NextResponse.json({ item: socio })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const socio = await updateSocio(params.id, normalizeSocio(await request.json()))
    return NextResponse.json({ item: socio })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    await deleteSocio(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
