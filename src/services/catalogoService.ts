import { api } from './api.ts'

// Forma común de Genero, Plataforma, Caracteristica y ClasificacionEdad.
export interface ItemCatalogo {
  id: number
  nombre: string
}

export interface ServicioCatalogo<T extends ItemCatalogo, TCrear, TActualizar> {
  listar(): Promise<T[]>
  obtenerPorId(id: number): Promise<T>
  crear(dto: TCrear): Promise<T>
  actualizar(id: number, dto: TActualizar): Promise<T>
  eliminar(id: number): Promise<void>
}

// Arma el servicio CRUD de un catálogo a partir de su ruta en la API (por ejemplo '/generos').
export function crearServicioCatalogo<T extends ItemCatalogo, TCrear, TActualizar>(
  ruta: string,
): ServicioCatalogo<T, TCrear, TActualizar> {
  return {
    async listar() {
      const { data } = await api.get<T[]>(ruta)
      return data
    },

    async obtenerPorId(id) {
      const { data } = await api.get<T>(`${ruta}/${id}`)
      return data
    },

    async crear(dto) {
      const { data } = await api.post<T>(ruta, dto)
      return data
    },

    async actualizar(id, dto) {
      const { data } = await api.patch<T>(`${ruta}/${id}`, dto)
      return data
    },

    async eliminar(id) {
      await api.delete(`${ruta}/${id}`)
    },
  }
}
