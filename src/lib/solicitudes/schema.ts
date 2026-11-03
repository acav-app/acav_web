import { z } from 'zod'

import { CATEGORIAS_INGRESO, migrarDatosIngreso, REDES_SOCIALES_CAMPOS, type DatosIngreso } from './types'
import { esUrlValida, normalizarPerfilSocial, normalizarUrl, validarFechaNacimiento, validarPerfilSocial, validarTelefonoArgentino } from './validation'

const email = z.string().trim().email('Ingresá un email válido.').max(160).transform((value) => value.toLowerCase())
const requiredText = (label: string, max = 180) => z.string().trim().min(1, `${label} es obligatorio.`).max(max)
const phone = z.string().trim().max(24).refine(validarTelefonoArgentino, 'Ingresá un celular argentino de 10 dígitos, sin 0 ni 15 (ej.: 3512345678).')
const website = z.string().trim().min(1, 'Este campo es obligatorio.').max(300).transform(normalizarUrl).refine(esUrlValida, 'Ingresá una URL válida, por ejemplo https://www.ejemplo.com.ar.')
const socialProfile = z.string().trim().max(300).refine(validarPerfilSocial, 'Ingresá un @usuario o una URL válida.').transform(normalizarPerfilSocial)
const optionalPhone = z.string().trim().max(24).refine((value) => !value || validarTelefonoArgentino(value), 'Ingresá un celular argentino válido, sin 0 ni 15.')
const optionalEmail = z.string().trim().max(160).refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), 'Ingresá un email válido.').transform((value) => value.toLowerCase())
const optionalDni = z.string().trim().max(20).refine((value) => !value || /^\d{7,8}$/.test(value.replace(/\D/g, '')), 'El DNI debe tener 7 u 8 números.')
const optionalDate = z.string().trim().max(20).refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Ingresá una fecha válida.')
const optionalText = (max: number) => z.string().trim().max(max)

const personaTitularOpcional = z.object({
  apellidos: optionalText(100),
  nombres: optionalText(100),
  fechaNacimiento: optionalDate,
  dni: optionalDni,
  telefono: optionalPhone,
  email: optionalEmail,
  ocupacion: optionalText(120),
}).superRefine((person, ctx) => {
  const fields: Array<[keyof typeof person, string]> = [
    ['apellidos', 'Los apellidos del titular 2'], ['nombres', 'Los nombres del titular 2'],
    ['fechaNacimiento', 'La fecha de nacimiento del titular 2'], ['dni', 'El DNI del titular 2'],
    ['telefono', 'El celular del titular 2'], ['email', 'El email del titular 2'],
    ['ocupacion', 'La profesión del titular 2'],
  ]
  if (!fields.some(([key]) => person[key].trim())) return
  fields.forEach(([key, label]) => {
    if (!person[key].trim()) ctx.addIssue({ code: 'custom', path: [key], message: `${label} es obligatorio si completás el titular 2.` })
  })
})
const personaTitular = z.object({
  apellidos: requiredText('Los apellidos', 100),
  nombres: requiredText('Los nombres', 100),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresá una fecha válida.'),
  dni: z.string().trim().regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 números.'),
  telefono: phone,
  email,
  ocupacion: requiredText('La profesión u ocupación', 120),
})

const representanteOpcional = z.object({
  apellidos: optionalText(100),
  nombres: optionalText(100),
  dni: optionalDni,
  telefono: optionalPhone,
  email: optionalEmail,
}).superRefine((person, ctx) => {
  const fields: Array<[keyof typeof person, string]> = [
    ['apellidos', 'Los apellidos'], ['nombres', 'Los nombres'], ['dni', 'El DNI'],
    ['telefono', 'El celular'], ['email', 'El email'],
  ]
  if (!fields.some(([key]) => person[key].trim())) return
  fields.forEach(([key, label]) => {
    if (!person[key].trim()) ctx.addIssue({ code: 'custom', path: [key], message: `${label} es obligatorio si completás los datos del representante.` })
  })
})

const redesSociales = z.object(Object.fromEntries(
  REDES_SOCIALES_CAMPOS.map(({ key }) => [key, socialProfile]),
) as Record<(typeof REDES_SOCIALES_CAMPOS)[number]['key'], typeof socialProfile>)

const aval = z.object({ agencia: requiredText('El nombre de la agencia', 160), email })

