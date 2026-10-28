export const CATEGORIAS_INGRESO = ['Activo', 'Adherente', 'Honorario'] as const
export type CategoriaIngreso = (typeof CATEGORIAS_INGRESO)[number]

export const ESTADOS_INGRESO = [
  'BORRADOR',
  'PENDIENTE_AVAL_1',
  'PENDIENTE_AVAL_2',
  'COMPLETADO_APROBADO',
  'VENCIDO',
  'RECHAZADA',
] as const
export type EstadoIngreso = (typeof ESTADOS_INGRESO)[number]

export const DOCUMENTOS_INGRESO = [
  'titular1_dni_frente',
  'titular1_dni_dorso',
  'titular2_dni_frente',
  'titular2_dni_dorso',
  'delegado_dni_frente',
  'delegado_dni_dorso',
  'subdelegado_dni_frente',
  'subdelegado_dni_dorso',
  'contrato_social',
  'arca',
  'informe_comercial',
  'rnav',
] as const
export type DocumentoIngreso = (typeof DOCUMENTOS_INGRESO)[number]

export interface PersonaTitular {
  apellidos: string
  nombres: string
  fechaNacimiento: string
  dni: string
  telefono: string
  email: string
  ocupacion: string
}

export interface RepresentanteIngreso {
  apellidos: string
  nombres: string
  dni: string
  telefono: string
  email: string
}

export interface AvalIngreso {
  agencia: string
  email: string
}

export interface DatosIngreso {
  categoria: CategoriaIngreso | ''
  razonSocial: string
  designacionComercial: string
  actividadPrincipal: string
  legajo: string
  domicilioFisico: string
  esFranquicia: '' | 'Sí' | 'No'
  esSucursal: '' | 'Sí' | 'No'
  poseeSucursales: '' | 'Sí' | 'No'
  cantidadSucursales: string
  empleadosCordoba: string
  cuit: string
  condicionIva: string
  whatsapp: string
  email: string
  sitioWeb: string
  redesSociales: string
  titulares: [PersonaTitular, PersonaTitular]
  delegado: RepresentanteIngreso
  subdelegado: RepresentanteIngreso
  avales: [AvalIngreso, AvalIngreso]
}

export interface DocumentoGuardado {
  key: string
  nombre: string
  contentType: string
  size: number
  uploadedAt: string | null
}

export interface FirmaGuardada {
  nombre: string
  imagen: string
  firmadaEn: string | null
  ip: string
  userAgent: string
}

export interface SolicitudIngreso {
  id: string
  numero: string
  estado: EstadoIngreso
  datos: DatosIngreso
  documentos: Partial<Record<DocumentoIngreso, DocumentoGuardado>>
  firmas: Partial<Record<'solicitante' | 'aval1' | 'aval2', FirmaGuardada>>
  pdfKey: string
  notas: string
  createdAt: string | null
  updatedAt: string | null
  expiresAt: string | null
  notificaciones: {
    aval1?: 'enviada' | 'fallida'
    aval2?: 'enviada' | 'fallida'
    final?: 'enviada' | 'fallida'
  }
}

export type FirmaIngresoResumen = Pick<FirmaGuardada, 'nombre' | 'firmadaEn'>

export interface SolicitudIngresoResumen {
  id: string
  numero: string
  estado: EstadoIngreso
  datos: Pick<DatosIngreso, 'razonSocial' | 'categoria' | 'legajo' | 'email' | 'whatsapp'>
  firmas: Partial<Record<'solicitante' | 'aval1' | 'aval2', FirmaIngresoResumen>>
  notas: string
  createdAt: string | null
  updatedAt: string | null
  expiresAt: string | null
  documentCount: number
  pdfDisponible: boolean
  notificaciones: SolicitudIngreso['notificaciones']
}

export const PERSONA_TITULAR_VACIA: PersonaTitular = {
  apellidos: '', nombres: '', fechaNacimiento: '', dni: '', telefono: '', email: '', ocupacion: '',
}

export const REPRESENTANTE_VACIO: RepresentanteIngreso = {
  apellidos: '', nombres: '', dni: '', telefono: '', email: '',
}

export const AVAL_VACIO: AvalIngreso = { agencia: '', email: '' }

