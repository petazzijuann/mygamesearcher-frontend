import { api } from './api.ts'
import type {
  CambiarEstadoDto,
  EstadoJuego,
  GuardarJuegoDto,
  JuegoGuardado,
} from '../types/juegoGuardado.ts'

const RUTA = '/biblioteca'

// Biblioteca personal del usuario logueado.
export const bibliotecaService = {
  /** Si se pasa un estado, la API devuelve solo los juegos con ese estado */
  async listar(estado?: EstadoJuego): Promise<JuegoGuardado[]> {
    const { data } = await api.get<JuegoGuardado[]>(RUTA, {
      params: estado ? { estado } : undefined,
    })
    return data
  },

  async guardar(juegoId: number, estado: EstadoJuego): Promise<JuegoGuardado> {
    const dto: GuardarJuegoDto = { juegoId, estado }
    const { data } = await api.post<JuegoGuardado>(RUTA, dto)
    return data
  },

  async cambiarEstado(juegoId: number, estado: EstadoJuego): Promise<JuegoGuardado> {
    const dto: CambiarEstadoDto = { estado }
    const { data } = await api.patch<JuegoGuardado>(`${RUTA}/${juegoId}`, dto)
    return data
  },

  async quitar(juegoId: number): Promise<void> {
    await api.delete(`${RUTA}/${juegoId}`)
  },
}
