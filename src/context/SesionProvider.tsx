import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CLAVE_TOKEN, CLAVE_USUARIO, EVENTO_SESION_VENCIDA } from '../services/api.ts'
import type { RespuestaLoginDto, UsuarioLogin } from '../types/auth.ts'
import { SesionContexto, type ValorSesion } from './sesion.ts'

function esUsuarioLogin(valor: unknown): valor is UsuarioLogin {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor &&
    typeof valor.id === 'number' &&
    'nombre' in valor &&
    typeof valor.nombre === 'string' &&
    'apellido' in valor &&
    typeof valor.apellido === 'string' &&
    'email' in valor &&
    typeof valor.email === 'string' &&
    'rol' in valor &&
    (valor.rol === 'USUARIO' || valor.rol === 'ADMIN')
  )
}

function borrarSesionGuardada() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
  } catch {
    // Si el navegador no deja usar localStorage, no hay nada que borrar.
  }
}

// Lee la sesión guardada. Si falta el token o el usuario está incompleto, no hay sesión.
function leerSesionGuardada(): UsuarioLogin | null {
  try {
    const token = localStorage.getItem(CLAVE_TOKEN)
    const texto = localStorage.getItem(CLAVE_USUARIO)
    const usuario: unknown = texto ? JSON.parse(texto) : null
    if (token && esUsuarioLogin(usuario)) return usuario
  } catch {
    // JSON roto o localStorage bloqueado: se trata como sin sesión.
  }
  borrarSesionGuardada()
  return null
}

// Guarda la sesión (token + usuario) y la comparte con toda la app.
export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogin | null>(leerSesionGuardada)
  const [vencida, setVencida] = useState(false)

  const iniciarSesion = useCallback((respuesta: RespuestaLoginDto) => {
    try {
      localStorage.setItem(CLAVE_TOKEN, respuesta.token)
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
    } catch {
      // Sin localStorage la sesión dura hasta recargar la página.
    }
    setVencida(false)
    setUsuario(respuesta.usuario)
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarSesionGuardada()
    setUsuario(null)
  }, [])

  const olvidarVencimiento = useCallback(() => setVencida(false), [])

  useEffect(() => {
    // La API rechazó el token (lo avisa el interceptor de api.ts).
    function alVencer() {
      borrarSesionGuardada()
      setUsuario(null)
      setVencida(true)
    }
    // Si se entra o se sale en otra pestaña, esta se pone al día.
    function alCambiarOtraPestania(evento: StorageEvent) {
      if (evento.key === CLAVE_TOKEN || evento.key === CLAVE_USUARIO || evento.key === null) {
        setUsuario(leerSesionGuardada())
      }
    }
    window.addEventListener(EVENTO_SESION_VENCIDA, alVencer)
    window.addEventListener('storage', alCambiarOtraPestania)
    return () => {
      window.removeEventListener(EVENTO_SESION_VENCIDA, alVencer)
      window.removeEventListener('storage', alCambiarOtraPestania)
    }
  }, [])

  const valor = useMemo<ValorSesion>(
    () => ({
      usuario,
      esAdmin: usuario?.rol === 'ADMIN',
      vencida,
      iniciarSesion,
      cerrarSesion,
      olvidarVencimiento,
    }),
    [usuario, vencida, iniciarSesion, cerrarSesion, olvidarVencimiento],
  )

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}
