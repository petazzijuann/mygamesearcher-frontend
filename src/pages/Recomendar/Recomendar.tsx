import axios from 'axios'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BotonesBiblioteca } from '../../components/BotonesBiblioteca/BotonesBiblioteca.tsx'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { SelectorMultiple } from '../../components/SelectorMultiple/SelectorMultiple.tsx'
import { TarjetaJuego } from '../../components/TarjetaJuego/TarjetaJuego.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { bibliotecaService } from '../../services/bibliotecaService.ts'
import { caracteristicaService } from '../../services/caracteristicaService.ts'
import { generoService } from '../../services/generoService.ts'
import { plataformaService } from '../../services/plataformaService.ts'
import { recomendacionService } from '../../services/recomendacionService.ts'
import type { Busqueda } from '../../types/busqueda.ts'
import type { Caracteristica } from '../../types/caracteristica.ts'
import type { Genero } from '../../types/genero.ts'
import type { EstadoJuego } from '../../types/juegoGuardado.ts'
import type { Plataforma } from '../../types/plataforma.ts'

interface Opciones {
  plataformas: Plataforma[]
  generos: Genero[]
  caracteristicas: Caracteristica[]
}

interface Criterios {
  plataformaIds: number[]
  generoIds: number[]
  caracteristicaIds: number[]
}

interface ErroresCriterios {
  plataformaIds?: string
  generoIds?: string
}

function validar(criterios: Criterios): ErroresCriterios {
  const errores: ErroresCriterios = {}
  if (criterios.plataformaIds.length === 0) errores.plataformaIds = 'Elegí al menos una plataforma.'
  if (criterios.generoIds.length === 0) errores.generoIds = 'Elegí al menos un género.'
  return errores
}

