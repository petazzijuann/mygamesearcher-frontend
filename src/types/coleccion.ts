import type { Juego } from './juego.ts'
import type { Usuario } from './usuario.ts'

export interface Coleccion {
  id: number
  nombre: string
  descripcion: string | null
  /** Fecha en formato ISO (date-time) */
  fechaCreacion: string
  usuario: Usuario
  juegos: Juego[]
}
