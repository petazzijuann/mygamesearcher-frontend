import type { Plataforma } from './plataforma.ts'

export type Rol = 'USUARIO' | 'ADMIN'

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
  /** Fecha en formato ISO (date-time) */
  fechaRegistro: string
  plataforma: Plataforma | null
}
