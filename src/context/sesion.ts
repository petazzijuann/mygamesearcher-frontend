import { createContext, useContext } from 'react'
import type { RespuestaLoginDto, UsuarioLogin } from '../types/auth.ts'

export interface ValorSesion {
  /** Usuario logueado, o null si no hay sesión */
  usuario: UsuarioLogin | null
  esAdmin: boolean
  /** true cuando la API rechazó el token (venció): la app avisa y manda al login */
  vencida: boolean
  iniciarSesion: (respuesta: RespuestaLoginDto) => void
  cerrarSesion: () => void
  /** Se llama una vez mostrado el aviso de sesión vencida */
  olvidarVencimiento: () => void
}

export const SesionContexto = createContext<ValorSesion | null>(null)

// Hook para leer la sesión desde cualquier componente que esté dentro de SesionProvider.
export function useSesion(): ValorSesion {
  const valor = useContext(SesionContexto)
  if (!valor) {
    throw new Error('useSesion se tiene que usar dentro de <SesionProvider>')
  }
  return valor
}