export const DATOS_INGRESO_VACIOS: DatosIngreso = {
  categoria: '',
  razonSocial: '',
  designacionComercial: '',
  actividadPrincipal: '',
  legajo: '',
  domicilioFisico: '',
  esFranquicia: '',
  esSucursal: '',
  poseeSucursales: '',
  cantidadSucursales: '0',
  empleadosCordoba: '',
  cuit: '',
  condicionIva: '',
  whatsapp: '',
  email: '',
  sitioWeb: '',
  redesSociales: '',
  titulares: [
    { ...PERSONA_TITULAR_VACIA },
    { ...PERSONA_TITULAR_VACIA },
  ],
  delegado: { ...REPRESENTANTE_VACIO },
  subdelegado: { ...REPRESENTANTE_VACIO },
  avales: [{ ...AVAL_VACIO }, { ...AVAL_VACIO }],
}

export function nombreCompleto(persona: { apellidos: string; nombres: string }) {
  return [persona.nombres.trim(), persona.apellidos.trim()].filter(Boolean).join(' ')
}

function migrarNombreAnterior(value: unknown) {
  const completo = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  // A previous single field cannot be split reliably, especially for compound surnames.
  return { apellidos: '', nombres: completo }
}

function migrarPersona<T extends { apellidos: string; nombres: string }>(value: unknown, empty: T): T {
  const raw = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const legacyName = typeof raw.nombre === 'string' && raw.nombre.trim() !== ''
  const legacy = migrarNombreAnterior(raw.nombre)
  const hasCurrentName = (typeof raw.apellidos === 'string' && raw.apellidos.trim() !== '')
    || (typeof raw.nombres === 'string' && raw.nombres.trim() !== '')
  const apellidos = typeof raw.apellidos === 'string' && (hasCurrentName || !legacyName) ? raw.apellidos : legacy.apellidos
  const nombres = typeof raw.nombres === 'string' && (hasCurrentName || !legacyName) ? raw.nombres : legacy.nombres
  const fields = { ...raw }
  delete fields.nombre
  return { ...empty, ...fields, apellidos, nombres } as T
}

/** Convierte registros anteriores al nuevo formato y descarta campos retirados. */
export function migrarDatosIngreso(value: unknown): DatosIngreso {
  const raw = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const fields = { ...raw }
  delete fields.domicilioVirtual
  const { titulares, delegado, subdelegado } = fields
  delete fields.titulares
  delete fields.delegado
  delete fields.subdelegado
  const oldTitulares = Array.isArray(titulares) ? titulares : []
  const oldDelegado = delegado && typeof delegado === 'object' ? delegado : undefined
  const oldSubdelegado = subdelegado && typeof subdelegado === 'object' ? subdelegado : undefined

  return {
    ...DATOS_INGRESO_VACIOS,
    ...fields,
    titulares: [
      migrarPersona(oldTitulares[0], PERSONA_TITULAR_VACIA),
      migrarPersona(oldTitulares[1], PERSONA_TITULAR_VACIA),
    ],
    delegado: migrarPersona(oldDelegado, REPRESENTANTE_VACIO),
    subdelegado: migrarPersona(oldSubdelegado, REPRESENTANTE_VACIO),
    avales: Array.isArray(raw.avales)
      ? [
          { ...AVAL_VACIO, ...(raw.avales[0] as Partial<AvalIngreso> | undefined) },
          { ...AVAL_VACIO, ...(raw.avales[1] as Partial<AvalIngreso> | undefined) },
        ]
      : DATOS_INGRESO_VACIOS.avales,
  } as DatosIngreso
}

export const ETIQUETAS_DOCUMENTO: Record<DocumentoIngreso, string> = {
  titular1_dni_frente: 'DNI titular 1 — frente',
  titular1_dni_dorso: 'DNI titular 1 — dorso',
  titular2_dni_frente: 'DNI titular 2 — frente',
  titular2_dni_dorso: 'DNI titular 2 — dorso',
  delegado_dni_frente: 'DNI delegado — frente',
  delegado_dni_dorso: 'DNI delegado — dorso',
  subdelegado_dni_frente: 'DNI subdelegado — frente',
  subdelegado_dni_dorso: 'DNI subdelegado — dorso',
  contrato_social: 'Contrato social o documentación equivalente',
  arca: 'Constancia de inscripción en ARCA',
  informe_comercial: 'Informe comercial (Nosis o Veraz)',
  rnav: 'Registro Nacional de Agencias de Viajes',
}
