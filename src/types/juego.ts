import type { Caracteristica } from './caracteristica.ts'
import type { ClasificacionEdad } from './clasificacionEdad.ts'
import type { Genero } from './genero.ts'
import type { Plataforma } from './plataforma.ts'

export interface Juego {
  id: number
  titulo: string
  anioLanzamiento: number
  descripcion: string
  imagenUrl: string | null
  clasificacionEdad: ClasificacionEdad
  plataformas: Plataforma[]
  generos: Genero[]
  caracteristicas: Caracteristica[]
}

export interface CrearJuegoDto {
  titulo: string
  anioLanzamiento: number
  descripcion: string
  imagenUrl?: string | null
  clasificacionEdadId: number
  plataformaIds: number[]
  generoIds: number[]
  caracteristicaIds?: number[]
}

// En el PATCH, las listas de ids que se mandan reemplazan a las anteriores.
export interface ActualizarJuegoDto {
  titulo?: string
  anioLanzamiento?: number
  descripcion?: string
  imagenUrl?: string | null
  clasificacionEdadId?: number
  plataformaIds?: number[]
  generoIds?: number[]
  caracteristicaIds?: number[]
}
