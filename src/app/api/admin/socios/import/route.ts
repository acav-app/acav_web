import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { createSocio, listSocios, normalizeSocio } from '@/lib/admin/repository'
import type { SocioInput } from '@/lib/admin/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await requireSessionUser()
    const payload = (await request.json()) as { items?: unknown[] }
    const items = Array.isArray(payload.items) ? payload.items : []

    if (items.length === 0) {
      return NextResponse.json({ error: 'No hay socios para importar.' }, { status: 400 })
    }

    const existentes = await listSocios()
    const legajosExistentes = new Set(existentes.map((socio) => socio.legajo).filter(Boolean))
    const nombresExistentes = new Set(existentes.map((socio) => socio.nombre.trim().toLowerCase()))

    const resultados = { creados: 0, saltados: 0, errores: [] as string[] }

    for (const raw of items) {
      try {
        const input = normalizeSocio(raw) as SocioInput & { legajo: string }

        if (input.legajo && legajosExistentes.has(input.legajo)) {
          resultados.saltados += 1
          continue
        }
        if (nombresExistentes.has(input.nombre.toLowerCase())) {
          resultados.saltados += 1
          continue
        }

        await createSocio(input)
        resultados.creados += 1

        if (input.legajo) legajosExistentes.add(input.legajo)
        nombresExistentes.add(input.nombre.toLowerCase())
      } catch (error) {
        resultados.errores.push(error instanceof Error ? error.message : 'No se pudo importar el socio.')
      }
    }

    return NextResponse.json(resultados)
  } catch (error) {
    return handleApiError(error)
  }
}
