import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { createSocio, listSocios, normalizeSocio } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireSessionUser()
    return NextResponse.json({ items: await listSocios() })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireSessionUser()
    const socio = await createSocio(normalizeSocio(await request.json()))
    return NextResponse.json({ item: socio }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
