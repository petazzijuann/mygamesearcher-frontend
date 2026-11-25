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

// Respuesta de GET /juegos: una página de juegos y los datos para armar el paginador.
export interface JuegosPaginados {
  datos: Juego[]
  /** Cantidad total de juegos que cumplen el filtro (en todas las páginas) */
  total: number
  /** Página devuelta, empieza en 1 */
  pagina: number
  limite: number
  /** 0 si no hay juegos */
  totalPaginas: number
}

// Parámetros opcionales del listado; sin pagina ni limite la API devuelve la página 1 con 20 juegos.
export interface FiltroJuegos {
  titulo?: string
  pagina?: number
  limite?: number
}
