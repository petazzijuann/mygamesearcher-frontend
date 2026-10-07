import { useState } from 'react'
import { obtenerMensajeError } from '../../services/api.ts'
import { bibliotecaService } from '../../services/bibliotecaService.ts'
import type { EstadoJuego } from '../../types/juegoGuardado.ts'
import { estadosJuego, textoEstado } from '../../utils/estadoJuego.ts'

const iconoEstado: Record<EstadoJuego, string> = {
  ME_INTERESA: '⭐',
  YA_JUGADO: '✔',
}

interface BotonesBibliotecaProps {
  juegoId: number
  tituloJuego: string
  /** Estado actual del juego en la biblioteca (null = no está guardado) */
  estado: EstadoJuego | null
  /** Avisa el nuevo estado después de que la API confirmó el cambio (prop de salida) */
  onCambio: (estado: EstadoJuego | null) => void
}

// Botones "Me interesa" / "Ya jugado". Tocar el que está marcado quita el juego de la biblioteca.
export function BotonesBiblioteca({ juegoId, tituloJuego, estado, onCambio }: BotonesBibliotecaProps) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function alternar(elegido: EstadoJuego) {
    setProcesando(true)
    setError(null)
    try {
      if (estado === elegido) {
        await bibliotecaService.quitar(juegoId)
        onCambio(null)
      } else if (estado === null) {
        await bibliotecaService.guardar(juegoId, elegido)
        onCambio(elegido)
      } else {
        await bibliotecaService.cambiarEstado(juegoId, elegido)
        onCambio(elegido)
      }
    } catch (errorAccion) {
      setError(obtenerMensajeError(errorAccion))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={`Biblioteca: ${tituloJuego}`} className="flex gap-2">
        {estadosJuego.map((opcion) => {
          const marcado = estado === opcion
          return (
            <button
              key={opcion}
              type="button"
              onClick={() => void alternar(opcion)}
              disabled={procesando}
              aria-pressed={marcado}
              title={marcado ? 'Tocá de nuevo para quitarlo de tu biblioteca' : undefined}
              className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition disabled:opacity-50 ${
                marcado
                  ? 'border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span aria-hidden="true">{iconoEstado[opcion]} </span>
              {textoEstado[opcion]}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
