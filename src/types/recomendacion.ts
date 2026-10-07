import type { Busqueda } from './busqueda.ts'
import type { Juego } from './juego.ts'

export interface Recomendacion {
  id: number
  busqueda: Busqueda
  juego: Juego
  orden: number
  calificacion: number | null
  comentario: string | null
  /** Fecha en formato ISO (date-time) */
  fechaCalificacion: string | null
}

export interface CalificarRecomendacionDto {
  /** De 1 a 5 */
  calificacion: number
  comentario?: string | null
}
