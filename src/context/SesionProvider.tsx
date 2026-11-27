import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CLAVE_TOKEN, CLAVE_USUARIO, EVENTO_SESION_VENCIDA } from '../services/api.ts'
import type { RespuestaLoginDto, UsuarioLogin } from '../types/auth.ts'
import { CANAL_SESION, SesionContexto, type MensajeSesion, type ValorSesion } from './sesion.ts'

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

function esMensajeSesion(valor: unknown): valor is MensajeSesion {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'tipo' in valor &&
    (valor.tipo === 'inicio' || valor.tipo === 'cierre')
  )
}

// Abre el canal entre pestañas. Si el navegador no tiene BroadcastChannel, cada pestaña
// sigue funcionando por su cuenta (se pone al día al recargar).
function abrirCanal(): BroadcastChannel | null {
  return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CANAL_SESION)
}

// Guarda la sesión (token + usuario) y la comparte con toda la app.
export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogin | null>(leerSesionGuardada)
  const [vencida, setVencida] = useState(false)
  const canalRef = useRef<BroadcastChannel | null>(null)

  // Avisa a las otras pestañas. postMessage no le llega a la pestaña que lo manda.
  const avisarOtrasPestanias = useCallback((mensaje: MensajeSesion) => {
    canalRef.current?.postMessage(mensaje)
  }, [])

  const iniciarSesion = useCallback((respuesta: RespuestaLoginDto) => {
    try {
      localStorage.setItem(CLAVE_TOKEN, respuesta.token)
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
    } catch {
      // Sin localStorage la sesión dura hasta recargar la página.
    }
    setVencida(false)
    setUsuario(respuesta.usuario)
    avisarOtrasPestanias({ tipo: 'inicio' })
  }, [avisarOtrasPestanias])

  const cerrarSesion = useCallback(() => {
    borrarSesionGuardada()
    setUsuario(null)
    avisarOtrasPestanias({ tipo: 'cierre' })
  }, [avisarOtrasPestanias])

  const olvidarVencimiento = useCallback(() => setVencida(false), [])

  useEffect(() => {
    // La API rechazó el token (lo avisa el interceptor de api.ts). Como el token es el mismo
    // en todas las pestañas, también se les avisa que la sesión se cerró.
    function alVencer() {
      borrarSesionGuardada()
      setUsuario(null)
      setVencida(true)
      avisarOtrasPestanias({ tipo: 'cierre' })
    }
    window.addEventListener(EVENTO_SESION_VENCIDA, alVencer)

    // Se escucha un aviso explícito de la app ("se inició" o "se cerró la sesión") y no el
    // evento 'storage', que salta ante cualquier escritura en localStorage, aunque no sea de la sesión.
    const canal = abrirCanal()
    canalRef.current = canal
    function alRecibirAviso(evento: MessageEvent<unknown>) {
      if (!esMensajeSesion(evento.data)) return
      if (evento.data.tipo === 'inicio') {
        // El token y el usuario ya están en localStorage, que se comparte entre pestañas
        setVencida(false)
        setUsuario(leerSesionGuardada())
      } else {
        setUsuario(null)
      }
    }
    canal?.addEventListener('message', alRecibirAviso)

    return () => {
      window.removeEventListener(EVENTO_SESION_VENCIDA, alVencer)
      canal?.removeEventListener('message', alRecibirAviso)
      canal?.close()
      canalRef.current = null
    }
  }, [avisarOtrasPestanias])

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
