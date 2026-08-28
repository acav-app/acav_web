import { NextResponse } from 'next/server'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { uploadImage, UPLOAD_FOLDERS, type UploadFolder } from '@/lib/admin/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await requireSessionUser()

    const formData = await request.formData()
    const file = formData.get('file')
    const folder = String(formData.get('folder') ?? 'socios')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
    }
    if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json({ error: 'Carpeta de destino inválida.' }, { status: 400 })
    }

    return NextResponse.json({ url: await uploadImage(file, folder) }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
