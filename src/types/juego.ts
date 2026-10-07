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
