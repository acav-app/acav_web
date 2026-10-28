import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { saveAssociationCtaSettings } from '@/lib/admin/association-cta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    await requireSessionUser()
    const settings = await saveAssociationCtaSettings(await request.json())
    return NextResponse.json({ settings })
  } catch (error) {
    return handleApiError(error)
  }
}
