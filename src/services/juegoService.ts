import { api } from './api.ts'
import type {
  ActualizarJuegoDto,
  CrearJuegoDto,
  FiltroJuegos,
  Juego,
  JuegosPaginados,
} from '../types/juego.ts'

const RUTA = '/juegos'

export const juegoService = {
  /**
   * Devuelve una página de juegos. Si se pasa un título, la API filtra los juegos que lo contienen.
   * Sin pagina ni limite, la API devuelve la página 1 con 20 juegos.
   */
  async listar({ titulo, pagina, limite }: FiltroJuegos = {}): Promise<JuegosPaginados> {
    const filtro = titulo?.trim()
    const { data } = await api.get<JuegosPaginados>(RUTA, {
      params: { titulo: filtro || undefined, pagina, limite },
    })
    return data
  },

  async obtenerPorId(id: number): Promise<Juego> {
    const { data } = await api.get<Juego>(`${RUTA}/${id}`)
    return data
  },

  async crear(dto: CrearJuegoDto): Promise<Juego> {
    const { data } = await api.post<Juego>(RUTA, dto)
    return data
  },

  async actualizar(id: number, dto: ActualizarJuegoDto): Promise<Juego> {
    const { data } = await api.patch<Juego>(`${RUTA}/${id}`, dto)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`${RUTA}/${id}`)
  },
}
