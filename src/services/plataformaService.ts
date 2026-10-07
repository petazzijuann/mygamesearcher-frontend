import { crearServicioCatalogo } from './catalogoService.ts'
import type {
  ActualizarPlataformaDto,
  CrearPlataformaDto,
  Plataforma,
} from '../types/plataforma.ts'

export const plataformaService = crearServicioCatalogo<
  Plataforma,
  CrearPlataformaDto,
  ActualizarPlataformaDto
>('/plataformas')
