import axios from 'axios'
import type { ErrorRespuesta } from '../types/errorRespuesta.ts'

// Claves donde se guarda la sesión en el navegador (las escribe SesionProvider).
export const CLAVE_TOKEN = 'token'
export const CLAVE_USUARIO = 'usuario'

export const RUTA_LOGIN = '/auth/login'

// Evento que avisa a la app que la API rechazó el token (venció o no es válido).
export const EVENTO_SESION_VENCIDA = 'sesion-vencida'

// Instancia común de axios: todos los servicios (generoService, juegoService, ...) la usan.
// VITE_API_URL es la dirección del backend (en local http://localhost:3000; en Vercel, la
// del backend publicado). Vite la escribe en el código al compilar: si cambia, hay que volver a publicar.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

// Si hay un token guardado, se manda en cada pedido.
api.interceptors.request.use((config) => {
  const token = leerToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si la API responde 401 a un pedido que llevaba token, la sesión ya no sirve:
// se avisa con un evento y SesionProvider la cierra. El 401 del login no cuenta
// (ahí significa email o contraseña incorrectos).
api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.url !== RUTA_LOGIN &&
    error.config?.headers.Authorization
  ) {
    window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA))
  }
  return Promise.reject(error)
})

function esErrorRespuesta(datos: unknown): datos is ErrorRespuesta {
  return (
    typeof datos === 'object' &&
    datos !== null &&
    'message' in datos &&
    (typeof datos.message === 'string' || Array.isArray(datos.message))
  )
}

// Convierte cualquier error de una llamada a la API en un texto apto para mostrar al usuario.
export function obtenerMensajeError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrió un error inesperado. Intentá de nuevo.'
  }
  // Sin respuesta (backend apagado, sin conexión o bloqueado por CORS), o 502/503/504
  // (el servidor intermedio no pudo llegar a la API).
  const status = error.response?.status
  if (!error.response || status === 502 || status === 503 || status === 504) {
    return 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
  }
  // En el login, el 401 trae el mensaje del backend (email o contraseña incorrectos).
  if (status === 401 && error.config?.url !== RUTA_LOGIN) {
    return 'Necesitás iniciar sesión para hacer esto.'
  }
  if (status === 403) {
    return 'No tenés permiso para hacer esta acción.'
  }
  const datos: unknown = error.response.data
  if (esErrorRespuesta(datos)) {
    // En los errores de validación (400) el backend manda una lista con un mensaje por campo.
    return Array.isArray(datos.message) ? datos.message.join('. ') : datos.message
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.'
}
