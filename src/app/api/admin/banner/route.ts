import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { createBannerSlide, listBannerSlides, normalizeBannerSlide } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireSessionUser()
    return NextResponse.json({ items: await listBannerSlides() })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireSessionUser()
    const slide = await createBannerSlide(normalizeBannerSlide(await request.json()))
    return NextResponse.json({ item: slide }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
