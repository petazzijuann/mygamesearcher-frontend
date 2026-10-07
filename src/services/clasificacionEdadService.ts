import { crearServicioCatalogo } from './catalogoService.ts'
import type {
  ActualizarClasificacionEdadDto,
  ClasificacionEdad,
  CrearClasificacionEdadDto,
} from '../types/clasificacionEdad.ts'

export const clasificacionEdadService = crearServicioCatalogo<
  ClasificacionEdad,
  CrearClasificacionEdadDto,
  ActualizarClasificacionEdadDto
>('/clasificaciones-edad')
