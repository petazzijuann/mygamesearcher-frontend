import type { Caracteristica } from './caracteristica.ts'
import type { Genero } from './genero.ts'
import type { Plataforma } from './plataforma.ts'
import type { Recomendacion } from './recomendacion.ts'
import type { Usuario } from './usuario.ts'

export interface Busqueda {
  id: number
  usuario: Usuario
  /** Fecha en formato ISO (date-time) */
  fechaBusqueda: string
  plataformas: Plataforma[]
  generos: Genero[]
  caracteristicas: Caracteristica[]
  recomendaciones: Recomendacion[]
}

export interface GenerarRecomendacionDto {
  plataformaIds: number[]
  generoIds: number[]
  caracteristicaIds?: number[] | null
}
