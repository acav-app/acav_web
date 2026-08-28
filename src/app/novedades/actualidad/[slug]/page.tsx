import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowLeft, FiCalendar, FiUser } from 'react-icons/fi'

import PageAnimation from '../../../components/page-animation'
import { getPostBySlug } from '@/lib/admin/repository'

export const revalidate = 120

type Params = { params: { slug: string } }

function formatDate(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function textoPlano(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPostBySlug(params.slug).catch(() => null)
  if (!post) return { title: 'Nota no encontrada | ACAV' }

  const description = textoPlano(post.resumen).slice(0, 160)

  return {
    title: `${post.titulo} | ACAV`,
    description,
    openGraph: {
      title: post.titulo,
      description,
      images: post.imagen ? [post.imagen] : undefined,
      type: 'article',
    },
  }
}

export default async function NotaPage({ params }: Params) {
  const post = await getPostBySlug(params.slug).catch(() => null)
  if (!post) notFound()

  return (
    <article className="py-section md:py-section-lg">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/novedades/actualidad"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500 transition hover:text-primary-600"
          >
            <FiArrowLeft />
            Volver a Actualidad
          </Link>

          {post.categoria ? (
            <p className="mt-6 text-[11px] font-bold uppercase text-primary-600">{post.categoria}</p>
          ) : null}

          <h1 className="mt-3 text-[28px] font-bold leading-[1.15] text-slate-900 md:text-[38px]">
            {post.titulo}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px] text-slate-400">
            {formatDate(post.createdAt) ? (
              <span className="flex items-center gap-1.5">
                <FiCalendar /> {formatDate(post.createdAt)}
              </span>
            ) : null}
            {post.autor ? (
              <span className="flex items-center gap-1.5">
                <FiUser /> {post.autor}
              </span>
            ) : null}
          </div>

          {post.imagen ? (
            <div className="mt-8 overflow-hidden rounded-[26px] border border-slate-200">
              {/* La imagen vive en R2; se sirve sin el optimizador de Next. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imagen} alt={post.titulo} className="h-auto w-full object-cover" />
            </div>
          ) : null}

          {post.resumen ? (
            <div
              className="post-content mt-8 border-l-4 border-primary-200 pl-5 text-[17px] leading-8 text-slate-700"
              // El HTML se sanitiza en el servidor al guardar la nota.
              dangerouslySetInnerHTML={{ __html: post.resumen }}
            />
          ) : null}

          {post.contenido ? (
            <div
              className="post-content mt-8 text-base leading-8 text-slate-700"
              dangerouslySetInnerHTML={{ __html: post.contenido }}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}
