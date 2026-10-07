import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion/DialogoConfirmacion.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { MensajeExito } from '../../components/MensajeExito/MensajeExito.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import type { ItemCatalogo } from '../../services/catalogoService.ts'
import { textosCatalogo, type ConfigCatalogo } from './configCatalogos.ts'

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

interface ListadoCatalogoProps {
  config: ConfigCatalogo
}

// Listado con alta, edición y baja para cualquier catálogo (Género, Plataforma, ...).
export function ListadoCatalogo({ config }: ListadoCatalogoProps) {
  const { rutaBase, titulo, singular, servicio } = config
  const textos = textosCatalogo(config)
  const location = useLocation()
  const navigate = useNavigate()

  const [items, setItems] = useState<ItemCatalogo[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(() =>
    leerMensajeNavegacion(location.state),
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [aEliminar, setAEliminar] = useState<ItemCatalogo | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const cargarItems = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      setItems(await servicio.listar())
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [servicio])

  useEffect(() => {
    void cargarItems()
  }, [cargarItems])

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
      await servicio.eliminar(aEliminar.id)
      setItems((actuales) => actuales.filter((item) => item.id !== aEliminar.id))
      setMensajeExito(`Se eliminó ${textos.articulo} ${singular} "${aEliminar.nombre}".`)
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
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{titulo}</h1>
        </div>
        <Link
          to={`${rutaBase}/nuevo`}
          className="rounded-md bg-indigo-700 px-4 py-2 text-center font-medium text-white hover:bg-indigo-600"
        >
          {textos.nuevo}
        </Link>
      </header>

      {mensajeExito && (
        <MensajeExito mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />
      )}
      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && <Cargando texto={`Cargando ${textos.plural}...`} />}

      {!cargando && errorCarga && (
        <MensajeError mensaje={errorCarga} onReintentar={() => void cargarItems()} />
      )}

      {!cargando && !errorCarga && items.length === 0 && (
        <p className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          Todavía no hay {textos.plural} {textos.cargados}. Usá el botón "{textos.nuevo}" para agregar.
        </p>
      )}

      {!cargando && !errorCarga && items.length > 0 && (
        // En celular cada fila se ve como una tarjeta; desde MD, como tabla.
        <table className="w-full md:overflow-hidden md:rounded-lg md:bg-white md:shadow">
          <caption className="sr-only">Listado de {textos.plural}</caption>
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
            {items.map((item) => (
              <tr
                key={item.id}
                className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow md:table-row md:rounded-none md:border-t md:border-slate-200 md:p-0 md:shadow-none"
              >
                <td className="font-medium text-slate-900 md:px-4 md:py-3">{item.nombre}</td>
                <td className="md:px-4 md:py-3">
                  <div className="flex gap-2 md:justify-end">
                    <Link
                      to={`${rutaBase}/${item.id}/editar`}
                      aria-label={`Editar ${item.nombre}`}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 md:flex-none"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAEliminar(item)}
                      aria-label={`Eliminar ${item.nombre}`}
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
        titulo={`Eliminar ${singular}`}
        mensaje={`¿Seguro que querés eliminar "${aEliminar?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        procesando={eliminando}
        onConfirmar={() => void confirmarEliminacion()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}
