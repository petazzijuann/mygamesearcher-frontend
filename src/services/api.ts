import axios from 'axios'
import type { ErrorRespuesta } from '../types/errorRespuesta.ts'

// Clave donde se guarda el token JWT en el navegador.
// Por ahora se carga a mano; cuando exista la pantalla de login, la va a guardar ella.
export const CLAVE_TOKEN = 'token'

// Instancia común de axios: todos los servicios (generoService, juegoService, ...) la usan.
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

// Si hay un token guardado, se manda en cada pedido (lo piden las acciones de ADMIN).
api.interceptors.request.use((config) => {
  const token = leerToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
  }
  if (error.response.status === 401) {
    return 'Necesitás iniciar sesión como administrador para hacer esto.'
  }
  if (error.response.status === 403) {
    return 'No tenés permiso para hacer esta acción.'
  }
  const datos: unknown = error.response.data
  if (esErrorRespuesta(datos)) {
    // En los errores de validación (400) el backend manda una lista con un mensaje por campo.
    return Array.isArray(datos.message) ? datos.message.join('. ') : datos.message
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.'
}
