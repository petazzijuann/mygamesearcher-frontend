import { api } from './api.ts'
import type {
  ActualizarColeccionDto,
  AgregarJuegoDto,
  Coleccion,
  CrearColeccionDto,
} from '../types/coleccion.ts'

const RUTA = '/colecciones'

export const coleccionService = {
  /** Devuelve solo las colecciones del usuario logueado */
  async listar(): Promise<Coleccion[]> {
    const { data } = await api.get<Coleccion[]>(RUTA)
    return data
  },

  async obtenerPorId(id: number): Promise<Coleccion> {
    const { data } = await api.get<Coleccion>(`${RUTA}/${id}`)
    return data
  },

  async crear(dto: CrearColeccionDto): Promise<Coleccion> {
    const { data } = await api.post<Coleccion>(RUTA, dto)
    return data
  },

  async actualizar(id: number, dto: ActualizarColeccionDto): Promise<Coleccion> {
    const { data } = await api.patch<Coleccion>(`${RUTA}/${id}`, dto)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`${RUTA}/${id}`)
  },

  /** Devuelve la colección actualizada */
  async agregarJuego(id: number, juegoId: number): Promise<Coleccion> {
    const dto: AgregarJuegoDto = { juegoId }
    const { data } = await api.post<Coleccion>(`${RUTA}/${id}/juegos`, dto)
    return data
  },

  async quitarJuego(id: number, juegoId: number): Promise<void> {
    await api.delete(`${RUTA}/${id}/juegos/${juegoId}`)
  },
}
