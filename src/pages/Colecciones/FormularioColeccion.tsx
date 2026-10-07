import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { coleccionService } from '../../services/coleccionService.ts'

// Mismos límites que CrearColeccionDto en el backend.
const LARGO_NOMBRE = 100
const LARGO_DESCRIPCION = 500

interface ErroresColeccion {
  nombre?: string
  descripcion?: string
}

function validar(nombre: string, descripcion: string): ErroresColeccion {
  const errores: ErroresColeccion = {}
  if (nombre.trim() === '') errores.nombre = 'El nombre es obligatorio.'
  else if (nombre.trim().length > LARGO_NOMBRE) {
    errores.nombre = `El nombre no puede tener más de ${LARGO_NOMBRE} caracteres.`
  }
  if (descripcion.trim().length > LARGO_DESCRIPCION) {
    errores.descripcion = `La descripción no puede tener más de ${LARGO_DESCRIPCION} caracteres.`
  }
  return errores
}

const claseInput =
  'w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'

// Pantalla para crear (/colecciones/nueva) o editar (/colecciones/:id/editar) una colección.
// Los juegos se agregan y quitan desde el detalle de la colección.
export function FormularioColeccion() {
  const { id } = useParams()
  const navigate = useNavigate()

  const esEdicion = id !== undefined
  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errores, setErrores] = useState<ErroresColeccion>({})
  const [cargando, setCargando] = useState(esEdicion)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  const cargarColeccion = useCallback(async () => {
    if (!esEdicion) return
    if (!idValido) {
      setErrorCarga('La colección que buscás no existe.')
      setCargando(false)
      return
    }
    setCargando(true)
    setErrorCarga(null)
    try {
      const coleccion = await coleccionService.obtenerPorId(idNumero)
      setNombre(coleccion.nombre)
      setDescripcion(coleccion.descripcion ?? '')
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [esEdicion, idValido, idNumero])

  useEffect(() => {
    void cargarColeccion()
  }, [cargarColeccion])

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const erroresValidacion = validar(nombre, descripcion)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setGuardando(true)
    setErrorGuardado(null)
    const dto = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() === '' ? null : descripcion.trim(),
    }
    try {
      if (esEdicion) {
        await coleccionService.actualizar(idNumero, dto)
        navigate('/colecciones', {
          state: { mensaje: `Se actualizó la colección "${dto.nombre}".` },
        })
      } else {
        const creada = await coleccionService.crear(dto)
        // Después de crearla, se va al detalle para empezar a agregar juegos.
        navigate(`/colecciones/${creada.id}`, {
          state: { mensaje: `Se creó la colección "${dto.nombre}". Ahora podés agregarle juegos.` },
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
        <Link to="/colecciones" className="text-sm font-medium text-indigo-700 hover:underline">
          ← Volver a mis colecciones
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {esEdicion ? 'Editar colección' : 'Nueva colección'}
        </h1>
      </header>

      {cargando && <Cargando texto="Cargando colección..." />}

      {!cargando && errorCarga && (
        <MensajeError
          mensaje={errorCarga}
          onReintentar={idValido ? () => void cargarColeccion() : undefined}
        />
      )}

      {!cargando && !errorCarga && (
        <form
          onSubmit={(evento) => void manejarEnvio(evento)}
          noValidate
          className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6"
        >
          {errorGuardado && <MensajeError mensaje={errorGuardado} />}

          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="font-medium text-slate-800">
              Nombre <span className="text-red-700">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(evento) => {
                setNombre(evento.target.value)
                if (errores.nombre) {
                  setErrores(validar(evento.target.value, descripcion))
                }
              }}
              maxLength={LARGO_NOMBRE}
              autoFocus
              aria-invalid={errores.nombre !== undefined}
              aria-describedby="nombre-ayuda"
              className={`${claseInput} ${errores.nombre ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errores.nombre && (
              <p id="nombre-ayuda" className="text-sm text-red-700">
                {errores.nombre}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="descripcion" className="font-medium text-slate-800">
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={4}
              value={descripcion}
              onChange={(evento) => {
                setDescripcion(evento.target.value)
                if (errores.descripcion) {
                  setErrores(validar(nombre, evento.target.value))
                }
              }}
              maxLength={LARGO_DESCRIPCION}
              aria-invalid={errores.descripcion !== undefined}
              aria-describedby="descripcion-ayuda"
              className={`${claseInput} ${errores.descripcion ? 'border-red-500' : 'border-slate-300'}`}
            />
            <p
              id="descripcion-ayuda"
              className={`text-sm ${errores.descripcion ? 'text-red-700' : 'text-slate-500'}`}
            >
              {errores.descripcion ??
                `Opcional. ${descripcion.trim().length}/${LARGO_DESCRIPCION} caracteres`}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/colecciones')}
              disabled={guardando}
              className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear colección'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
