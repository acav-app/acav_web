import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { deleteAliado, getAliado, normalizeAliado, updateAliado } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const aliado = await getAliado(params.id)
    if (!aliado) return NextResponse.json({ error: 'Aliado no encontrado' }, { status: 404 })
    return NextResponse.json({ item: aliado })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const aliado = await updateAliado(params.id, normalizeAliado(await request.json()))
    return NextResponse.json({ item: aliado })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    await deleteAliado(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
