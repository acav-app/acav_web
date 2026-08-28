import 'server-only'

import sanitizeHtml from 'sanitize-html'
import { FieldValue, Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase/admin'
import {
  ESTADOS_SOLICITUD,
  slugify,
  type Aliado,
  type AliadoInput,
  type BannerSlide,
  type BannerSlideInput,
  type BannerTipo,
  type Contacto,
  type ContactoInput,
  type EstadoSolicitud,
  type Post,
  type PostInput,
  type Socio,
  type SocioInput,
  type Solicitud,
  type SolicitudInput,
} from '@/lib/admin/types'

export const POSTS_COLLECTION = 'posts'
export const SOCIOS_COLLECTION = 'socios'
export const ALIADOS_COLLECTION = 'aliados'
export const SOLICITUDES_COLLECTION = 'solicitudes'
export const CONTACTOS_COLLECTION = 'contactos'
export const BANNER_COLLECTION = 'banner'

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 's', 'code', 'pre', 'blockquote',
    'h2', 'h3', 'ul', 'ol', 'li', 'a', 'hr', 'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
}

function html(value: unknown): string {
  return typeof value === 'string' ? sanitizeHtml(value, SANITIZE_OPTIONS).trim() : ''
}

function toIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return null
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

/* ------------------------------- Blog / Posts ------------------------------ */

