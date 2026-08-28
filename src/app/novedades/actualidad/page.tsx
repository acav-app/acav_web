import type { Metadata } from 'next'
import Link from 'next/link'
import { FiArrowRight, FiCalendar, FiUser } from 'react-icons/fi'

import { listPostsPublicados } from '@/lib/admin/repository'
import type { Post } from '@/lib/admin/types'

export const metadata: Metadata = {
  title: 'Actualidad | ACAV',
  description: 'Novedades, comunicados y notas de la Asociación Cordobesa de Agencias de Viajes.',
}

export const revalidate = 120

function formatDate(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/** El resumen viene en HTML sanitizado; en el listado se muestra como texto plano. */
function resumenPlano(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default async function ActualidadPage() {
  let posts: Post[] = []

  try {
    posts = await listPostsPublicados()
  } catch (error) {
    console.error('[actualidad]', error)
  }

  const [destacada, ...resto] = posts

  return (
    <section className="py-section md:py-section-lg">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase text-primary-600">Novedades</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight text-slate-900 md:text-[34px]">Actualidad</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
            Comunicados, novedades institucionales y notas sobre el sector turístico de Córdoba.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center text-sm text-slate-500">
            Todavía no hay notas publicadas.
          </div>
        ) : (
          <>
            <Link
              href={`/novedades/actualidad/${destacada.slug}`}
              className="group mt-10 grid gap-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_22px_50px_rgba(15,23,42,0.08)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
            >
              <div className="relative h-[240px] overflow-hidden bg-slate-100 md:h-full md:min-h-[320px]">
                {destacada.imagen ? (
                  // Las imágenes viven en R2; se sirven sin el optimizador de Next.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={destacada.imagen}
                    alt={destacada.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>

              <div className="flex flex-col justify-center p-7 md:p-10">
                {destacada.categoria ? (
                  <p className="text-[11px] font-bold uppercase text-primary-600">{destacada.categoria}</p>
                ) : null}
                <h2 className="mt-3 text-[22px] font-bold leading-tight text-slate-900 md:text-[28px]">
                  {destacada.titulo}
                </h2>
                {destacada.resumen ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
                    {resumenPlano(destacada.resumen)}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] text-slate-400">
                  {formatDate(destacada.createdAt) ? (
                    <span className="flex items-center gap-1.5">
                      <FiCalendar /> {formatDate(destacada.createdAt)}
                    </span>
                  ) : null}
                  {destacada.autor ? (
                    <span className="flex items-center gap-1.5">
                      <FiUser /> {destacada.autor}
                    </span>
                  ) : null}
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase text-primary-600">
                  Leer nota
                  <FiArrowRight className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            {resto.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {resto.map((post) => (
                  <Link
                    key={post.id}
                    href={`/novedades/actualidad/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
                  >
                    <div className="relative h-[180px] overflow-hidden bg-slate-100">
                      {post.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imagen}
                          alt={post.titulo}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      {post.categoria ? (
                        <p className="text-[10px] font-bold uppercase text-primary-600">{post.categoria}</p>
                      ) : null}
                      <h2 className="mt-2 text-[17px] font-bold leading-snug text-slate-900">{post.titulo}</h2>
                      {post.resumen ? (
                        <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-6 text-slate-600">
                          {resumenPlano(post.resumen)}
                        </p>
                      ) : (
                        <div className="flex-1" />
                      )}

                      <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-[12px] text-slate-400">
                        {formatDate(post.createdAt) ? (
                          <span className="flex items-center gap-1.5">
                            <FiCalendar /> {formatDate(post.createdAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
