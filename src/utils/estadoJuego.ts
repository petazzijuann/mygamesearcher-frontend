import type { EstadoJuego } from '../types/juegoGuardado.ts'

// Textos para mostrar cada estado de la biblioteca en la interfaz.
export const textoEstado: Record<EstadoJuego, string> = {
  ME_INTERESA: 'Me interesa',
  YA_JUGADO: 'Ya jugado',
}

export const estadosJuego: EstadoJuego[] = ['ME_INTERESA', 'YA_JUGADO']

// Para validar lo que llega en la URL (?estado=...).
export function esEstadoJuego(valor: string | null): valor is EstadoJuego {
  return valor === 'ME_INTERESA' || valor === 'YA_JUGADO'
}
