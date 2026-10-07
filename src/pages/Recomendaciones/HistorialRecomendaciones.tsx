import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AvisoIniciarSesion } from '../../components/AvisoIniciarSesion/AvisoIniciarSesion.tsx'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion/DialogoConfirmacion.tsx'
import { ImagenJuego } from '../../components/ImagenJuego/ImagenJuego.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { MensajeExito } from '../../components/MensajeExito/MensajeExito.tsx'
import { useSesion } from '../../context/sesion.ts'
import { obtenerMensajeError } from '../../services/api.ts'
import { recomendacionService } from '../../services/recomendacionService.ts'
import type { BusquedaResumen } from '../../types/busqueda.ts'
import { esFechaAAAAMMDD, formatearFecha, formatearFechaHora } from '../../utils/fechas.ts'
import { leerMensajeNavegacion } from '../../utils/mensajeNavegacion.ts'

// Texto corto con los criterios de una búsqueda: "PC, PS5 · Acción, RPG · Cooperativo"
function resumirCriterios(busqueda: BusquedaResumen): string {
  return [busqueda.plataformas, busqueda.generos, busqueda.caracteristicas]
    .filter((lista) => lista.length > 0)
    .map((lista) => lista.map((item) => item.nombre).join(', '))
    .join(' · ')
}

