import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowLeft, FiCalendar, FiUser } from 'react-icons/fi'

import PageAnimation from '../../../components/page-animation'
import { getPostBySlug } from '@/lib/admin/repository'
import type { Post, PostBlock } from '@/lib/admin/types'

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

function bloquesDe(post: Post): PostBlock[] {
  if (post.bloques.length) return post.bloques
  return post.contenido.trim()
    ? [{ id: 'contenido-anterior', tipo: 'texto', contenido: post.contenido }]
    : []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPostBySlug(params.slug).catch(() => null)
  if (!post) return { title: 'Nota no encontrada | ACAV' }

  const firstTextBlock = post.bloques.find((block) => block.tipo === 'texto')
  const description = (
    textoPlano(post.resumen)
    || (firstTextBlock?.tipo === 'texto' ? textoPlano(firstTextBlock.contenido) : '')
  ).slice(0, 160)
  const socialImage = post.imagen || post.bloques.find((block) => block.tipo === 'imagen')?.url

  return {
    title: `${post.titulo} | ACAV`,
    description,
    openGraph: {
      title: post.titulo,
      description,
      images: socialImage ? [socialImage] : undefined,
      type: 'article',
    },
  }
}

export default async function NotaPage({ params }: Params) {
  const post = await getPostBySlug(params.slug).catch(() => null)
  if (!post) notFound()
  const blocks = bloquesDe(post)

  return (
    <PageAnimation>
      <article className="pb-section md:pb-section-lg">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/novedades/actualidad"
              className="inline-flex items-center gap-2 pt-section text-[11px] font-bold uppercase tracking-wide text-slate-500 transition hover:text-primary-600 md:pt-section-lg"
            >
              <FiArrowLeft />
              Volver a Actualidad
            </Link>

            {post.categoria ? (
              <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-600">{post.categoria}</p>
            ) : null}

            <h1 className="mt-3 max-w-3xl text-[30px] font-bold leading-[1.12] tracking-tight text-slate-950 md:text-[44px]">
              {post.titulo}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-slate-400">
              {formatDate(post.createdAt) ? (
                <span className="flex items-center gap-1.5"><FiCalendar /> {formatDate(post.createdAt)}</span>
              ) : null}
              {post.autor ? (
                <span className="flex items-center gap-1.5"><FiUser /> {post.autor}</span>
              ) : null}
            </div>

            {post.imagen ? (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-sm md:mt-10 md:rounded-[26px]">
                {/* La imagen vive en R2; se sirve sin el optimizador de Next. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imagen} alt={post.titulo} className="h-full w-full object-cover" />
              </div>
            ) : null}

            {post.resumen ? (
              <div
                className="post-content mx-auto mt-8 max-w-3xl rounded-r-2xl border-l-4 border-primary-300 bg-primary-50/60 px-5 py-4 text-[16px] leading-8 text-slate-700 md:mt-10 md:px-7 md:py-5 md:text-[18px]"
                // El HTML se sanitiza en el servidor al guardar la nota.
                dangerouslySetInnerHTML={{ __html: post.resumen }}
              />
            ) : null}

            <div className="mx-auto mt-8 max-w-3xl md:mt-12">
              {blocks.map((block, index) => block.tipo === 'texto' ? (
                <div
                  key={`${block.id}-${index}`}
                  className="post-content mb-8 text-[16px] leading-8 text-slate-700 md:mb-10 md:text-[17px] md:leading-[1.9]"
                  // El HTML se sanitiza en el servidor al guardar la nota.
                  dangerouslySetInnerHTML={{ __html: block.contenido }}
                />
              ) : (
                <figure key={`${block.id}-${index}`} className="my-9 md:my-12">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:rounded-[22px]">
                    {/* Las imágenes viven en R2; se sirven sin el optimizador de Next. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.url} alt={block.alt} loading="lazy" className="mx-auto max-h-[760px] w-full object-contain" />
                  </div>
                  {block.epigrafe ? (
                    <figcaption className="mt-3 text-center text-sm leading-6 text-slate-500">{block.epigrafe}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PageAnimation>
  )
}
