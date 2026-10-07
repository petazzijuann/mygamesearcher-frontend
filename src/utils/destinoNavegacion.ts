// El login y el registro reciben { desde: '/ruta' } en el state de la navegación
// para volver a esa pantalla después de ingresar. Se valida que sea una ruta interna.
export function leerDestino(estado: unknown): string {
  if (
    typeof estado === 'object' &&
    estado !== null &&
    'desde' in estado &&
    typeof estado.desde === 'string' &&
    estado.desde.startsWith('/') &&
    !estado.desde.startsWith('//') &&
    !estado.desde.startsWith('/login') &&
    !estado.desde.startsWith('/registro')
  ) {
    return estado.desde
  }
  return '/'
}
