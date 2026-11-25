import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Buscador } from '../../components/Buscador/Buscador.tsx'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { Paginacion } from '../../components/Paginacion/Paginacion.tsx'
import { TarjetaJuego } from '../../components/TarjetaJuego/TarjetaJuego.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { juegoService } from '../../services/juegoService.ts'
import type { Juego } from '../../types/juego.ts'

const JUEGOS_POR_PAGINA = 20

/** Lee ?pagina= de la URL; si no es un entero de 1 en adelante, usa la página 1 */
function leerPagina(valor: string | null): number {
  const numero = Number(valor)
  return Number.isInteger(numero) && numero >= 1 ? numero : 1
}

// Listado público de juegos con filtro por título, de a 20 por página.
// El filtro y la página viven en la URL (?titulo=...&pagina=...) para que se mantengan al volver del detalle.
export function ListadoJuegos() {
  const [parametros, setParametros] = useSearchParams()
  const titulo = parametros.get('titulo') ?? ''
  const pagina = leerPagina(parametros.get('pagina'))

  const [juegos, setJuegos] = useState<Juego[]>([])
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** Se incrementa con "Reintentar" para volver a disparar la carga */
  const [intento, setIntento] = useState(0)
  // setParametros cambia en cada navegación; con la ref, el efecto no se vuelve a disparar por eso
  const setParametrosRef = useRef(setParametros)
  setParametrosRef.current = setParametros

  useEffect(() => {
    // Si llega una respuesta vieja (de una búsqueda anterior), se ignora.
    let vigente = true
    let redirigido = false
    setCargando(true)
    setError(null)
    juegoService
      .listar({ titulo, pagina, limite: JUEGOS_POR_PAGINA })
      .then((respuesta) => {
        if (!vigente) return
        // Página fuera de rango (por ejemplo, una URL vieja): se va a la última que existe
        if (respuesta.datos.length === 0 && respuesta.totalPaginas > 0) {
          redirigido = true
          setParametrosRef.current(
            (actuales) => {
              actuales.set('pagina', String(respuesta.totalPaginas))
              return actuales
            },
            { replace: true },
          )
          return
        }
        setJuegos(respuesta.datos)
        setTotal(respuesta.total)
        setTotalPaginas(respuesta.totalPaginas)
      })
      .catch((errorCarga: unknown) => {
        if (vigente) setError(obtenerMensajeError(errorCarga))
      })
      .finally(() => {
        // Si se redirigió, sigue "cargando" hasta que llegue la página nueva
        if (vigente && !redirigido) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [titulo, pagina, intento])

  // Una búsqueda nueva siempre arranca en la página 1
  const buscar = useCallback(
    (texto: string) => {
      const limpio = texto.trim()
      setParametros(limpio ? { titulo: limpio } : {}, { replace: true })
    },
    [setParametros],
  )

  // Cambiar de página agrega una entrada al historial, así "Atrás" vuelve a la página anterior
  function cambiarPagina(nueva: number) {
    setParametros((actuales) => {
      actuales.set('pagina', String(nueva))
      return actuales
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Juegos</h1>
          <p className="mt-1 text-slate-600">Buscá un juego por su nombre y mirá su detalle.</p>
        </div>
        <div className="max-w-xl">
          <Buscador
            valorInicial={titulo}
            etiqueta="Buscar por título"
            placeholder="Ej.: Zelda, FIFA, Minecraft..."
            onBuscar={buscar}
          />
        </div>
      </header>

      {cargando && <Cargando texto="Buscando juegos..." />}

      {!cargando && error && (
        <MensajeError mensaje={error} onReintentar={() => setIntento((n) => n + 1)} />
      )}

      {!cargando && !error && juegos.length === 0 && (
        <p className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          {titulo
            ? `No encontramos juegos que coincidan con «${titulo}». Probá con otro nombre.`
            : 'Todavía no hay juegos cargados.'}
        </p>
      )}

      {!cargando && !error && juegos.length > 0 && (
        <>
          <p className="text-sm text-slate-500" aria-live="polite">
            {total} {total === 1 ? 'juego encontrado' : 'juegos encontrados'}
            {totalPaginas > 1 && ` · Página ${pagina} de ${totalPaginas}`}
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {juegos.map((juego) => (
              <li key={juego.id}>
                <TarjetaJuego juego={juego} />
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={cambiarPagina} />
        </>
      )}
    </section>
  )
}
