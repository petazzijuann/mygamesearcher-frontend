import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { ImagenJuego } from '../../components/ImagenJuego/ImagenJuego.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { MensajeExito } from '../../components/MensajeExito/MensajeExito.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { coleccionService } from '../../services/coleccionService.ts'
import { juegoService } from '../../services/juegoService.ts'
import type { Coleccion } from '../../types/coleccion.ts'
import type { Juego } from '../../types/juego.ts'
import { formatearFecha } from '../../utils/fechas.ts'
import { leerMensajeNavegacion } from '../../utils/mensajeNavegacion.ts'

// Detalle de una colección: muestra sus juegos y permite agregar o quitar
// (CUU "Administrar colección").
export function DetalleColeccion() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0

  const [coleccion, setColeccion] = useState<Coleccion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(() =>
    leerMensajeNavegacion(location.state),
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  /** Id del juego que se está agregando o quitando (para deshabilitar su botón) */
  const [juegoEnProceso, setJuegoEnProceso] = useState<number | null>(null)

  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [resultados, setResultados] = useState<Juego[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)

  const cargarColeccion = useCallback(async () => {
    if (!idValido) {
      setErrorCarga('La colección que buscás no existe.')
      setCargando(false)
      return
    }
    setCargando(true)
    setErrorCarga(null)
    try {
      setColeccion(await coleccionService.obtenerPorId(idNumero))
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [idValido, idNumero])

  useEffect(() => {
    void cargarColeccion()
  }, [cargarColeccion])

  // Limpia el mensaje del historial para que no vuelva a aparecer al recargar.
  useEffect(() => {
    if (location.state !== null) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  async function buscarJuegos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setBuscando(true)
    setErrorBusqueda(null)
    try {
      setResultados(await juegoService.listar(textoBusqueda))
    } catch (error) {
      setErrorBusqueda(obtenerMensajeError(error))
    } finally {
      setBuscando(false)
    }
  }

  async function agregarJuego(juego: Juego) {
    setJuegoEnProceso(juego.id)
    setErrorAccion(null)
    setMensajeExito(null)
    try {
      setColeccion(await coleccionService.agregarJuego(idNumero, juego.id))
      setMensajeExito(`Se agregó "${juego.titulo}" a la colección.`)
    } catch (error) {
      setErrorAccion(obtenerMensajeError(error))
    } finally {
      setJuegoEnProceso(null)
    }
  }

  async function quitarJuego(juego: Juego) {
    setJuegoEnProceso(juego.id)
    setErrorAccion(null)
    setMensajeExito(null)
    try {
      await coleccionService.quitarJuego(idNumero, juego.id)
      setColeccion((actual) =>
        actual ? { ...actual, juegos: actual.juegos.filter((j) => j.id !== juego.id) } : actual,
      )
      setMensajeExito(`Se quitó "${juego.titulo}" de la colección.`)
    } catch (error) {
      setErrorAccion(obtenerMensajeError(error))
    } finally {
      setJuegoEnProceso(null)
    }
  }

  const idsEnColeccion = new Set(coleccion?.juegos.map((juego) => juego.id) ?? [])

  return (
    <section className="flex flex-col gap-6">
      <Link to="/colecciones" className="text-sm font-medium text-indigo-700 hover:underline">
        ← Volver a mis colecciones
      </Link>

      {cargando && <Cargando texto="Cargando colección..." />}

      {!cargando && errorCarga && (
        <MensajeError
          mensaje={errorCarga}
          onReintentar={idValido ? () => void cargarColeccion() : undefined}
        />
      )}

      {!cargando && !errorCarga && coleccion && (
        <>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{coleccion.nombre}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Creada el{' '}
                <time dateTime={coleccion.fechaCreacion}>
                  {formatearFecha(coleccion.fechaCreacion)}
                </time>
              </p>
              {coleccion.descripcion && (
                <p className="mt-2 max-w-2xl text-slate-600">{coleccion.descripcion}</p>
              )}
            </div>
            <Link
              to={`/colecciones/${coleccion.id}/editar`}
              className="self-start rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Editar datos
            </Link>
          </header>

          {mensajeExito && (
            <MensajeExito mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />
          )}
          {errorAccion && <MensajeError mensaje={errorAccion} />}

          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="titulo-juegos" className="flex flex-col gap-3">
              <h2 id="titulo-juegos" className="text-lg font-semibold text-slate-900">
                Juegos en la colección ({coleccion.juegos.length})
              </h2>

              {coleccion.juegos.length === 0 ? (
                <p className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
                  Esta colección todavía no tiene juegos. Buscalos en "Agregar juegos".
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {coleccion.juegos.map((juego) => (
                    <li
                      key={juego.id}
                      className="flex items-center gap-3 rounded-lg bg-white p-3 shadow"
                    >
                      <ImagenJuego
                        url={juego.imagenUrl}
                        titulo={juego.titulo}
                        className="h-16 w-12 shrink-0 rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{juego.titulo}</p>
                        <p className="text-sm text-slate-500">{juego.anioLanzamiento}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void quitarJuego(juego)}
                        disabled={juegoEnProceso !== null}
                        aria-label={`Quitar ${juego.titulo} de la colección`}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {juegoEnProceso === juego.id ? 'Quitando...' : 'Quitar'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="titulo-agregar" className="flex flex-col gap-3">
              <h2 id="titulo-agregar" className="text-lg font-semibold text-slate-900">
                Agregar juegos
              </h2>

              <form
                role="search"
                onSubmit={(evento) => void buscarJuegos(evento)}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <label htmlFor="busqueda" className="sr-only">
                  Buscar juegos por título
                </label>
                <input
                  id="busqueda"
                  type="search"
                  value={textoBusqueda}
                  onChange={(evento) => setTextoBusqueda(evento.target.value)}
                  placeholder="Buscar por título (vacío = todos)"
                  maxLength={100}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={buscando}
                  className="rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  {buscando ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {errorBusqueda && <MensajeError mensaje={errorBusqueda} />}

              {resultados !== null && !buscando && !errorBusqueda && resultados.length === 0 && (
                <p className="text-slate-600">No se encontraron juegos con ese título.</p>
              )}

              {resultados !== null && resultados.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {resultados.map((juego) => {
                    const yaAgregado = idsEnColeccion.has(juego.id)
                    return (
                      <li
                        key={juego.id}
                        className="flex items-center gap-3 rounded-lg bg-white p-3 shadow"
                      >
                        <ImagenJuego
                          url={juego.imagenUrl}
                          titulo={juego.titulo}
                          className="h-16 w-12 shrink-0 rounded"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{juego.titulo}</p>
                          <p className="text-sm text-slate-500">{juego.anioLanzamiento}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void agregarJuego(juego)}
                          disabled={yaAgregado || juegoEnProceso !== null}
                          aria-label={
                            yaAgregado
                              ? `${juego.titulo} ya está en la colección`
                              : `Agregar ${juego.titulo} a la colección`
                          }
                          className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:bg-slate-300 disabled:text-slate-600"
                        >
                          {yaAgregado
                            ? 'Ya agregado'
                            : juegoEnProceso === juego.id
                              ? 'Agregando...'
                              : 'Agregar'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  )
}
