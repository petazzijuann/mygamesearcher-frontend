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

export interface CrearColeccionDto {
  nombre: string
  descripcion?: string | null
  juegoIds?: number[] | null
}

// En el PATCH, juegoIds reemplaza la lista de juegos de la colección.
export interface ActualizarColeccionDto {
  nombre?: string
  descripcion?: string | null
  juegoIds?: number[] | null
}

export interface AgregarJuegoDto {
  juegoId: number
}
