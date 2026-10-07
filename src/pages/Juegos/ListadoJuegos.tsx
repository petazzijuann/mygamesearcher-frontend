import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Buscador } from '../../components/Buscador/Buscador.tsx'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { TarjetaJuego } from '../../components/TarjetaJuego/TarjetaJuego.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { juegoService } from '../../services/juegoService.ts'
import type { Juego } from '../../types/juego.ts'

// Listado público de juegos con filtro por título.
// El filtro vive en la URL (?titulo=...) para que se mantenga al volver del detalle.
export function ListadoJuegos() {
  const [parametros, setParametros] = useSearchParams()
  const titulo = parametros.get('titulo') ?? ''

  const [juegos, setJuegos] = useState<Juego[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** Se incrementa con "Reintentar" para volver a disparar la carga */
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    // Si llega una respuesta vieja (de una búsqueda anterior), se ignora.
    let vigente = true
    setCargando(true)
    setError(null)
    juegoService
      .listar(titulo)
      .then((datos) => {
        if (vigente) setJuegos(datos)
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
  }, [titulo, intento])

  const buscar = useCallback(
    (texto: string) => {
      const limpio = texto.trim()
      setParametros(limpio ? { titulo: limpio } : {}, { replace: true })
    },
    [setParametros],
  )

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
            {juegos.length} {juegos.length === 1 ? 'juego encontrado' : 'juegos encontrados'}
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {juegos.map((juego) => (
              <li key={juego.id}>
                <TarjetaJuego juego={juego} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
