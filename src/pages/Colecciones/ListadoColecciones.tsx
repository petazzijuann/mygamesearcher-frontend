import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion/DialogoConfirmacion.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { MensajeExito } from '../../components/MensajeExito/MensajeExito.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { coleccionService } from '../../services/coleccionService.ts'
import type { Coleccion } from '../../types/coleccion.ts'
import { formatearFecha } from '../../utils/fechas.ts'
import { leerMensajeNavegacion } from '../../utils/mensajeNavegacion.ts'

export function ListadoColecciones() {
  const location = useLocation()
  const navigate = useNavigate()

  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(() =>
    leerMensajeNavegacion(location.state),
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [aEliminar, setAEliminar] = useState<Coleccion | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const cargarColecciones = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      setColecciones(await coleccionService.listar())
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarColecciones()
  }, [cargarColecciones])

  // Limpia el mensaje del historial para que no vuelva a aparecer al recargar.
  useEffect(() => {
    if (location.state !== null) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  async function confirmarEliminacion() {
    if (!aEliminar) return
    setEliminando(true)
    setErrorAccion(null)
    setMensajeExito(null)
    try {
      await coleccionService.eliminar(aEliminar.id)
      setColecciones((actuales) => actuales.filter((coleccion) => coleccion.id !== aEliminar.id))
      setMensajeExito(`Se eliminó la colección "${aEliminar.nombre}".`)
    } catch (error) {
      setErrorAccion(obtenerMensajeError(error))
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Mis colecciones</h1>
          <p className="mt-1 text-slate-600">Agrupá tus juegos como quieras.</p>
        </div>
        <Link
          to="/colecciones/nueva"
          className="rounded-md bg-indigo-700 px-4 py-2 text-center font-medium text-white hover:bg-indigo-600"
        >
          Nueva colección
        </Link>
      </header>

      {mensajeExito && (
        <MensajeExito mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />
      )}
      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && <Cargando texto="Cargando colecciones..." />}

      {!cargando && errorCarga && (
        <MensajeError mensaje={errorCarga} onReintentar={() => void cargarColecciones()} />
      )}

      {!cargando && !errorCarga && colecciones.length === 0 && (
        <p className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          Todavía no tenés colecciones. Creá la primera con el botón "Nueva colección".
        </p>
      )}

      {!cargando && !errorCarga && colecciones.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colecciones.map((coleccion) => (
            <li key={coleccion.id}>
              <article className="flex h-full flex-col gap-3 rounded-lg bg-white p-5 shadow">
                <header>
                  <h2 className="text-lg font-semibold text-slate-900">{coleccion.nombre}</h2>
                  <p className="text-sm text-slate-500">
                    {coleccion.juegos.length} {coleccion.juegos.length === 1 ? 'juego' : 'juegos'}{' '}
                    · Creada el{' '}
                    <time dateTime={coleccion.fechaCreacion}>
                      {formatearFecha(coleccion.fechaCreacion)}
                    </time>
                  </p>
                </header>
                <p className="line-clamp-3 flex-1 text-sm text-slate-600">
                  {coleccion.descripcion ?? 'Sin descripción.'}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/colecciones/${coleccion.id}`}
                    aria-label={`Ver ${coleccion.nombre}`}
                    className="flex-1 rounded-md bg-indigo-700 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-indigo-600"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/colecciones/${coleccion.id}/editar`}
                    aria-label={`Editar ${coleccion.nombre}`}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAEliminar(coleccion)}
                    aria-label={`Eliminar ${coleccion.nombre}`}
                    className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <DialogoConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar colección"
        mensaje={`¿Seguro que querés eliminar "${aEliminar?.nombre ?? ''}"? Los juegos no se borran, solo la colección.`}
        textoConfirmar="Eliminar"
        procesando={eliminando}
        onConfirmar={() => void confirmarEliminacion()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}
