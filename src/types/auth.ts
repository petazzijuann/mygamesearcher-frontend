import type { Rol } from './usuario.ts'

export interface LoginDto {
  email: string
  contrasena: string
}

/** Datos del usuario que devuelve el login */
export interface UsuarioLogin {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
}

export interface RespuestaLoginDto {
  /** Token JWT: se manda en el header Authorization: Bearer <token> */
  token: string
  usuario: UsuarioLogin
}
