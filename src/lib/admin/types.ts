export type PostStatus = 'borrador' | 'publicado'

export interface Post {
  id: string
  titulo: string
  slug: string
  resumen: string
  contenido: string
  categoria: string
  imagen: string
  autor: string
  estado: PostStatus
  createdAt: string | null
  updatedAt: string | null
}

export type PostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>

export const CATEGORIAS_SOCIO = [
  'Agencia de viajes',
  'Operador mayorista',
  'Receptivo',
  'Adherente',
  'Honorario',
] as const

export type CategoriaSocio = (typeof CATEGORIAS_SOCIO)[number]

export interface Socio {
  id: string
  legajo: string
  nombre: string
  logo: string
  categoria: string
  localidad: string
  sitio: string
  contacto: { email: string; whatsapp: string }
  delegado: { email: string }
  subdelegado: { email: string }
  activo: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SocioInput = Omit<Socio, 'id' | 'createdAt' | 'updatedAt'>

export const emptyPost: PostInput = {
  titulo: '',
  slug: '',
  resumen: '',
  contenido: '',
  categoria: '',
  imagen: '',
  autor: '',
  estado: 'borrador',
}

export const emptySocio: SocioInput = {
  legajo: '',
  nombre: '',
  logo: '',
  categoria: 'Agencia de viajes',
  localidad: '',
  sitio: '',
  contacto: { email: '', whatsapp: '' },
  delegado: { email: '' },
  subdelegado: { email: '' },
  activo: true,
}

export const ESTADOS_SOLICITUD = ['nueva', 'en revisión', 'aprobada', 'rechazada'] as const

export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number]

export interface Solicitud {
  id: string
  agencia: string
  logo: string
  categoria: string
  legajo: string
  responsable: string
  email: string
  telefono: string
  localidad: string
  sitio: string
  mensaje: string
  estado: EstadoSolicitud
  notas: string
  createdAt: string | null
  updatedAt: string | null
}

export type SolicitudInput = Omit<Solicitud, 'id' | 'estado' | 'notas' | 'createdAt' | 'updatedAt'>

export const emptySolicitud: SolicitudInput = {
  agencia: '',
  logo: '',
  categoria: 'Agencia de viajes',
  legajo: '',
  responsable: '',
  email: '',
  telefono: '',
  localidad: '',
  sitio: '',
  mensaje: '',
}

export interface Aliado {
  id: string
  nombre: string
  imagen: string
  descripcion: string
  sitio: string
  orden: number
  activo: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type AliadoInput = Omit<Aliado, 'id' | 'createdAt' | 'updatedAt'>

export const emptyAliado: AliadoInput = {
  nombre: '',
  imagen: '',
  descripcion: '',
  sitio: '',
  orden: 0,
  activo: true,
}

export interface Contacto {
  id: string
  nombre: string
  email: string
  telefono: string
  asunto: string
  mensaje: string
  origen: string
  estado: EstadoSolicitud
  notas: string
  createdAt: string | null
  updatedAt: string | null
}

export type ContactoInput = Omit<Contacto, 'id' | 'estado' | 'notas' | 'createdAt' | 'updatedAt'>

export const emptyContacto: ContactoInput = {
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: '',
  origen: '',
}

export type BannerTipo = 'imagen' | 'video'

export interface BannerSlide {
  id: string
  titulo: string
  subtitulo: string
  tipo: BannerTipo
  media: string
  poster: string
  ctaPrimario: { label: string; href: string }
  ctaSecundario: { label: string; href: string }
  orden: number
  activo: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type BannerSlideInput = Omit<BannerSlide, 'id' | 'createdAt' | 'updatedAt'>

export const emptyBannerSlide: BannerSlideInput = {
  titulo: '',
  subtitulo: '',
  tipo: 'imagen',
  media: '',
  poster: '',
  ctaPrimario: { label: '', href: '' },
  ctaSecundario: { label: '', href: '' },
  orden: 0,
  activo: true,
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
