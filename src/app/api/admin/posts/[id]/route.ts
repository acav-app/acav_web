import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { handleApiError } from '@/lib/admin/api-error'
import { requireSessionUser } from '@/lib/admin/session'
import { deletePost, getPost, normalizePost, updatePost } from '@/lib/admin/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const post = await getPost(params.id)
    if (!post) return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
    return NextResponse.json({ item: post })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const previous = await getPost(params.id)
    const post = await updatePost(params.id, normalizePost(await request.json()))
    revalidatePath('/novedades/actualidad')
    if (previous?.slug) revalidatePath(`/novedades/actualidad/${previous.slug}`)
    revalidatePath(`/novedades/actualidad/${post.slug}`)
    return NextResponse.json({ item: post })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSessionUser()
    const previous = await getPost(params.id)
    await deletePost(params.id)
    revalidatePath('/novedades/actualidad')
    if (previous?.slug) revalidatePath(`/novedades/actualidad/${previous.slug}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
