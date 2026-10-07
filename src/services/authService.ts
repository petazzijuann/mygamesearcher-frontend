import { api, RUTA_LOGIN } from './api.ts'
import type { LoginDto, RespuestaLoginDto } from '../types/auth.ts'

export const authService = {
  /** Devuelve el token y los datos del usuario; 401 si el email o la contraseña no coinciden */
  async login(dto: LoginDto): Promise<RespuestaLoginDto> {
    const { data } = await api.post<RespuestaLoginDto>(RUTA_LOGIN, dto)
    return data
  },
}
