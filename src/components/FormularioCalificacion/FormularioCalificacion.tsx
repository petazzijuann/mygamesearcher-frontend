import { useState, type FormEvent } from 'react'
import { obtenerMensajeError } from '../../services/api.ts'
import { recomendacionService } from '../../services/recomendacionService.ts'
import type { Recomendacion } from '../../types/recomendacion.ts'
import { formatearFecha } from '../../utils/fechas.ts'
import { SelectorEstrellas } from '../SelectorEstrellas/SelectorEstrellas.tsx'

// Mismo límite que CalificarRecomendacionDto en el backend.
const LARGO_COMENTARIO = 500

interface FormularioCalificacionProps {
  busquedaId: number
  recomendacion: Recomendacion
  /** Avisa la recomendación actualizada después de guardar (prop de salida) */
  onCalificada: (recomendacion: Recomendacion) => void
}

// Calificar de 1 a 5 un juego recomendado, con un comentario opcional.
export function FormularioCalificacion({
  busquedaId,
  recomendacion,
  onCalificada,
}: FormularioCalificacionProps) {
  const [calificacion, setCalificacion] = useState<number | null>(recomendacion.calificacion)
  const [comentario, setComentario] = useState(recomendacion.comentario ?? '')
  const [errorEstrellas, setErrorEstrellas] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  const nombre = `calificacion-${recomendacion.juego.id}`
  const idComentario = `comentario-${recomendacion.juego.id}`

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (calificacion === null) {
      setErrorEstrellas('Elegí de 1 a 5 estrellas.')
      return
    }
    setGuardando(true)
    setError(null)
    setGuardado(false)
    try {
      const actualizada = await recomendacionService.calificar(busquedaId, recomendacion.juego.id, {
        calificacion,
        // Vacío se manda como null: el backend borra el comentario anterior.
        comentario: comentario.trim() === '' ? null : comentario.trim(),
      })
      setGuardado(true)
      onCalificada(actualizada)
    } catch (errorGuardado) {
      setError(obtenerMensajeError(errorGuardado))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form
      onSubmit={(evento) => void manejarEnvio(evento)}
      noValidate
      className="flex flex-col gap-3 border-t border-slate-200 pt-3"
    >
      <SelectorEstrellas
        nombre={nombre}
        leyenda="¿Qué te pareció esta recomendación?"
        valor={calificacion}
        deshabilitado={guardando}
        error={errorEstrellas ?? undefined}
        onCambiar={(valor) => {
          setCalificacion(valor)
          setErrorEstrellas(null)
          setGuardado(false)
        }}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={idComentario} className="text-sm font-medium text-slate-800">
          Comentario (opcional)
        </label>
        <textarea
          id={idComentario}
          rows={2}
          value={comentario}
          onChange={(evento) => {
            setComentario(evento.target.value)
            setGuardado(false)
          }}
          maxLength={LARGO_COMENTARIO}
          disabled={guardando}
          aria-describedby={`${idComentario}-ayuda`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <p id={`${idComentario}-ayuda`} className="text-xs text-slate-500">
          {comentario.trim().length}/{LARGO_COMENTARIO} caracteres
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {guardado && (
        <p role="status" className="text-sm text-green-700">
          ¡Gracias! Se guardó tu calificación.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {recomendacion.fechaCalificacion && (
          <p className="text-xs text-slate-500">
            Calificado el{' '}
            <time dateTime={recomendacion.fechaCalificacion}>
              {formatearFecha(recomendacion.fechaCalificacion)}
            </time>
          </p>
        )}
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 sm:ml-auto"
        >
          {guardando
            ? 'Guardando...'
            : recomendacion.calificacion === null
              ? 'Guardar calificación'
              : 'Actualizar calificación'}
        </button>
      </div>
    </form>
  )
}
