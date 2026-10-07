import type { Juego } from './juego.ts'
import type { Usuario } from './usuario.ts'

export type EstadoJuego = 'ME_INTERESA' | 'YA_JUGADO'

export interface JuegoGuardado {
  usuarioId: number
  juegoId: number
  usuario: Usuario
  juego: Juego
  estado: EstadoJuego
  /** Fecha en formato ISO (date-time) */
  fecha: string
}

export interface GuardarJuegoDto {
  juegoId: number
  estado: EstadoJuego
}

export interface CambiarEstadoDto {
  estado: EstadoJuego
}
