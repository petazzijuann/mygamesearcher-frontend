import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion/DialogoConfirmacion.tsx'
import { ImagenJuego } from '../../components/ImagenJuego/ImagenJuego.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { MensajeExito } from '../../components/MensajeExito/MensajeExito.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { juegoService } from '../../services/juegoService.ts'
import type { Juego } from '../../types/juego.ts'
import { leerMensajeNavegacion } from '../../utils/mensajeNavegacion.ts'

export function ListadoJuegosAdmin() {
  const location = useLocation()
  const navigate = useNavigate()

  const [juegos, setJuegos] = useState<Juego[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(() =>
    leerMensajeNavegacion(location.state),
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [aEliminar, setAEliminar] = useState<Juego | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const cargarJuegos = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      setJuegos(await juegoService.listar())
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarJuegos()
  }, [cargarJuegos])

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
      await juegoService.eliminar(aEliminar.id)
      setJuegos((actuales) => actuales.filter((juego) => juego.id !== aEliminar.id))
      setMensajeExito(`Se eliminó el juego "${aEliminar.titulo}".`)
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
        <div className="flex flex-col gap-2">
          <Link to="/admin" className="text-sm font-medium text-indigo-700 hover:underline">
            ← Volver a administración
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Juegos</h1>
        </div>
        <Link
          to="/admin/juegos/nuevo"
          className="rounded-md bg-indigo-700 px-4 py-2 text-center font-medium text-white hover:bg-indigo-600"
        >
          Nuevo juego
        </Link>
      </header>

      {mensajeExito && (
        <MensajeExito mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />
      )}
      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && <Cargando texto="Cargando juegos..." />}

      {!cargando && errorCarga && (
        <MensajeError mensaje={errorCarga} onReintentar={() => void cargarJuegos()} />
      )}

      {!cargando && !errorCarga && juegos.length === 0 && (
        <p className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          Todavía no hay juegos cargados. Usá el botón "Nuevo juego" para agregar.
        </p>
      )}

      {!cargando && !errorCarga && juegos.length > 0 && (
        // En celular cada fila se ve como una tarjeta; desde MD, como tabla.
        <table className="w-full md:overflow-hidden md:rounded-lg md:bg-white md:shadow">
          <caption className="sr-only">Listado de juegos</caption>
          <thead className="hidden bg-slate-100 text-left text-sm text-slate-700 md:table-header-group">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Juego
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Año
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Clasificación
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="flex flex-col gap-3 md:table-row-group">
            {juegos.map((juego) => (
              <tr
                key={juego.id}
                className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow md:table-row md:rounded-none md:border-t md:border-slate-200 md:p-0 md:shadow-none"
              >
                <td className="md:px-4 md:py-3">
                  <div className="flex items-center gap-3">
                    <ImagenJuego
                      url={juego.imagenUrl}
                      titulo={juego.titulo}
                      className="h-16 w-12 shrink-0 rounded"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{juego.titulo}</p>
                      {/* En celular el año y la clasificación van debajo del título */}
                      <p className="text-sm text-slate-500 md:hidden">
                        {juego.anioLanzamiento} · {juego.clasificacionEdad.nombre}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden text-slate-700 md:table-cell md:px-4 md:py-3">
                  {juego.anioLanzamiento}
                </td>
                <td className="hidden text-slate-700 md:table-cell md:px-4 md:py-3">
                  {juego.clasificacionEdad.nombre}
                </td>
                <td className="md:px-4 md:py-3">
                  <div className="flex gap-2 md:justify-end">
                    <Link
                      to={`/admin/juegos/${juego.id}/editar`}
                      aria-label={`Editar ${juego.titulo}`}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 md:flex-none"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAEliminar(juego)}
                      aria-label={`Eliminar ${juego.titulo}`}
                      className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 md:flex-none"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <DialogoConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar juego"
        mensaje={`¿Seguro que querés eliminar "${aEliminar?.titulo ?? ''}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        procesando={eliminando}
        onConfirmar={() => void confirmarEliminacion()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}
