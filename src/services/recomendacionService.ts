import { api } from './api.ts'
import type {
  Busqueda,
  BusquedaResumen,
  FiltroHistorial,
  GenerarRecomendacionDto,
} from '../types/busqueda.ts'
import type { CalificarRecomendacionDto, Recomendacion } from '../types/recomendacion.ts'

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

  /** Historial del usuario logueado, de la más reciente a la más vieja */
  async listar(filtro: FiltroHistorial = {}): Promise<BusquedaResumen[]> {
    const params: FiltroHistorial = {}
    if (filtro.desde) params.desde = filtro.desde
    if (filtro.hasta) params.hasta = filtro.hasta
    const { data } = await api.get<BusquedaResumen[]>(RUTA, { params })
    return data
  },

  /** Detalle de una búsqueda, con los datos completos de cada juego */
  async obtenerPorId(id: number): Promise<Busqueda> {
    const { data } = await api.get<Busqueda>(`${RUTA}/${id}`)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`${RUTA}/${id}`)
  },

  /** Califica de 1 a 5 un juego recomendado; devuelve la recomendación actualizada */
  async calificar(
    busquedaId: number,
    juegoId: number,
    dto: CalificarRecomendacionDto,
  ): Promise<Recomendacion> {
    const { data } = await api.patch<Recomendacion>(`${RUTA}/${busquedaId}/juegos/${juegoId}`, dto)
    return data
  },
}
