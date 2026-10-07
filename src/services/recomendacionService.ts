import { api } from './api.ts'
import type { Busqueda, GenerarRecomendacionDto } from '../types/busqueda.ts'

const RUTA = '/recomendaciones'

export const recomendacionService = {
  /**
   * CUU Generar recomendación: devuelve la búsqueda con 1 a 3 juegos recomendados
   * (sin los que el usuario marcó como YA_JUGADO). Responde 404 si ningún juego cumple.
   */
  async generar(dto: GenerarRecomendacionDto): Promise<Busqueda> {
    const { data } = await api.post<Busqueda>(RUTA, dto)
    return data
  },
}
