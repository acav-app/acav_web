import 'server-only'

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { DraftAccessError } from './draft-errors'

export function draftApiError(error: unknown) {
  const headers = { 'Cache-Control': 'no-store' }
  if (error instanceof DraftAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers })
  }
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ error: 'Los datos del borrador no son válidos. Revisá el formulario.', code: 'INVALID_DRAFT_DATA' }, { status: 400, headers })
  }
  console.error('[solicitudes-ingreso-api]', error instanceof Error ? error.message : 'service-unavailable')
  return NextResponse.json({
    error: 'El servicio de inscripción no está disponible en este momento. Tu borrador no se descartó; intentá nuevamente en unos instantes.',
    code: 'DRAFT_SERVICE_UNAVAILABLE',
  }, { status: 503, headers })
}
