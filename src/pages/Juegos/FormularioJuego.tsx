import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { ImagenJuego } from '../../components/ImagenJuego/ImagenJuego.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { SelectorMultiple } from '../../components/SelectorMultiple/SelectorMultiple.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { caracteristicaService } from '../../services/caracteristicaService.ts'
import { clasificacionEdadService } from '../../services/clasificacionEdadService.ts'
import { generoService } from '../../services/generoService.ts'
import { juegoService } from '../../services/juegoService.ts'
import { plataformaService } from '../../services/plataformaService.ts'
import type { Caracteristica } from '../../types/caracteristica.ts'
import type { ClasificacionEdad } from '../../types/clasificacionEdad.ts'
import type { Genero } from '../../types/genero.ts'
import type { CrearJuegoDto, Juego } from '../../types/juego.ts'
import type { Plataforma } from '../../types/plataforma.ts'

// Mismos límites que CrearJuegoDto en el backend.
const LARGO_TITULO = 100
const LARGO_DESCRIPCION = 2000
const LARGO_URL = 500
const ANIO_MINIMO = 1950
const ANIO_MAXIMO = 2026 // Fijo en el backend: si allá cambia, hay que cambiarlo acá.

// Los campos de texto se guardan como string mientras el usuario escribe;
// se convierten a número recién al armar el DTO.
interface ValoresJuego {
  titulo: string
  anioLanzamiento: string
  descripcion: string
  imagenUrl: string
  clasificacionEdadId: string
  plataformaIds: number[]
  generoIds: number[]
  caracteristicaIds: number[]
}

type ErroresJuego = Partial<Record<keyof ValoresJuego, string>>

interface Catalogos {
  clasificaciones: ClasificacionEdad[]
  plataformas: Plataforma[]
  generos: Genero[]
  caracteristicas: Caracteristica[]
}

const valoresIniciales: ValoresJuego = {
  titulo: '',
  anioLanzamiento: '',
  descripcion: '',
  imagenUrl: '',
  clasificacionEdadId: '',
  plataformaIds: [],
  generoIds: [],
  caracteristicaIds: [],
}

function valoresDesdeJuego(juego: Juego): ValoresJuego {
  return {
    titulo: juego.titulo,
    anioLanzamiento: String(juego.anioLanzamiento),
    descripcion: juego.descripcion,
    imagenUrl: juego.imagenUrl ?? '',
    clasificacionEdadId: String(juego.clasificacionEdad.id),
    plataformaIds: juego.plataformas.map((plataforma) => plataforma.id),
    generoIds: juego.generos.map((genero) => genero.id),
    caracteristicaIds: juego.caracteristicas.map((caracteristica) => caracteristica.id),
  }
}

