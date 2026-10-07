// Formato de los errores que devuelve el backend (ErrorRespuestaDto).
export interface ErrorRespuesta {
  statusCode: number
  message: string | string[]
  error: string
}
