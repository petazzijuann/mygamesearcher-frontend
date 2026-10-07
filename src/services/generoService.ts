import { api } from './api.ts'
import type { ActualizarGeneroDto, CrearGeneroDto, Genero } from '../types/genero.ts'

const RUTA = '/generos'

export const generoService = {
  async listar(): Promise<Genero[]> {
    const { data } = await api.get<Genero[]>(RUTA)
    return data
  },

  async obtenerPorId(id: number): Promise<Genero> {
    const { data } = await api.get<Genero>(`${RUTA}/${id}`)
    return data
  },

  async crear(dto: CrearGeneroDto): Promise<Genero> {
    const { data } = await api.post<Genero>(RUTA, dto)
    return data
  },

  async actualizar(id: number, dto: ActualizarGeneroDto): Promise<Genero> {
    const { data } = await api.patch<Genero>(`${RUTA}/${id}`, dto)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`${RUTA}/${id}`)
  },
}
