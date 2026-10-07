import type { Caracteristica } from './caracteristica.ts'
import type { Genero } from './genero.ts'
import type { Juego } from './juego.ts'
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

// El historial (GET /recomendaciones) no devuelve la búsqueda completa: de cada juego
// trae solo un resumen y no incluye el usuario. Estos tipos son un subconjunto de los
// del openapi (no agregan campos) para que TypeScript no deje usar lo que no llega.
export type JuegoResumen = Pick<Juego, 'id' | 'titulo' | 'anioLanzamiento' | 'imagenUrl'>

export type RecomendacionResumen = Omit<Recomendacion, 'busqueda' | 'juego'> & {
  juego: JuegoResumen
}

export type BusquedaResumen = Omit<Busqueda, 'usuario' | 'recomendaciones'> & {
  recomendaciones: RecomendacionResumen[]
}

export interface FiltroHistorial {
  /** Formato AAAA-MM-DD */
  desde?: string
  /** Formato AAAA-MM-DD (el día entra completo) */
  hasta?: string
}

export interface GenerarRecomendacionDto {
  plataformaIds: number[]
  generoIds: number[]
  caracteristicaIds?: number[] | null
}