const agenciaSchema = z.object({
  categoria: z.enum(CATEGORIAS_INGRESO),
  razonSocial: requiredText('La razón social'),
  designacionComercial: requiredText('La designación comercial'),
  actividadPrincipal: requiredText('La actividad principal'),
  legajo: requiredText('El legajo', 60),
  domicilioFisico: requiredText('El domicilio físico', 300),
  esFranquicia: z.enum(['Sí', 'No']),
  esSucursal: z.enum(['Sí', 'No']),
  poseeSucursales: z.enum(['Sí', 'No']),
  cantidadSucursales: z.coerce.number().int().min(0).max(999),
  empleadosCordoba: z.union([z.literal(''), z.coerce.number().int().min(0).max(100000)]),
  cuit: z.string().trim().regex(/^\d{11}$/, 'Ingresá los 11 dígitos del CUIT, sin guiones.').refine(validarCuit, 'El CUIT no es válido.'),
  condicionIva: requiredText('La condición ante el IVA', 80),
  whatsapp: phone,
  email,
  sitioWeb: website,
  redesSociales,
  titulares: z.tuple([personaTitular, personaTitularOpcional]),
  delegado: representanteOpcional,
  subdelegado: representanteOpcional,
  avales: z.tuple([aval, aval]),
}).superRefine((data, ctx) => {
  const aval1 = data.avales[0].email
  const aval2 = data.avales[1].email
  if (aval1 === data.email || aval2 === data.email) {
    ctx.addIssue({ code: 'custom', path: ['avales'], message: 'Los emails de los avales deben ser distintos al del solicitante.' })
  }
  if (aval1 === aval2) {
    ctx.addIssue({ code: 'custom', path: ['avales'], message: 'Cada aval debe tener un email diferente.' })
  }
  if (data.poseeSucursales === 'No' && Number(data.cantidadSucursales) !== 0) {
    ctx.addIssue({ code: 'custom', path: ['cantidadSucursales'], message: 'Indicá 0 si la agencia no posee sucursales.' })
  }
  if (data.poseeSucursales === 'Sí' && Number(data.cantidadSucursales) < 1) {
    ctx.addIssue({ code: 'custom', path: ['cantidadSucursales'], message: 'Indicá cuántas sucursales posee la agencia.' })
  }
  for (let index = 0; index < data.titulares.length; index++) {
    const titular = data.titulares[index]
    if (titular.fechaNacimiento && !validarFechaNacimiento(titular.fechaNacimiento)) {
      ctx.addIssue({ code: 'custom', path: ['titulares', index, 'fechaNacimiento'], message: 'La fecha de nacimiento no es válida.' })
    }
  }
})

export const solicitudIngresoSchema = agenciaSchema
export type SolicitudIngresoInput = z.infer<typeof agenciaSchema>

export const borradorIngresoSchema = z.preprocess((input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input
  const currentFields = { ...(input as Record<string, unknown>) }
  delete currentFields.domicilioVirtual
  return currentFields
}, z.object({
  categoria: z.string().max(40).optional(),
  razonSocial: z.string().max(180).optional(),
  designacionComercial: z.string().max(180).optional(),
  actividadPrincipal: z.string().max(180).optional(),
  legajo: z.string().max(60).optional(),
  domicilioFisico: z.string().max(300).optional(),
  esFranquicia: z.string().max(8).optional(),
  esSucursal: z.string().max(8).optional(),
  poseeSucursales: z.string().max(8).optional(),
  cantidadSucursales: z.union([z.string().max(6), z.number()]).optional(),
  empleadosCordoba: z.union([z.string().max(8), z.number()]).optional(),
  cuit: z.string().max(20).optional(),
  condicionIva: z.string().max(80).optional(),
  whatsapp: z.string().max(30).optional(),
  email: z.string().max(160).optional(),
  sitioWeb: z.string().max(300).optional(),
  redesSociales: z.union([
    z.string().max(1000),
    z.object({
      instagram: z.string().max(300).optional(),
      facebook: z.string().max(300).optional(),
      linkedin: z.string().max(300).optional(),
      tiktok: z.string().max(300).optional(),
      otra: z.string().max(300).optional(),
    }),
  ]).optional(),
  titulares: z.array(z.object({
    apellidos: z.string().max(100).optional(), nombres: z.string().max(100).optional(), nombre: z.string().max(160).optional(), fechaNacimiento: z.string().max(20).optional(),
    dni: z.string().max(20).optional(), telefono: z.string().max(24).optional(),
    email: z.string().max(160).optional(), ocupacion: z.string().max(120).optional(),
  })).length(2).optional(),
  delegado: z.object({ apellidos: z.string().max(100).optional(), nombres: z.string().max(100).optional(), nombre: z.string().max(160).optional(), dni: z.string().max(20).optional(), telefono: z.string().max(24).optional(), email: z.string().max(160).optional() }).optional(),
  subdelegado: z.object({ apellidos: z.string().max(100).optional(), nombres: z.string().max(100).optional(), nombre: z.string().max(160).optional(), dni: z.string().max(20).optional(), telefono: z.string().max(24).optional(), email: z.string().max(160).optional() }).optional(),
  avales: z.array(z.object({ agencia: z.string().max(160).optional(), email: z.string().max(160).optional() })).length(2).optional(),
}).strict())

export function normalizarDatosIngreso(raw: unknown): DatosIngreso {
  const parsed = solicitudIngresoSchema.parse(migrarDatosIngreso(raw))
  return {
    ...parsed,
    cantidadSucursales: String(parsed.cantidadSucursales),
    empleadosCordoba: String(parsed.empleadosCordoba),
  } as DatosIngreso
}

export function validarCuit(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return false
  const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = factors.reduce((total, factor, index) => total + Number(digits[index]) * factor, 0)
  const check = 11 - (sum % 11)
  const digit = check === 11 ? 0 : check === 10 ? 9 : check
  return digit === Number(digits[10])
}
