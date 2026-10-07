// Los formularios vuelven al listado con { mensaje } en el state de la navegación.
// Esta función lo lee de forma segura (el state puede ser cualquier cosa).
export function leerMensajeNavegacion(estado: unknown): string | null {
  if (
    typeof estado === 'object' &&
    estado !== null &&
    'mensaje' in estado &&
    typeof estado.mensaje === 'string'
  ) {
    return estado.mensaje
  }
  return null
}