function mapPost(doc: QueryDocumentSnapshot<DocumentData>): Post {
  const data = doc.data()
  return {
    id: doc.id,
    titulo: str(data.titulo),
    slug: str(data.slug),
    resumen: str(data.resumen),
    contenido: str(data.contenido),
    categoria: str(data.categoria),
    imagen: str(data.imagen),
    autor: str(data.autor),
    estado: data.estado === 'publicado' ? 'publicado' : 'borrador',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export function normalizePost(payload: unknown): PostInput {
  const raw = (payload ?? {}) as Record<string, unknown>
  const titulo = str(raw.titulo)

  if (!titulo) throw new Error('El título es obligatorio.')

  return {
    titulo,
    // El slug siempre se deriva del título; no es editable desde el panel.
    slug: slugify(titulo),
    resumen: html(raw.resumen),
    contenido: html(raw.contenido),
    categoria: str(raw.categoria),
    imagen: str(raw.imagen),
    autor: str(raw.autor),
    estado: raw.estado === 'publicado' ? 'publicado' : 'borrador',
  }
}

export async function listPosts(): Promise<Post[]> {
  const snap = await adminDb().collection(POSTS_COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map(mapPost)
}

export async function getPost(id: string): Promise<Post | null> {
  const doc = await adminDb().collection(POSTS_COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return mapPost(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function createPost(input: PostInput): Promise<Post> {
  const ref = await adminDb().collection(POSTS_COLLECTION).add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const doc = await ref.get()
  return mapPost(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  const ref = adminDb().collection(POSTS_COLLECTION).doc(id)
  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() })
  const doc = await ref.get()
  return mapPost(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function deletePost(id: string): Promise<void> {
  await adminDb().collection(POSTS_COLLECTION).doc(id).delete()
}

export async function listPostsPublicados(): Promise<Post[]> {
  const snap = await adminDb()
    .collection(POSTS_COLLECTION)
    .where('estado', '==', 'publicado')
    .get()

  return snap.docs
    .map(mapPost)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const snap = await adminDb()
    .collection(POSTS_COLLECTION)
    .where('slug', '==', slug)
    .where('estado', '==', 'publicado')
    .limit(1)
    .get()

  return snap.empty ? null : mapPost(snap.docs[0])
}

/* --------------------------------- Socios --------------------------------- */

function mapSocio(doc: QueryDocumentSnapshot<DocumentData>): Socio {
  const data = doc.data()
  const contacto = (data.contacto ?? {}) as Record<string, unknown>
  const delegado = (data.delegado ?? {}) as Record<string, unknown>
  const subdelegado = (data.subdelegado ?? {}) as Record<string, unknown>

  return {
    id: doc.id,
    legajo: str(data.legajo),
    nombre: str(data.nombre),
    logo: str(data.logo),
    categoria: str(data.categoria, 'Agencia de viajes'),
    localidad: str(data.localidad),
    sitio: str(data.sitio),
    contacto: { email: str(contacto.email), whatsapp: str(contacto.whatsapp) },
    delegado: { email: str(delegado.email) },
    subdelegado: { email: str(subdelegado.email) },
    activo: data.activo !== false,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export function normalizeSocio(payload: unknown): SocioInput {
  const raw = (payload ?? {}) as Record<string, unknown>
  const contacto = (raw.contacto ?? {}) as Record<string, unknown>
  const delegado = (raw.delegado ?? {}) as Record<string, unknown>
  const subdelegado = (raw.subdelegado ?? {}) as Record<string, unknown>
  const nombre = str(raw.nombre)

  if (!nombre) throw new Error('El nombre del socio es obligatorio.')

  return {
    legajo: str(raw.legajo),
    nombre,
    logo: str(raw.logo),
    categoria: str(raw.categoria, 'Agencia de viajes') || 'Agencia de viajes',
    localidad: str(raw.localidad),
    sitio: str(raw.sitio),
    contacto: { email: str(contacto.email), whatsapp: str(contacto.whatsapp) },
    delegado: { email: str(delegado.email) },
    subdelegado: { email: str(subdelegado.email) },
    activo: raw.activo !== false,
  }
}

export async function listSociosActivos(): Promise<Socio[]> {
  return (await listSocios()).filter((socio) => socio.activo)
}

export async function listSocios(): Promise<Socio[]> {
  const snap = await adminDb().collection(SOCIOS_COLLECTION).orderBy('nombre').get()
  return snap.docs.map(mapSocio)
}

export async function getSocio(id: string): Promise<Socio | null> {
  const doc = await adminDb().collection(SOCIOS_COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return mapSocio(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function createSocio(input: SocioInput): Promise<Socio> {
  const ref = await adminDb().collection(SOCIOS_COLLECTION).add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const doc = await ref.get()
  return mapSocio(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function updateSocio(id: string, input: SocioInput): Promise<Socio> {
  const ref = adminDb().collection(SOCIOS_COLLECTION).doc(id)
  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() })
  const doc = await ref.get()
  return mapSocio(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function deleteSocio(id: string): Promise<void> {
  await adminDb().collection(SOCIOS_COLLECTION).doc(id).delete()
}

/* --------------------------------- Aliados -------------------------------- */

function mapAliado(doc: QueryDocumentSnapshot<DocumentData>): Aliado {
  const data = doc.data()
  return {
    id: doc.id,
    nombre: str(data.nombre),
    imagen: str(data.imagen),
    descripcion: str(data.descripcion),
    sitio: str(data.sitio),
    orden: typeof data.orden === 'number' ? data.orden : 0,
    activo: data.activo !== false,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export function normalizeAliado(payload: unknown): AliadoInput {
  const raw = (payload ?? {}) as Record<string, unknown>
  const nombre = str(raw.nombre)

  if (!nombre) throw new Error('El nombre del aliado es obligatorio.')

  const sitio = str(raw.sitio)
  if (sitio && !/^https?:\/\//i.test(sitio)) {
    throw new Error('El sitio debe empezar con http:// o https://')
  }

  return {
    nombre,
    imagen: str(raw.imagen),
    descripcion: str(raw.descripcion),
    sitio,
    orden: Number.isFinite(Number(raw.orden)) ? Number(raw.orden) : 0,
    activo: raw.activo !== false,
  }
}

export async function listAliados(): Promise<Aliado[]> {
  const snap = await adminDb().collection(ALIADOS_COLLECTION).orderBy('orden').get()
  return snap.docs.map(mapAliado)
}

export async function listAliadosActivos(): Promise<Aliado[]> {
  return (await listAliados()).filter((aliado) => aliado.activo)
}

export async function getAliado(id: string): Promise<Aliado | null> {
  const doc = await adminDb().collection(ALIADOS_COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return mapAliado(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function createAliado(input: AliadoInput): Promise<Aliado> {
  const ref = await adminDb().collection(ALIADOS_COLLECTION).add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const doc = await ref.get()
  return mapAliado(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function updateAliado(id: string, input: AliadoInput): Promise<Aliado> {
  const ref = adminDb().collection(ALIADOS_COLLECTION).doc(id)
  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() })
  const doc = await ref.get()
  return mapAliado(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function deleteAliado(id: string): Promise<void> {
  await adminDb().collection(ALIADOS_COLLECTION).doc(id).delete()
}

/* ------------------------------- Solicitudes ------------------------------ */

function mapSolicitud(doc: QueryDocumentSnapshot<DocumentData>): Solicitud {
  const data = doc.data()
  const estado = ESTADOS_SOLICITUD.includes(data.estado) ? (data.estado as EstadoSolicitud) : 'nueva'

  return {
    id: doc.id,
    agencia: str(data.agencia),
    categoria: str(data.categoria, 'Agencia de viajes'),
    legajo: str(data.legajo),
    responsable: str(data.responsable),
    email: str(data.email),
    telefono: str(data.telefono),
    localidad: str(data.localidad),
    sitio: str(data.sitio),
    mensaje: str(data.mensaje),
    estado,
    notas: str(data.notas),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Valida el payload público del formulario de asociación. */
export function normalizeSolicitud(payload: unknown): SolicitudInput {
  const raw = (payload ?? {}) as Record<string, unknown>
  const cap = (value: unknown, max: number) => str(value).slice(0, max)

  const agencia = cap(raw.agencia, 120)
  const responsable = cap(raw.responsable, 120)
  const email = cap(raw.email, 160).toLowerCase()
  const telefono = cap(raw.telefono, 40)

  if (!agencia) throw new Error('El nombre de la agencia es obligatorio.')
  if (!responsable) throw new Error('El nombre del responsable es obligatorio.')
  if (!EMAIL_RE.test(email)) throw new Error('Ingresá un email válido.')
  if (!telefono) throw new Error('El teléfono es obligatorio.')

  return {
    agencia,
    categoria: cap(raw.categoria, 60) || 'Agencia de viajes',
    legajo: cap(raw.legajo, 60),
    responsable,
    email,
    telefono,
    localidad: cap(raw.localidad, 120),
    sitio: cap(raw.sitio, 200),
    mensaje: cap(raw.mensaje, 1500),
  }
}

export async function createSolicitud(input: SolicitudInput): Promise<Solicitud> {
  const ref = await adminDb().collection(SOLICITUDES_COLLECTION).add({
    ...input,
    estado: 'nueva' satisfies EstadoSolicitud,
    notas: '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const doc = await ref.get()
  return mapSolicitud(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function listSolicitudes(): Promise<Solicitud[]> {
  const snap = await adminDb().collection(SOLICITUDES_COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map(mapSolicitud)
}

export async function updateSolicitudEstado(
  id: string,
  payload: unknown
): Promise<Solicitud> {
  const raw = (payload ?? {}) as Record<string, unknown>
  const estado = ESTADOS_SOLICITUD.includes(raw.estado as EstadoSolicitud)
    ? (raw.estado as EstadoSolicitud)
    : 'nueva'

  const ref = adminDb().collection(SOLICITUDES_COLLECTION).doc(id)
  await ref.update({ estado, notas: str(raw.notas).slice(0, 2000), updatedAt: FieldValue.serverTimestamp() })
  const doc = await ref.get()
  return mapSolicitud(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function deleteSolicitud(id: string): Promise<void> {
  await adminDb().collection(SOLICITUDES_COLLECTION).doc(id).delete()
}

/* --------------------------------- Contactos -------------------------------- */

function mapContacto(doc: QueryDocumentSnapshot<DocumentData>): Contacto {
  const data = doc.data()
  const estado = ESTADOS_SOLICITUD.includes(data.estado) ? (data.estado as EstadoSolicitud) : 'nueva'

  return {
    id: doc.id,
    nombre: str(data.nombre),
    email: str(data.email),
    telefono: str(data.telefono),
    asunto: str(data.asunto),
    mensaje: str(data.mensaje),
    origen: str(data.origen, 'formulario'),
    estado,
    notas: str(data.notas),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

/** Valida el payload público del formulario de contacto. */
export function normalizeContacto(payload: unknown): ContactoInput {
  const raw = (payload ?? {}) as Record<string, unknown>
  const cap = (value: unknown, max: number) => str(value).slice(0, max)

  const nombre = cap(raw.nombre, 120)
  const email = cap(raw.email, 160).toLowerCase()
  const telefono = cap(raw.telefono, 40)
  const asunto = cap(raw.asunto, 120)
  const mensaje = cap(raw.mensaje, 1500)
  const origen = cap(raw.origen, 80)

  if (!nombre) throw new Error('El nombre es obligatorio.')
  if (!EMAIL_RE.test(email)) throw new Error('Ingresá un email válido.')
  if (!mensaje) throw new Error('El mensaje es obligatorio.')

  return {
    nombre,
    email,
    telefono,
    asunto,
    mensaje,
    origen: origen || 'formulario',
  }
}

export async function createContacto(input: ContactoInput): Promise<Contacto> {
  const ref = await adminDb().collection(CONTACTOS_COLLECTION).add({
    ...input,
    estado: 'nueva' satisfies EstadoSolicitud,
    notas: '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const doc = await ref.get()
  return mapContacto(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function listContactos(): Promise<Contacto[]> {
  const snap = await adminDb().collection(CONTACTOS_COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map(mapContacto)
}

/* --------------------------------- Banner --------------------------------- */

function mapBannerSlide(doc: QueryDocumentSnapshot<DocumentData>): BannerSlide {
  const data = doc.data()
  const ctaPrimario = (data.ctaPrimario ?? {}) as Record<string, unknown>
  const ctaSecundario = (data.ctaSecundario ?? {}) as Record<string, unknown>

  return {
    id: doc.id,
    titulo: str(data.titulo),
    subtitulo: str(data.subtitulo),
    tipo: data.tipo === 'video' ? 'video' : 'imagen',
    media: str(data.media),
    poster: str(data.poster),
    ctaPrimario: { label: str(ctaPrimario.label), href: str(ctaPrimario.href) },
    ctaSecundario: { label: str(ctaSecundario.label), href: str(ctaSecundario.href) },
    orden: typeof data.orden === 'number' ? data.orden : 0,
    activo: data.activo !== false,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export function normalizeBannerSlide(payload: unknown): BannerSlideInput {
  const raw = (payload ?? {}) as Record<string, unknown>
  const ctaPrimario = (raw.ctaPrimario ?? {}) as Record<string, unknown>
  const ctaSecundario = (raw.ctaSecundario ?? {}) as Record<string, unknown>
  const titulo = str(raw.titulo)
  const media = str(raw.media)

  if (!titulo) throw new Error('El título del banner es obligatorio.')
  if (!media) throw new Error('Subí una imagen o un video para el banner.')

  return {
    titulo,
    subtitulo: str(raw.subtitulo),
    tipo: (raw.tipo === 'video' ? 'video' : 'imagen') satisfies BannerTipo,
    media,
    poster: str(raw.poster),
    ctaPrimario: { label: str(ctaPrimario.label), href: str(ctaPrimario.href) },
    ctaSecundario: { label: str(ctaSecundario.label), href: str(ctaSecundario.href) },
    orden: Number.isFinite(Number(raw.orden)) ? Number(raw.orden) : 0,
    activo: raw.activo !== false,
  }
}

export async function listBannerSlides(): Promise<BannerSlide[]> {
  const snap = await adminDb().collection(BANNER_COLLECTION).orderBy('orden').get()
  return snap.docs.map(mapBannerSlide)
}

export async function listBannerSlidesActivos(): Promise<BannerSlide[]> {
  return (await listBannerSlides()).filter((slide) => slide.activo)
}

export async function getBannerSlide(id: string): Promise<BannerSlide | null> {
  const doc = await adminDb().collection(BANNER_COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return mapBannerSlide(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function createBannerSlide(input: BannerSlideInput): Promise<BannerSlide> {
  const ref = await adminDb().collection(BANNER_COLLECTION).add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const doc = await ref.get()
  return mapBannerSlide(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function updateBannerSlide(id: string, input: BannerSlideInput): Promise<BannerSlide> {
  const ref = adminDb().collection(BANNER_COLLECTION).doc(id)
  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() })
  const doc = await ref.get()
  return mapBannerSlide(doc as QueryDocumentSnapshot<DocumentData>)
}

export async function deleteBannerSlide(id: string): Promise<void> {
  await adminDb().collection(BANNER_COLLECTION).doc(id).delete()
}
