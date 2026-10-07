import { crearServicioCatalogo } from './catalogoService.ts'
import type {
  ActualizarCaracteristicaDto,
  Caracteristica,
  CrearCaracteristicaDto,
} from '../types/caracteristica.ts'

export const caracteristicaService = crearServicioCatalogo<
  Caracteristica,
  CrearCaracteristicaDto,
  ActualizarCaracteristicaDto
>('/caracteristicas')
