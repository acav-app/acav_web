import { NextResponse } from 'next/server'

import { guardarDatosBorrador, obtenerBorradorIngreso } from '@/lib/solicitudes/service'
import { draftTokenFromRequest } from '@/lib/solicitudes/draft-cookie'
import { draftApiError } from '@/lib/solicitudes/draft-api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(request: Request, { params }: Params) {
  try {
    const result = await obtenerBorradorIngreso(params.id, draftTokenFromRequest(request, params.id))
    const documentos = Object.fromEntries(Object.entries(result.documentos).map(([slot, documento]) => {
      if (!documento) return [slot, undefined]
      const { key: _key, ...metadata } = documento
      return [slot, metadata]
    }))
    return NextResponse.json({ ...result, documentos }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return draftApiError(error)
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const result = await guardarDatosBorrador(params.id, draftTokenFromRequest(request, params.id), await request.json())
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return draftApiError(error)
  }
}
