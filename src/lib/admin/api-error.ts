import { NextResponse } from 'next/server'

import { UnauthorizedError } from '@/lib/admin/session'

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const message = error instanceof Error ? error.message : 'Error inesperado'
  console.error('[admin-api]', error)
  return NextResponse.json({ error: message }, { status: 400 })
}
