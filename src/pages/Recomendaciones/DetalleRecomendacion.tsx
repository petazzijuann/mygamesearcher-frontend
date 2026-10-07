import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion/DialogoConfirmacion.tsx'
import { FormularioCalificacion } from '../../components/FormularioCalificacion/FormularioCalificacion.tsx'
import { ImagenJuego } from '../../components/ImagenJuego/ImagenJuego.tsx'
import { ListaEtiquetas } from '../../components/ListaEtiquetas/ListaEtiquetas.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { recomendacionService } from '../../services/recomendacionService.ts'
import type { Busqueda } from '../../types/busqueda.ts'
import type { Recomendacion } from '../../types/recomendacion.ts'
import { formatearFechaHora } from '../../utils/fechas.ts'

// Detalle de una búsqueda del historial (/recomendaciones/:id): criterios usados,
// juegos recomendados y calificación de cada uno.
export function DetalleRecomendacion() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0

  const [busqueda, setBusqueda] = useState<Busqueda | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null)

  const cargarBusqueda = useCallback(async () => {
    if (!idValido) {
      setError('La búsqueda que buscás no existe.')
      setCargando(false)
      return
    }
    setCargando(true)
    setError(null)
    try {
      setBusqueda(await recomendacionService.obtenerPorId(idNumero))
    } catch (errorCarga) {
      setError(obtenerMensajeError(errorCarga))
    } finally {
      setCargando(false)
    }
  }, [idValido, idNumero])

  useEffect(() => {
    void cargarBusqueda()
  }, [cargarBusqueda])

  // Si se llegó desde el historial, "Volver" respeta el filtro de fechas que había.
  function volver() {
    if (location.key !== 'default') navigate(-1)
    else navigate('/recomendaciones')
  }

  // Se actualizan solo los datos de la calificación; el resto ya estaba en pantalla.
  function actualizarCalificacion(actualizada: Recomendacion) {
    setBusqueda((actual) =>
      actual
        ? {
            ...actual,
            recomendaciones: actual.recomendaciones.map((recomendacion) =>
              recomendacion.juego.id === actualizada.juego.id
                ? {
                    ...recomendacion,
                    calificacion: actualizada.calificacion,
                    comentario: actualizada.comentario,
                    fechaCalificacion: actualizada.fechaCalificacion,
                  }
                : recomendacion,
            ),
          }
        : actual,
    )
  }

  async function confirmarBorrado() {
    setBorrando(true)
    setErrorBorrado(null)
    try {
      await recomendacionService.eliminar(idNumero)
      navigate('/recomendaciones', { state: { mensaje: 'Se borró la búsqueda de tu historial.' } })
    } catch (errorAccion) {
      setErrorBorrado(obtenerMensajeError(errorAccion))
      setBorrando(false)
      setConfirmandoBorrado(false)
    }
  }

  const recomendaciones = busqueda
    ? [...busqueda.recomendaciones].sort((a, b) => a.orden - b.orden)
    : []

  return (
    <section className="flex flex-col gap-6">
      <button
        type="button"
        onClick={volver}
        className="self-start text-sm font-medium text-indigo-700 hover:underline"
      >
        ← Volver al historial
      </button>

      {cargando && <Cargando texto="Cargando recomendación..." />}

      {!cargando && error && (
        <MensajeError
          mensaje={error}
          onReintentar={idValido ? () => void cargarBusqueda() : undefined}
        />
      )}

      {!cargando && !error && busqueda && (
        <>
          <header className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Recomendación del{' '}
                  <time dateTime={busqueda.fechaBusqueda}>
                    {formatearFechaHora(busqueda.fechaBusqueda)}
                  </time>
                </h1>
                <p className="mt-1 text-slate-600">Estos fueron los criterios que elegiste:</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmandoBorrado(true)}
                className="self-start rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Borrar del historial
              </button>
            </div>

            {errorBorrado && <MensajeError mensaje={errorBorrado} />}

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <dt className="text-sm font-semibold text-slate-900">Plataformas</dt>
                <dd>
                  <ListaEtiquetas items={busqueda.plataformas} chica />
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="text-sm font-semibold text-slate-900">Géneros</dt>
                <dd>
                  <ListaEtiquetas items={busqueda.generos} textoVacio="Ninguno" chica />
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="text-sm font-semibold text-slate-900">Características</dt>
                <dd>
                  <ListaEtiquetas items={busqueda.caracteristicas} chica />
                </dd>
              </div>
            </dl>
          </header>

          <section aria-labelledby="titulo-juegos" className="flex flex-col gap-4">
            <h2 id="titulo-juegos" className="text-xl font-bold text-slate-900">
              Juegos recomendados
            </h2>
            <ol className="grid gap-4 lg:grid-cols-2">
              {recomendaciones.map((recomendacion) => (
                <li key={recomendacion.id}>
                  <article className="flex h-full flex-col gap-3 rounded-lg bg-white p-4 shadow">
                    <div className="flex gap-4">
                      <ImagenJuego
                        url={recomendacion.juego.imagenUrl}
                        titulo={recomendacion.juego.titulo}
                        className="h-32 w-24 shrink-0 rounded"
                      />
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-sm font-semibold text-indigo-700">
                          Recomendación #{recomendacion.orden}
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">
                          <Link
                            to={`/juegos/${recomendacion.juego.id}`}
                            className="hover:text-indigo-700 hover:underline"
                          >
                            {recomendacion.juego.titulo}
                          </Link>
                        </h3>
                        <p className="text-sm text-slate-500">
                          {recomendacion.juego.anioLanzamiento} ·{' '}
                          {recomendacion.juego.clasificacionEdad.nombre}
                        </p>
                        <ListaEtiquetas items={recomendacion.juego.generos} chica />
                      </div>
                    </div>
                    <FormularioCalificacion
                      busquedaId={busqueda.id}
                      recomendacion={recomendacion}
                      onCalificada={actualizarCalificacion}
                    />
                  </article>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <DialogoConfirmacion
        abierto={confirmandoBorrado}
        titulo="Borrar del historial"
        mensaje="¿Seguro que querés borrar esta búsqueda y sus recomendaciones? Los juegos no se borran."
        textoConfirmar="Borrar"
        procesando={borrando}
        onConfirmar={() => void confirmarBorrado()}
        onCancelar={() => setConfirmandoBorrado(false)}
      />
    </section>
  )
}
