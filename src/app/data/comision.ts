export interface Miembro {
  nombre: string
  cargo: string
  foto: string | null
}

export interface GrupoComision {
  titulo: string
  descripcion: string
  miembros: Miembro[]
}

const FOTOS = '/images/comision'

export const comisionDirectiva: GrupoComision[] = [
  {
    titulo: 'Mesa Directiva',
    descripcion: 'Conduce la asociación y representa a ACAV ante organismos públicos y privados.',
    miembros: [
      { nombre: 'Diego Javier Obregón', cargo: 'Presidente', foto: `${FOTOS}/DIEGO OBREGON.png` },
      { nombre: 'Luis Eduardo Rodríguez Haddad', cargo: 'Vicepresidente', foto: `${FOTOS}/EDUARDO RODRIGUEZ.png` },
      { nombre: 'Martín Ignacio Franco Cardone', cargo: 'Secretario', foto: `${FOTOS}/MARTIN FRANCO CARDONE.png` },
      { nombre: 'Karina V. Bustos', cargo: 'Prosecretaria', foto: `${FOTOS}/KARINA BUSTOS.png` },
      { nombre: 'Carlos Marcelo García', cargo: 'Tesorero', foto: `${FOTOS}/MARCELO GARCIA.png` },
    ],
  },
  {
    titulo: 'Vocales',
    descripcion: 'Participan de las decisiones y acompañan la gestión de las distintas comisiones de trabajo.',
    miembros: [
      { nombre: 'Soledad Klinger', cargo: 'Vocal Titular 1', foto: `${FOTOS}/SOLEDAD KLINGER.png` },
      { nombre: 'Julián Ciklic', cargo: 'Vocal Titular 2', foto: `${FOTOS}/JUAN C.png` },
      { nombre: 'Oscar Alejandro Moreno', cargo: 'Vocal Titular 3', foto: `${FOTOS}/OSCAR MORENO.png` },
      { nombre: 'Gustavo Andrés Peralta', cargo: 'Vocal Titular 4', foto: `${FOTOS}/GUSTAVO PERALTA_.png` },
      { nombre: 'Judith Carrizo', cargo: 'Vocal Suplente 1', foto: `${FOTOS}/JUDITH CARRIZO.png` },
    ],
  },
  {
    titulo: 'Comisión Revisora de Cuentas',
    descripcion: 'Controla la administración económica y financiera de la asociación.',
    miembros: [
      { nombre: 'Lucía Palavecino', cargo: 'Revisor de Cuentas 1', foto: `${FOTOS}/LUCIA PALAVECINO.png` },
      { nombre: 'Alejandro Podio', cargo: 'Revisor de Cuentas 2', foto: `${FOTOS}/ALEJANDRO PODIO.png` },
      { nombre: 'Gustavo Kraisman', cargo: 'Revisor de Cuentas 3', foto: `${FOTOS}/GUSTAVO KRAISMAN.png` },
    ],
  },
]

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}

/** Lista plana para el slider de la home. */
export const comisionPlana = comisionDirectiva.flatMap((grupo) =>
  grupo.miembros.map((miembro) => ({ ...miembro, grupo: grupo.titulo }))
)
