import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { FormularioNombre } from '../../components/FormularioNombre/FormularioNombre.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import type { ItemCatalogo } from '../../services/catalogoService.ts'
import { textosCatalogo, type ConfigCatalogo } from './configCatalogos.ts'

interface FormularioCatalogoProps {
  config: ConfigCatalogo
}

// Pantalla para crear (<rutaBase>/nuevo) o editar (<rutaBase>/:id/editar) un ítem de catálogo.
export function FormularioCatalogo({ config }: FormularioCatalogoProps) {
  const { rutaBase, singular, servicio } = config
  const textos = textosCatalogo(config)
  const { id } = useParams()
  const navigate = useNavigate()

  const esEdicion = id !== undefined
  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0
  const mensajeNoExiste = `${config.femenino ? 'La' : 'El'} ${singular} que buscás no existe.`

  const [item, setItem] = useState<ItemCatalogo | null>(null)
  const [cargando, setCargando] = useState(esEdicion && idValido)
  const [errorCarga, setErrorCarga] = useState<string | null>(
    esEdicion && !idValido ? mensajeNoExiste : null,
  )
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  useEffect(() => {
    if (!esEdicion || !idValido) return
    let cancelado = false
    servicio
      .obtenerPorId(idNumero)
      .then((datos) => {
        if (!cancelado) setItem(datos)
      })
      .catch((error: unknown) => {
        if (!cancelado) setErrorCarga(obtenerMensajeError(error))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [esEdicion, idValido, idNumero, servicio])

  async function guardar(nombre: string) {
    setGuardando(true)
    setErrorGuardado(null)
    try {
      if (esEdicion) {
        await servicio.actualizar(idNumero, { nombre })
        navigate(rutaBase, {
          state: { mensaje: `Se actualizó ${textos.articulo} ${singular} "${nombre}".` },
        })
      } else {
        await servicio.crear({ nombre })
        navigate(rutaBase, {
          state: { mensaje: `Se creó ${textos.articulo} ${singular} "${nombre}".` },
        })
      }
    } catch (error) {
      setErrorGuardado(obtenerMensajeError(error))
      setGuardando(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link to={rutaBase} className="text-sm font-medium text-indigo-700 hover:underline">
          ← Volver a {textos.plural}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {esEdicion ? `Editar ${singular}` : textos.nuevo}
        </h1>
      </header>

      {cargando && <Cargando texto="Cargando datos..." />}

      {!cargando && errorCarga && <MensajeError mensaje={errorCarga} />}

      {!cargando && !errorCarga && (
        <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6">
          {errorGuardado && <MensajeError mensaje={errorGuardado} />}
          <FormularioNombre
            valorInicial={item?.nombre}
            textoBoton={esEdicion ? 'Guardar cambios' : `Crear ${singular}`}
            guardando={guardando}
            onGuardar={(nombre) => void guardar(nombre)}
            onCancelar={() => navigate(rutaBase)}
          />
        </div>
      )}
    </section>
  )
}