function esUrlValida(valor: string): boolean {
  try {
    const url = new URL(valor)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validar(valores: ValoresJuego): ErroresJuego {
  const errores: ErroresJuego = {}
  const titulo = valores.titulo.trim()
  const descripcion = valores.descripcion.trim()
  const imagenUrl = valores.imagenUrl.trim()
  const anio = Number(valores.anioLanzamiento)

  if (titulo === '') errores.titulo = 'El título es obligatorio.'
  else if (titulo.length > LARGO_TITULO) {
    errores.titulo = `El título no puede tener más de ${LARGO_TITULO} caracteres.`
  }

  if (valores.anioLanzamiento.trim() === '') {
    errores.anioLanzamiento = 'El año de lanzamiento es obligatorio.'
  } else if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > ANIO_MAXIMO) {
    errores.anioLanzamiento = `Ingresá un año entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`
  }

  if (descripcion === '') errores.descripcion = 'La descripción es obligatoria.'
  else if (descripcion.length > LARGO_DESCRIPCION) {
    errores.descripcion = `La descripción no puede tener más de ${LARGO_DESCRIPCION} caracteres.`
  }

  if (imagenUrl !== '' && !esUrlValida(imagenUrl)) {
    errores.imagenUrl = 'Ingresá una dirección válida que empiece con http:// o https://.'
  } else if (imagenUrl.length > LARGO_URL) {
    errores.imagenUrl = `La dirección no puede tener más de ${LARGO_URL} caracteres.`
  }

  if (valores.clasificacionEdadId === '') {
    errores.clasificacionEdadId = 'Elegí una clasificación de edad.'
  }
  if (valores.plataformaIds.length === 0) errores.plataformaIds = 'Elegí al menos una plataforma.'
  if (valores.generoIds.length === 0) errores.generoIds = 'Elegí al menos un género.'

  return errores
}

// Se manda el juego completo: sirve para crear y también para editar
// (en el PATCH las listas enviadas reemplazan a las anteriores).
function armarDto(valores: ValoresJuego): CrearJuegoDto {
  const imagenUrl = valores.imagenUrl.trim()
  return {
    titulo: valores.titulo.trim(),
    anioLanzamiento: Number(valores.anioLanzamiento),
    descripcion: valores.descripcion.trim(),
    imagenUrl: imagenUrl === '' ? null : imagenUrl,
    clasificacionEdadId: Number(valores.clasificacionEdadId),
    plataformaIds: valores.plataformaIds,
    generoIds: valores.generoIds,
    caracteristicaIds: valores.caracteristicaIds,
  }
}

const claseInput =
  'w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'

interface CampoProps {
  id: string
  etiqueta: string
  obligatorio?: boolean
  error?: string
  ayuda?: string
  className?: string
  children: ReactNode
}

// Etiqueta + control + texto de ayuda o error. El control tiene que usar
// aria-describedby={`${id}-ayuda`} para que el lector de pantalla lea el mensaje.
function Campo({ id, etiqueta, obligatorio, error, ayuda, className = '', children }: CampoProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="font-medium text-slate-800">
        {etiqueta}
        {obligatorio && <span className="text-red-700"> *</span>}
      </label>
      {children}
      {(error ?? ayuda) && (
        <p id={`${id}-ayuda`} className={`text-sm ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {error ?? ayuda}
        </p>
      )}
    </div>
  )
}

// Pantalla para crear (/admin/juegos/nuevo) o editar (/admin/juegos/:id/editar) un juego.
export function FormularioJuego() {
  const { id } = useParams()
  const navigate = useNavigate()

  const esEdicion = id !== undefined
  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0

  const [catalogos, setCatalogos] = useState<Catalogos | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [valores, setValores] = useState<ValoresJuego>(valoresIniciales)
  const [errores, setErrores] = useState<ErroresJuego>({})
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  // Trae en paralelo las opciones de los selectores y, si se edita, el juego.
  const cargarDatos = useCallback(async () => {
    if (esEdicion && !idValido) {
      setErrorCarga('El juego que buscás no existe.')
      setCargando(false)
      return
    }
    setCargando(true)
    setErrorCarga(null)
    try {
      const [clasificaciones, plataformas, generos, caracteristicas, juego] = await Promise.all([
        clasificacionEdadService.listar(),
        plataformaService.listar(),
        generoService.listar(),
        caracteristicaService.listar(),
        esEdicion ? juegoService.obtenerPorId(idNumero) : Promise.resolve(null),
      ])
      setCatalogos({ clasificaciones, plataformas, generos, caracteristicas })
      if (juego) setValores(valoresDesdeJuego(juego))
    } catch (error) {
      setErrorCarga(obtenerMensajeError(error))
    } finally {
      setCargando(false)
    }
  }, [esEdicion, idValido, idNumero])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  function cambiar<K extends keyof ValoresJuego>(campo: K, valor: ValoresJuego[K]) {
    const nuevosValores = { ...valores, [campo]: valor }
    setValores(nuevosValores)
    // Si el campo ya mostraba un error, se vuelve a validar mientras se corrige.
    if (errores[campo]) {
      setErrores((actuales) => ({ ...actuales, [campo]: validar(nuevosValores)[campo] }))
    }
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const erroresValidacion = validar(valores)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) {
      setErrorGuardado('Revisá los campos marcados en rojo.')
      return
    }

    setGuardando(true)
    setErrorGuardado(null)
    const dto = armarDto(valores)
    try {
      if (esEdicion) {
        await juegoService.actualizar(idNumero, dto)
        navigate('/admin/juegos', { state: { mensaje: `Se actualizó el juego "${dto.titulo}".` } })
      } else {
        await juegoService.crear(dto)
        navigate('/admin/juegos', { state: { mensaje: `Se creó el juego "${dto.titulo}".` } })
      }
    } catch (error) {
      setErrorGuardado(obtenerMensajeError(error))
      setGuardando(false)
    }
  }

  // Sin clasificaciones, plataformas o géneros no se puede crear ningún juego.
  const faltantes = catalogos
    ? [
        { lista: catalogos.clasificaciones, texto: 'clasificaciones de edad', ruta: '/admin/clasificaciones-edad' },
        { lista: catalogos.plataformas, texto: 'plataformas', ruta: '/admin/plataformas' },
        { lista: catalogos.generos, texto: 'géneros', ruta: '/admin/generos' },
      ].filter((catalogo) => catalogo.lista.length === 0)
    : []

  const urlParaVistaPrevia = esUrlValida(valores.imagenUrl.trim()) ? valores.imagenUrl.trim() : null

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link to="/admin/juegos" className="text-sm font-medium text-indigo-700 hover:underline">
          ← Volver a juegos
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {esEdicion ? 'Editar juego' : 'Nuevo juego'}
        </h1>
      </header>

      {cargando && <Cargando texto="Cargando datos..." />}

      {!cargando && errorCarga && (
        <MensajeError
          mensaje={errorCarga}
          onReintentar={esEdicion && !idValido ? undefined : () => void cargarDatos()}
        />
      )}

      {!cargando && !errorCarga && catalogos && faltantes.length > 0 && (
        <div role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="font-medium">Antes de cargar un juego hace falta tener cargadas:</p>
          <ul className="mt-2 list-inside list-disc">
            {faltantes.map((faltante) => (
              <li key={faltante.ruta}>
                <Link to={faltante.ruta} className="font-medium underline">
                  {faltante.texto}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!cargando && !errorCarga && catalogos && faltantes.length === 0 && (
        <form
          onSubmit={(evento) => void manejarEnvio(evento)}
          noValidate
          className="flex flex-col gap-5 rounded-lg bg-white p-4 shadow sm:p-6"
        >
          {errorGuardado && <MensajeError mensaje={errorGuardado} />}

          <div className="grid gap-4 md:grid-cols-2">
            <Campo
              id="titulo"
              etiqueta="Título"
              obligatorio
              error={errores.titulo}
              className="md:col-span-2"
            >
              <input
                id="titulo"
                type="text"
                value={valores.titulo}
                onChange={(evento) => cambiar('titulo', evento.target.value)}
                maxLength={LARGO_TITULO}
                aria-invalid={errores.titulo !== undefined}
                aria-describedby="titulo-ayuda"
                className={`${claseInput} ${errores.titulo ? 'border-red-500' : 'border-slate-300'}`}
              />
            </Campo>

            <Campo
              id="anioLanzamiento"
              etiqueta="Año de lanzamiento"
              obligatorio
              error={errores.anioLanzamiento}
              ayuda={`Entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}`}
            >
              <input
                id="anioLanzamiento"
                type="number"
                inputMode="numeric"
                min={ANIO_MINIMO}
                max={ANIO_MAXIMO}
                value={valores.anioLanzamiento}
                onChange={(evento) => cambiar('anioLanzamiento', evento.target.value)}
                aria-invalid={errores.anioLanzamiento !== undefined}
                aria-describedby="anioLanzamiento-ayuda"
                className={`${claseInput} ${errores.anioLanzamiento ? 'border-red-500' : 'border-slate-300'}`}
              />
            </Campo>

            <Campo
              id="clasificacionEdadId"
              etiqueta="Clasificación de edad"
              obligatorio
              error={errores.clasificacionEdadId}
            >
              <select
                id="clasificacionEdadId"
                value={valores.clasificacionEdadId}
                onChange={(evento) => cambiar('clasificacionEdadId', evento.target.value)}
                aria-invalid={errores.clasificacionEdadId !== undefined}
                aria-describedby="clasificacionEdadId-ayuda"
                className={`${claseInput} bg-white ${errores.clasificacionEdadId ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">Elegí una opción</option>
                {catalogos.clasificaciones.map((clasificacion) => (
                  <option key={clasificacion.id} value={clasificacion.id}>
                    {clasificacion.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              id="descripcion"
              etiqueta="Descripción"
              obligatorio
              error={errores.descripcion}
              ayuda={`${valores.descripcion.trim().length}/${LARGO_DESCRIPCION} caracteres`}
              className="md:col-span-2"
            >
              <textarea
                id="descripcion"
                rows={5}
                value={valores.descripcion}
                onChange={(evento) => cambiar('descripcion', evento.target.value)}
                maxLength={LARGO_DESCRIPCION}
                aria-invalid={errores.descripcion !== undefined}
                aria-describedby="descripcion-ayuda"
                className={`${claseInput} ${errores.descripcion ? 'border-red-500' : 'border-slate-300'}`}
              />
            </Campo>

            <div className="flex flex-col gap-4 sm:flex-row md:col-span-2">
              <Campo
                id="imagenUrl"
                etiqueta="Dirección (URL) de la imagen"
                error={errores.imagenUrl}
                ayuda="Opcional. Por ejemplo: https://sitio.com/portada.jpg"
                className="flex-1"
              >
                <input
                  id="imagenUrl"
                  type="url"
                  inputMode="url"
                  value={valores.imagenUrl}
                  onChange={(evento) => cambiar('imagenUrl', evento.target.value)}
                  maxLength={LARGO_URL}
                  aria-invalid={errores.imagenUrl !== undefined}
                  aria-describedby="imagenUrl-ayuda"
                  className={`${claseInput} ${errores.imagenUrl ? 'border-red-500' : 'border-slate-300'}`}
                />
              </Campo>
              <figure className="flex flex-col items-center gap-1 self-center sm:self-start">
                <ImagenJuego
                  url={urlParaVistaPrevia}
                  titulo={valores.titulo.trim() || 'Juego'}
                  className="h-32 w-24 rounded"
                />
                <figcaption className="text-xs text-slate-500">Vista previa</figcaption>
              </figure>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SelectorMultiple
              leyenda="Plataformas"
              nombre="plataformas"
              opciones={catalogos.plataformas}
              seleccionados={valores.plataformaIds}
              obligatorio
              error={errores.plataformaIds}
              onCambiar={(ids) => cambiar('plataformaIds', ids)}
            />
            <SelectorMultiple
              leyenda="Géneros"
              nombre="generos"
              opciones={catalogos.generos}
              seleccionados={valores.generoIds}
              obligatorio
              error={errores.generoIds}
              onCambiar={(ids) => cambiar('generoIds', ids)}
            />
            <SelectorMultiple
              leyenda="Características"
              nombre="caracteristicas"
              opciones={catalogos.caracteristicas}
              seleccionados={valores.caracteristicaIds}
              onCambiar={(ids) => cambiar('caracteristicaIds', ids)}
            />
          </div>

          <p className="text-sm text-slate-500">
            Los campos con <span className="text-red-700">*</span> son obligatorios.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/juegos')}
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
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear juego'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