// CUU Generar recomendación: el usuario elige criterios y la API devuelve de 1 a 3 juegos.
export function Recomendar() {
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [cargandoOpciones, setCargandoOpciones] = useState(true)
  const [errorOpciones, setErrorOpciones] = useState<string | null>(null)
  /** Se incrementa con "Reintentar" para volver a disparar la carga */
  const [intento, setIntento] = useState(0)

  const [criterios, setCriterios] = useState<Criterios>({
    plataformaIds: [],
    generoIds: [],
    caracteristicaIds: [],
  })
  const [errores, setErrores] = useState<ErroresCriterios>({})
  const [generando, setGenerando] = useState(false)
  const [errorGenerar, setErrorGenerar] = useState<string | null>(null)
  const [sinResultados, setSinResultados] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState<Busqueda | null>(null)
  /** Estado de cada juego recomendado en la biblioteca del usuario (juegoId -> estado) */
  const [estados, setEstados] = useState<Record<number, EstadoJuego>>({})
  const tituloResultadosRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let vigente = true
    setCargandoOpciones(true)
    setErrorOpciones(null)
    Promise.all([plataformaService.listar(), generoService.listar(), caracteristicaService.listar()])
      .then(([plataformas, generos, caracteristicas]) => {
        if (vigente) setOpciones({ plataformas, generos, caracteristicas })
      })
      .catch((error: unknown) => {
        if (vigente) setErrorOpciones(obtenerMensajeError(error))
      })
      .finally(() => {
        if (vigente) setCargandoOpciones(false)
      })
    return () => {
      vigente = false
    }
  }, [intento])

  // Al mostrar los resultados, se lleva la vista y el foco al título (lo anuncia el lector de pantalla).
  useEffect(() => {
    if (busqueda && tituloResultadosRef.current) {
      tituloResultadosRef.current.focus()
      tituloResultadosRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [busqueda])

  function cambiar(campo: keyof Criterios, ids: number[]) {
    const nuevos = { ...criterios, [campo]: ids }
    setCriterios(nuevos)
    if (campo !== 'caracteristicaIds' && errores[campo]) setErrores(validar(nuevos))
  }

  async function generar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const erroresValidacion = validar(criterios)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setGenerando(true)
    setErrorGenerar(null)
    setSinResultados(null)
    try {
      const resultado = await recomendacionService.generar({
        plataformaIds: criterios.plataformaIds,
        generoIds: criterios.generoIds,
        caracteristicaIds: criterios.caracteristicaIds.length > 0 ? criterios.caracteristicaIds : null,
      })
      // Para marcar bien los botones "Me interesa" de cada juego. Si falla, arrancan sin marcar.
      const guardados = await bibliotecaService.listar().catch(() => [])
      setEstados(Object.fromEntries(guardados.map((item) => [item.juegoId, item.estado])))
      setBusqueda(resultado)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setSinResultados(obtenerMensajeError(error))
      } else {
        setErrorGenerar(obtenerMensajeError(error))
      }
    } finally {
      setGenerando(false)
    }
  }

  function cambiarEstado(juegoId: number, estado: EstadoJuego | null) {
    setEstados((actuales) => {
      const copia = { ...actuales }
      if (estado === null) delete copia[juegoId]
      else copia[juegoId] = estado
      return copia
    })
  }

  const recomendaciones = busqueda
    ? [...busqueda.recomendaciones].sort((a, b) => a.orden - b.orden)
    : []

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Recomendame</h1>
        <p className="mt-1 text-slate-600">
          Elegí tus plataformas y los géneros que te gustan, y te recomendamos hasta 3 juegos.
          No incluimos los que marcaste como "Ya jugado".
        </p>
      </header>

      {cargandoOpciones && <Cargando texto="Cargando opciones..." />}

      {!cargandoOpciones && errorOpciones && (
        <MensajeError mensaje={errorOpciones} onReintentar={() => setIntento((n) => n + 1)} />
      )}

      {opciones && !busqueda && (
        <form
          onSubmit={(evento) => void generar(evento)}
          noValidate
          className="flex flex-col gap-5 rounded-lg bg-white p-4 shadow sm:p-6"
        >
          {errorGenerar && <MensajeError mensaje={errorGenerar} />}
          {sinResultados && (
            <div role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <p className="font-medium">{sinResultados}</p>
              <p className="mt-1 text-sm">
                Probá con más géneros o plataformas, o con menos características.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SelectorMultiple
              leyenda="¿En qué plataformas jugás?"
              nombre="plataformas"
              opciones={opciones.plataformas}
              seleccionados={criterios.plataformaIds}
              obligatorio
              error={errores.plataformaIds}
              onCambiar={(ids) => cambiar('plataformaIds', ids)}
            />
            <SelectorMultiple
              leyenda="¿Qué géneros te gustan?"
              nombre="generos"
              opciones={opciones.generos}
              seleccionados={criterios.generoIds}
              obligatorio
              error={errores.generoIds}
              onCambiar={(ids) => cambiar('generoIds', ids)}
            />
            <SelectorMultiple
              leyenda="Características (opcional)"
              nombre="caracteristicas"
              opciones={opciones.caracteristicas}
              seleccionados={criterios.caracteristicaIds}
              onCambiar={(ids) => cambiar('caracteristicaIds', ids)}
            />
          </div>

          <button
            type="submit"
            disabled={generando}
            className="rounded-md bg-indigo-700 px-6 py-3 text-lg font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 sm:self-end"
          >
            {generando ? 'Buscando juegos para vos...' : 'Recomendame juegos'}
          </button>
        </form>
      )}

      {busqueda && (
        <section aria-labelledby="titulo-resultados" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="titulo-resultados"
                ref={tituloResultadosRef}
                tabIndex={-1}
                className="text-xl font-bold text-slate-900 focus:outline-none md:text-2xl"
              >
                {recomendaciones.length === 1
                  ? 'Te recomendamos este juego'
                  : `Te recomendamos estos ${recomendaciones.length} juegos`}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Para {busqueda.plataformas.map((p) => p.nombre).join(', ')} ·{' '}
                {busqueda.generos.map((g) => g.nombre).join(', ')}
                {busqueda.caracteristicas.length > 0 &&
                  ` · ${busqueda.caracteristicas.map((c) => c.nombre).join(', ')}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBusqueda(null)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Cambiar criterios
            </button>
          </div>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recomendaciones.map((recomendacion) => (
              <li key={recomendacion.id}>
                <TarjetaJuego
                  juego={recomendacion.juego}
                  pie={
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-indigo-700">
                        Recomendación #{recomendacion.orden}
                      </p>
                      <BotonesBiblioteca
                        juegoId={recomendacion.juego.id}
                        tituloJuego={recomendacion.juego.titulo}
                        estado={estados[recomendacion.juego.id] ?? null}
                        onCambio={(estado) => cambiarEstado(recomendacion.juego.id, estado)}
                      />
                    </div>
                  }
                />
              </li>
            ))}
          </ol>

          <p className="text-sm text-slate-500">
            Esta búsqueda quedó guardada en tu historial.{' '}
            <Link
              to={`/recomendaciones/${busqueda.id}`}
              className="font-medium text-indigo-700 hover:underline"
            >
              Ver en mi historial
            </Link>{' '}
            (ahí podés calificar cada juego).
          </p>
        </section>
      )}
    </section>
  )
}
