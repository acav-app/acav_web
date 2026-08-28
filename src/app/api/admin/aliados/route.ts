import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { createAliado, listAliados, normalizeAliado } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireSessionUser()
    return NextResponse.json({ items: await listAliados() })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireSessionUser()
    const aliado = await createAliado(normalizeAliado(await request.json()))
    return NextResponse.json({ item: aliado }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
