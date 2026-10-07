import { crearServicioCatalogo } from './catalogoService.ts'
import type { ActualizarGeneroDto, CrearGeneroDto, Genero } from '../types/genero.ts'

export const generoService = crearServicioCatalogo<Genero, CrearGeneroDto, ActualizarGeneroDto>(
  '/generos',
)
