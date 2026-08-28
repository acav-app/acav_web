import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { deleteBannerSlide, getBannerSlide, normalizeBannerSlide, updateBannerSlide } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const slide = await getBannerSlide(params.id)
    if (!slide) return NextResponse.json({ error: 'Slide no encontrado' }, { status: 404 })
    return NextResponse.json({ item: slide })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const slide = await updateBannerSlide(params.id, normalizeBannerSlide(await request.json()))
    return NextResponse.json({ item: slide })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    await deleteBannerSlide(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
