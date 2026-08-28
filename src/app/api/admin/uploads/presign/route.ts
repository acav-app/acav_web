import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { presignUpload, UPLOAD_FOLDERS, type UploadFolder } from '@/lib/admin/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await requireSessionUser()

    const { contentType, size, folder } = (await request.json()) as {
      contentType?: string
      size?: number
      folder?: string
    }

    if (!contentType || typeof size !== 'number') {
      return NextResponse.json({ error: 'Faltan datos del archivo.' }, { status: 400 })
    }
    if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json({ error: 'Carpeta de destino inválida.' }, { status: 400 })
    }

    return NextResponse.json(await presignUpload(contentType, size, folder as UploadFolder))
  } catch (error) {
    return handleApiError(error)
  }
}
