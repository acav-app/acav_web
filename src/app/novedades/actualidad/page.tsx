import type { Metadata } from 'next'
import Link from 'next/link'
import { FiArrowRight, FiCalendar, FiUser } from 'react-icons/fi'

import PageAnimation from '../../components/page-animation'
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

function imagenDePortada(post: Post) {
  return post.imagen || post.bloques.find((block) => block.tipo === 'imagen')?.url || ''
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
    <PageAnimation>
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
                className="group mt-9 grid overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_24px_60px_rgba(8,27,69,0.12)] md:h-[400px] md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:mt-11 lg:h-[430px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 md:aspect-auto md:h-full">
                  {imagenDePortada(destacada) ? (
                    // Las imágenes viven en R2; se sirven sin el optimizador de Next.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagenDePortada(destacada)} alt={destacada.titulo} className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]" />
                  ) : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 text-sm font-semibold text-slate-400">Actualidad ACAV</div>}
                </div>

                <div className="flex min-h-0 flex-col justify-center bg-gradient-to-br from-white to-slate-50/80 px-6 py-7 sm:px-8 md:px-8 md:py-8 lg:px-11">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-700">Nota destacada</span>
                    {destacada.categoria ? <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{destacada.categoria}</span> : null}
                  </div>
                  <h2 className="line-clamp-3 text-[22px] font-bold leading-[1.18] tracking-tight text-slate-950 md:text-[25px] lg:text-[30px]">
                    {destacada.titulo}
                  </h2>
                  {destacada.resumen ? (
                    <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-slate-600 md:mt-4 md:text-sm md:leading-7">
                      {resumenPlano(destacada.resumen)}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400 md:mt-6 md:text-xs">
                    {formatDate(destacada.createdAt) ? (
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="text-primary-500" /> {formatDate(destacada.createdAt)}
                      </span>
                    ) : null}
                    {destacada.autor ? (
                      <span className="flex items-center gap-1.5">
                        <FiUser className="text-primary-500" /> {destacada.autor}
                      </span>
                    ) : null}
                  </div>

                  <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-primary-600/20 transition group-hover:bg-primary-700 md:mt-6">
                    Leer nota
                    <FiArrowRight className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>

              {resto.length > 0 ? (
                <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-5">
                  {resto.map((post) => (
                    <Link
                      key={post.id}
                      href={`/novedades/actualidad/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_18px_42px_rgba(8,27,69,0.1)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        {imagenDePortada(post) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagenDePortada(post)}
                            alt={post.titulo}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 text-sm font-semibold text-slate-400">Actualidad ACAV</div>}
                      </div>

                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        {post.categoria ? (
                          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-primary-600">{post.categoria}</p>
                        ) : null}
                        <h2 className="mt-2 line-clamp-2 min-h-[2.9rem] text-[16px] font-bold leading-[1.45] text-slate-900 transition-colors group-hover:text-primary-800">{post.titulo}</h2>
                        {post.resumen ? (
                          <p className="mt-2 line-clamp-3 min-h-[4.5rem] flex-1 text-[12px] leading-6 text-slate-600">
                            {resumenPlano(post.resumen)}
                          </p>
                        ) : (
                          <p className="mt-2 min-h-[4.5rem] flex-1 text-xs text-slate-400">Conocé más sobre esta novedad de ACAV.</p>
                        )}

                        <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-3.5 text-[10px] text-slate-400">
                          {formatDate(post.createdAt) ? (
                            <span className="flex items-center gap-1.5">
                              <FiCalendar className="text-primary-500" /> {formatDate(post.createdAt)}
                            </span>
                          ) : null}
                          <span className="ml-auto inline-flex items-center gap-1 font-bold uppercase tracking-wide text-primary-700">Leer <FiArrowRight className="transition group-hover:translate-x-0.5" /></span>
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
    </PageAnimation>
  )
}
