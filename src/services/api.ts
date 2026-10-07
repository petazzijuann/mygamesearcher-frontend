import axios from 'axios'
import type { ErrorRespuesta } from '../types/errorRespuesta.ts'

// Instancia común de axios: todos los servicios (generoService, juegoService, ...) la usan.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
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
  const datos: unknown = error.response.data
  if (esErrorRespuesta(datos)) {
    // En los errores de validación (400) el backend manda una lista con un mensaje por campo.
    return Array.isArray(datos.message) ? datos.message.join('. ') : datos.message
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.'
}
