import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { FormularioNombre } from '../../components/FormularioNombre/FormularioNombre.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { generoService } from '../../services/generoService.ts'
import type { Genero } from '../../types/genero.ts'

// Pantalla para crear (/generos/nuevo) o editar (/generos/:id/editar) un género.
export function FormularioGenero() {
  const { id } = useParams()
  const navigate = useNavigate()

  const esEdicion = id !== undefined
  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0

  const [genero, setGenero] = useState<Genero | null>(null)
  const [cargando, setCargando] = useState(esEdicion && idValido)
  const [errorCarga, setErrorCarga] = useState<string | null>(
    esEdicion && !idValido ? 'El género que buscás no existe.' : null,
  )
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  useEffect(() => {
    if (!esEdicion || !idValido) return
    let cancelado = false
    generoService
      .obtenerPorId(idNumero)
      .then((datos) => {
        if (!cancelado) setGenero(datos)
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
  }, [esEdicion, idValido, idNumero])

  async function guardar(nombre: string) {
    setGuardando(true)
    setErrorGuardado(null)
    try {
      if (esEdicion) {
        await generoService.actualizar(idNumero, { nombre })
        navigate('/generos', { state: { mensaje: `Se actualizó el género "${nombre}".` } })
      } else {
        await generoService.crear({ nombre })
        navigate('/generos', { state: { mensaje: `Se creó el género "${nombre}".` } })
      }
    } catch (error) {
      setErrorGuardado(obtenerMensajeError(error))
      setGuardando(false)
    }
  }

  const titulo = esEdicion ? 'Editar género' : 'Nuevo género'

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link to="/generos" className="text-sm font-medium text-indigo-700 hover:underline">
          ← Volver a géneros
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{titulo}</h1>
      </header>

      {cargando && <Cargando texto="Cargando género..." />}

      {!cargando && errorCarga && <MensajeError mensaje={errorCarga} />}

      {!cargando && !errorCarga && (
        <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6">
          {errorGuardado && <MensajeError mensaje={errorGuardado} />}
          <FormularioNombre
            valorInicial={genero?.nombre}
            textoBoton={esEdicion ? 'Guardar cambios' : 'Crear género'}
            guardando={guardando}
            onGuardar={(nombre) => void guardar(nombre)}
            onCancelar={() => navigate('/generos')}
          />
        </div>
      )}
    </section>
  )
}
