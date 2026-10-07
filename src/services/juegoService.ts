import { api } from './api.ts'
import type { ActualizarJuegoDto, CrearJuegoDto, Juego } from '../types/juego.ts'

const RUTA = '/juegos'

export const juegoService = {
  /** Si se pasa un título, la API filtra los juegos que lo contienen */
  async listar(titulo?: string): Promise<Juego[]> {
    const filtro = titulo?.trim()
    const { data } = await api.get<Juego[]>(RUTA, {
      params: filtro ? { titulo: filtro } : undefined,
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