// Historial de recomendaciones del usuario, con filtro por fecha (desde / hasta).
// El filtro vive en la URL (?desde=AAAA-MM-DD&hasta=AAAA-MM-DD).
export function HistorialRecomendaciones() {
  const sesion = useSesion().usuario !== null
  const location = useLocation()
  const navigate = useNavigate()
  const [parametros, setParametros] = useSearchParams()
  const valorDesde = parametros.get('desde')
  const valorHasta = parametros.get('hasta')
  const desde = esFechaAAAAMMDD(valorDesde) ? valorDesde : ''
  const hasta = esFechaAAAAMMDD(valorHasta) ? valorHasta : ''

  // Lo que el usuario está escribiendo en el filtro (se aplica con "Filtrar").
  const [desdeElegido, setDesdeElegido] = useState(desde)
  const [hastaElegido, setHastaElegido] = useState(hasta)
  const [errorFiltro, setErrorFiltro] = useState<string | null>(null)

  const [busquedas, setBusquedas] = useState<BusquedaResumen[]>([])
  const [cargando, setCargando] = useState(sesion)
  const [error, setError] = useState<string | null>(null)
  /** Se incrementa con "Reintentar" para volver a disparar la carga */
  const [intento, setIntento] = useState(0)

  const [mensajeExito, setMensajeExito] = useState<string | null>(() =>
    leerMensajeNavegacion(location.state),
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [aBorrar, setABorrar] = useState<BusquedaResumen | null>(null)
  const [borrando, setBorrando] = useState(false)

  useEffect(() => {
    if (!sesion) return
    let vigente = true
    setCargando(true)
    setError(null)
    recomendacionService
      .listar({ desde, hasta })
      .then((datos) => {
        if (vigente) setBusquedas(datos)
      })
      .catch((errorCarga: unknown) => {
        if (vigente) setError(obtenerMensajeError(errorCarga))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [sesion, desde, hasta, intento])

  // Limpia el mensaje del historial del navegador para que no vuelva a aparecer al recargar.
  useEffect(() => {
    if (location.state !== null) {
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null },
      )
    }
  }, [location.pathname, location.search, location.state, navigate])

  function aplicarFiltro(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    // Las fechas AAAA-MM-DD se pueden comparar como texto.
    if (desdeElegido && hastaElegido && desdeElegido > hastaElegido) {
      setErrorFiltro('La fecha "Desde" no puede ser posterior a la fecha "Hasta".')
      return
    }
    setErrorFiltro(null)
    const nuevos: Record<string, string> = {}
    if (desdeElegido) nuevos.desde = desdeElegido
    if (hastaElegido) nuevos.hasta = hastaElegido
    setParametros(nuevos)
  }

  function limpiarFiltro() {
    setDesdeElegido('')
    setHastaElegido('')
    setErrorFiltro(null)
    setParametros({})
  }

  async function confirmarBorrado() {
    if (!aBorrar) return
    setBorrando(true)
    setErrorAccion(null)
    setMensajeExito(null)
    try {
      await recomendacionService.eliminar(aBorrar.id)
      setBusquedas((actuales) => actuales.filter((busqueda) => busqueda.id !== aBorrar.id))
      setMensajeExito('Se borró la búsqueda de tu historial.')
    } catch (errorBorrado) {
      setErrorAccion(obtenerMensajeError(errorBorrado))
    } finally {
      setBorrando(false)
      setABorrar(null)
    }
  }

  const hayFiltro = desde !== '' || hasta !== ''

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Mis recomendaciones</h1>
          <p className="mt-1 text-slate-600">
            Todas las recomendaciones que pediste. Entrá a una para calificar los juegos.
          </p>
        </div>
        <Link
          to="/recomendar"
          className="rounded-md bg-indigo-700 px-4 py-2 text-center font-medium text-white hover:bg-indigo-600"
        >
          Nueva recomendación
        </Link>
      </header>

      {!sesion && <AvisoIniciarSesion para="ver tu historial de recomendaciones" />}

      {sesion && (
        <form
          onSubmit={aplicarFiltro}
          noValidate
          aria-label="Filtrar por fecha"
          className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="desde" className="text-sm font-medium text-slate-800">
              Desde
            </label>
            <input
              id="desde"
              type="date"
              value={desdeElegido}
              max={hastaElegido || undefined}
              onChange={(evento) => setDesdeElegido(evento.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="hasta" className="text-sm font-medium text-slate-800">
              Hasta
            </label>
            <input
              id="hasta"
              type="date"
              value={hastaElegido}
              min={desdeElegido || undefined}
              onChange={(evento) => setHastaElegido(evento.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-600 sm:flex-none"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={limpiarFiltro}
              disabled={!hayFiltro && !desdeElegido && !hastaElegido}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 sm:flex-none"
            >
              Limpiar
            </button>
          </div>
          {errorFiltro && (
            <p role="alert" className="text-sm text-red-700 sm:basis-full">
              {errorFiltro}
            </p>
          )}
        </form>
      )}

      {mensajeExito && (
        <MensajeExito mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />
      )}
      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {sesion && cargando && <Cargando texto="Cargando tu historial..." />}

      {sesion && !cargando && error && (
        <MensajeError mensaje={error} onReintentar={() => setIntento((n) => n + 1)} />
      )}

      {sesion && !cargando && !error && busquedas.length === 0 && (
        <div className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          <p>
            {hayFiltro
              ? 'No hay recomendaciones entre esas fechas.'
              : 'Todavía no pediste recomendaciones.'}
          </p>
          <Link
            to={hayFiltro ? '/recomendaciones' : '/recomendar'}
            onClick={hayFiltro ? limpiarFiltro : undefined}
            className="mt-3 inline-block font-medium text-indigo-700 hover:underline"
          >
            {hayFiltro ? 'Ver todo el historial' : 'Pedir mi primera recomendación'}
          </Link>
        </div>
      )}

      {sesion && !cargando && !error && busquedas.length > 0 && (
        <>
          <p className="text-sm text-slate-500" aria-live="polite">
            {busquedas.length} {busquedas.length === 1 ? 'búsqueda' : 'búsquedas'}
            {desde && ` desde el ${formatearFecha(`${desde}T12:00:00`)}`}
            {hasta && ` hasta el ${formatearFecha(`${hasta}T12:00:00`)}`}
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {busquedas.map((busqueda) => (
              <li key={busqueda.id}>
                <article className="flex h-full flex-col gap-3 rounded-lg bg-white p-4 shadow">
                  <header>
                    <h2 className="font-semibold text-slate-900">
                      <time dateTime={busqueda.fechaBusqueda}>
                        {formatearFechaHora(busqueda.fechaBusqueda)}
                      </time>
                    </h2>
                    <p className="text-sm text-slate-500">{resumirCriterios(busqueda)}</p>
                  </header>

                  <ol className="flex flex-col gap-2">
                    {busqueda.recomendaciones.map((recomendacion) => (
                      <li key={recomendacion.id} className="flex items-center gap-3">
                        <ImagenJuego
                          url={recomendacion.juego.imagenUrl}
                          titulo={recomendacion.juego.titulo}
                          className="h-12 w-9 shrink-0 rounded"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                          <span className="font-semibold text-indigo-700">
                            #{recomendacion.orden}
                          </span>{' '}
                          {recomendacion.juego.titulo}
                        </span>
                        {recomendacion.calificacion !== null && (
                          <span
                            className="text-sm whitespace-nowrap text-amber-500"
                            aria-label={`Calificado con ${recomendacion.calificacion} de 5`}
                          >
                            {'★'.repeat(recomendacion.calificacion)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>

                  <div className="mt-auto flex gap-2">
                    <Link
                      to={`/recomendaciones/${busqueda.id}`}
                      className="flex-1 rounded-md bg-indigo-700 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-indigo-600"
                    >
                      Ver detalle y calificar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setABorrar(busqueda)}
                      aria-label={`Borrar la búsqueda del ${formatearFechaHora(busqueda.fechaBusqueda)}`}
                      className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Borrar
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}

      <DialogoConfirmacion
        abierto={aBorrar !== null}
        titulo="Borrar del historial"
        mensaje="¿Seguro que querés borrar esta búsqueda y sus recomendaciones? Los juegos no se borran."
        textoConfirmar="Borrar"
        procesando={borrando}
        onConfirmar={() => void confirmarBorrado()}
        onCancelar={() => setABorrar(null)}
      />
    </section>
  )
}
