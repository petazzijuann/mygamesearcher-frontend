import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AvisoIniciarSesion } from '../../components/AvisoIniciarSesion/AvisoIniciarSesion.tsx'
import { BotonesBiblioteca } from '../../components/BotonesBiblioteca/BotonesBiblioteca.tsx'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { ImagenJuego } from '../../components/ImagenJuego/ImagenJuego.tsx'
import { ListaEtiquetas } from '../../components/ListaEtiquetas/ListaEtiquetas.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { useSesion } from '../../context/sesion.ts'
import { obtenerMensajeError } from '../../services/api.ts'
import { bibliotecaService } from '../../services/bibliotecaService.ts'
import { juegoService } from '../../services/juegoService.ts'
import type { Juego } from '../../types/juego.ts'
import type { EstadoJuego } from '../../types/juegoGuardado.ts'

// Muestra si el juego está en la biblioteca del usuario y permite cambiarlo.
// La API no tiene un endpoint para un solo juego: se trae la biblioteca y se busca ahí.
function SeccionBiblioteca({ juego }: { juego: Juego }) {
  const sesion = useSesion().usuario !== null
  const [estado, setEstado] = useState<EstadoJuego | null>(null)
  const [cargando, setCargando] = useState(sesion)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sesion) return
    let vigente = true
    bibliotecaService
      .listar()
      .then((guardados) => {
        const guardado = guardados.find((item) => item.juegoId === juego.id)
        if (vigente) setEstado(guardado ? guardado.estado : null)
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
  }, [sesion, juego.id])

  if (!sesion) {
    return <AvisoIniciarSesion para="guardar este juego en tu biblioteca" compacto />
  }
  if (cargando) return <p className="text-sm text-slate-500">Consultando tu biblioteca...</p>
  if (error) return <p className="text-sm text-red-700">{error}</p>

  return (
    <div className="flex flex-col gap-2 sm:max-w-sm">
      <p className="text-sm font-medium text-slate-700">En tu biblioteca:</p>
      <BotonesBiblioteca
        juegoId={juego.id}
        tituloJuego={juego.titulo}
        estado={estado}
        onCambio={setEstado}
      />
    </div>
  )
}

// Detalle público de un juego (/juegos/:id).
export function DetalleJuego() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const idNumero = Number(id)
  const idValido = Number.isInteger(idNumero) && idNumero > 0

  const [juego, setJuego] = useState<Juego | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarJuego = useCallback(async () => {
    if (!idValido) {
      setError('El juego que buscás no existe.')
      setCargando(false)
      return
    }
    setCargando(true)
    setError(null)
    try {
      setJuego(await juegoService.obtenerPorId(idNumero))
    } catch (errorCarga) {
      setError(obtenerMensajeError(errorCarga))
    } finally {
      setCargando(false)
    }
  }, [idValido, idNumero])

  useEffect(() => {
    void cargarJuego()
  }, [cargarJuego])

  // Si se llegó desde el listado, "Volver" respeta la búsqueda que había.
  // Si se entró directo por la URL, va al listado completo.
  function volver() {
    if (location.key !== 'default') navigate(-1)
    else navigate('/juegos')
  }

  return (
    <section className="flex flex-col gap-6">
      <button
        type="button"
        onClick={volver}
        className="self-start text-sm font-medium text-indigo-700 hover:underline"
      >
        ← Volver
      </button>

      {cargando && <Cargando texto="Cargando juego..." />}

      {!cargando && error && (
        <div className="flex flex-col gap-4">
          <MensajeError
            mensaje={error}
            onReintentar={idValido ? () => void cargarJuego() : undefined}
          />
          <Link to="/juegos" className="self-start font-medium text-indigo-700 hover:underline">
            Ver todos los juegos
          </Link>
        </div>
      )}

      {!cargando && !error && juego && (
        <article className="grid gap-6 rounded-lg bg-white p-4 shadow sm:p-6 md:grid-cols-[minmax(0,1fr)_2fr] lg:gap-10">
          <ImagenJuego
            url={juego.imagenUrl}
            titulo={juego.titulo}
            className="aspect-[3/4] w-full max-w-xs justify-self-center rounded-lg md:max-w-none"
          />

          <div className="flex flex-col gap-5">
            <header>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl lg:text-4xl">
                {juego.titulo}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-slate-600">
                <span>{juego.anioLanzamiento}</span>
                <span aria-hidden="true">·</span>
                <span className="rounded border border-slate-300 px-2 py-0.5 text-sm font-semibold">
                  {juego.clasificacionEdad.nombre}
                </span>
              </p>
            </header>

            <SeccionBiblioteca juego={juego} />

            <p className="whitespace-pre-line text-slate-700">{juego.descripcion}</p>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <dt className="font-semibold text-slate-900">Plataformas</dt>
                <dd>
                  <ListaEtiquetas items={juego.plataformas} />
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="font-semibold text-slate-900">Géneros</dt>
                <dd>
                  <ListaEtiquetas items={juego.generos} textoVacio="Ninguno" />
                </dd>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <dt className="font-semibold text-slate-900">Características</dt>
                <dd>
                  <ListaEtiquetas items={juego.caracteristicas} />
                </dd>
              </div>
            </dl>
          </div>
        </article>
      )}
    </section>
  )
}
