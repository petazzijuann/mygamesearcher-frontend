import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion/DialogoConfirmacion.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { MensajeExito } from '../../components/MensajeExito/MensajeExito.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { generoService } from '../../services/generoService.ts'
import type { Genero } from '../../types/genero.ts'

// El formulario vuelve al listado con { mensaje } en el state de la navegación.
function leerMensajeNavegacion(estado: unknown): string | null {
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

export function ListadoGeneros() {
  const location = useLocation()
  const navigate = useNavigate()

  const [generos, setGeneros] = useState<Genero[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(() =>
    leerMensajeNavegacion(location.state),
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [aEliminar, setAEliminar] = useState<Genero | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const cargarGeneros = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      setGeneros(await generoService.listar())
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarGeneros()
  }, [cargarGeneros])

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
      await generoService.eliminar(aEliminar.id)
      setGeneros((actuales) => actuales.filter((genero) => genero.id !== aEliminar.id))
      setMensajeExito(`Se eliminó el género "${aEliminar.nombre}".`)
    } catch (error) {
      setErrorAccion(obtenerMensajeError(error))
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Géneros</h1>
        <Link
          to="/generos/nuevo"
          className="rounded-md bg-indigo-700 px-4 py-2 text-center font-medium text-white hover:bg-indigo-600"
        >
          Nuevo género
        </Link>
      </header>

      {mensajeExito && (
        <MensajeExito mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />
      )}
      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && <Cargando texto="Cargando géneros..." />}

      {!cargando && errorCarga && (
        <MensajeError mensaje={errorCarga} onReintentar={() => void cargarGeneros()} />
      )}

      {!cargando && !errorCarga && generos.length === 0 && (
        <p className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          Todavía no hay géneros cargados. Creá el primero con el botón "Nuevo género".
        </p>
      )}

      {!cargando && !errorCarga && generos.length > 0 && (
        // En celular cada fila se ve como una tarjeta; desde MD, como tabla.
        <table className="w-full md:overflow-hidden md:rounded-lg md:bg-white md:shadow">
          <caption className="sr-only">Listado de géneros</caption>
          <thead className="hidden bg-slate-100 text-left text-sm text-slate-700 md:table-header-group">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="flex flex-col gap-3 md:table-row-group">
            {generos.map((genero) => (
              <tr
                key={genero.id}
                className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow md:table-row md:rounded-none md:border-t md:border-slate-200 md:p-0 md:shadow-none"
              >
                <td className="font-medium text-slate-900 md:px-4 md:py-3">{genero.nombre}</td>
                <td className="md:px-4 md:py-3">
                  <div className="flex gap-2 md:justify-end">
                    <Link
                      to={`/generos/${genero.id}/editar`}
                      aria-label={`Editar ${genero.nombre}`}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 md:flex-none"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAEliminar(genero)}
                      aria-label={`Eliminar ${genero.nombre}`}
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
        titulo="Eliminar género"
        mensaje={`¿Seguro que querés eliminar "${aEliminar?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        procesando={eliminando}
        onConfirmar={() => void confirmarEliminacion()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}
