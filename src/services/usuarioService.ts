import { api } from './api.ts'
import type { CrearUsuarioDto, Usuario } from '../types/usuario.ts'

const RUTA = '/usuarios'

export const usuarioService = {
  /** Registro público: crea un usuario con rol USUARIO (409 si el email ya existe) */
  async registrar(dto: CrearUsuarioDto): Promise<Usuario> {
    const { data } = await api.post<Usuario>(RUTA, dto)
    return data
  },
}
