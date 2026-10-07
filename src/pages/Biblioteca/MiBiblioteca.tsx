import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BotonesBiblioteca } from '../../components/BotonesBiblioteca/BotonesBiblioteca.tsx'
import { Cargando } from '../../components/Cargando/Cargando.tsx'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { TarjetaJuego } from '../../components/TarjetaJuego/TarjetaJuego.tsx'
import { obtenerMensajeError } from '../../services/api.ts'
import { bibliotecaService } from '../../services/bibliotecaService.ts'
import type { EstadoJuego, JuegoGuardado } from '../../types/juegoGuardado.ts'
import { esEstadoJuego, estadosJuego, textoEstado } from '../../utils/estadoJuego.ts'
import { formatearFecha } from '../../utils/fechas.ts'

// Biblioteca personal: juegos marcados como "Me interesa" o "Ya jugado".
// La pestaña elegida vive en la URL (?estado=...) y el filtro lo aplica la API.
export function MiBiblioteca() {
  const [parametros, setParametros] = useSearchParams()
  const valorEstado = parametros.get('estado')
  const filtro: EstadoJuego | null = esEstadoJuego(valorEstado) ? valorEstado : null

  const [guardados, setGuardados] = useState<JuegoGuardado[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** Se incrementa con "Reintentar" para volver a disparar la carga */
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError(null)
    bibliotecaService
      .listar(filtro ?? undefined)
      .then((datos) => {
        if (vigente) setGuardados(datos)
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
  }, [filtro, intento])

  function elegirPestania(estado: EstadoJuego | null) {
    setParametros(estado ? { estado } : {})
  }

  // Actualiza la lista sin volver a pedirla: si el juego ya no corresponde
  // a la pestaña actual (o se quitó), desaparece.
  function manejarCambio(juegoId: number, nuevoEstado: EstadoJuego | null) {
    setGuardados((actuales) =>
      nuevoEstado === null || (filtro !== null && nuevoEstado !== filtro)
        ? actuales.filter((item) => item.juegoId !== juegoId)
        : actuales.map((item) =>
            item.juegoId === juegoId ? { ...item, estado: nuevoEstado } : item,
          ),
    )
  }

  const pestanias: { estado: EstadoJuego | null; texto: string }[] = [
    { estado: null, texto: 'Todos' },
    ...estadosJuego.map((estado) => ({ estado, texto: textoEstado[estado] })),
  ]

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Mi biblioteca</h1>
        <p className="mt-1 text-slate-600">Los juegos que te interesan y los que ya jugaste.</p>
      </header>

      <nav aria-label="Filtrar biblioteca">
        <ul className="flex gap-1 overflow-x-auto rounded-lg bg-slate-200 p-1 sm:inline-flex">
          {pestanias.map((pestania) => {
            const activa = pestania.estado === filtro
            return (
              <li key={pestania.texto} className="flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => elegirPestania(pestania.estado)}
                  aria-pressed={activa}
                  className={`w-full rounded-md px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                    activa ? 'bg-white text-indigo-700 shadow' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pestania.texto}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {cargando && <Cargando texto="Cargando tu biblioteca..." />}

      {!cargando && error && (
        <MensajeError mensaje={error} onReintentar={() => setIntento((n) => n + 1)} />
      )}

      {!cargando && !error && guardados.length === 0 && (
        <div className="rounded-md bg-white p-6 text-center text-slate-600 shadow">
          <p>
            {filtro
              ? `No tenés juegos marcados como "${textoEstado[filtro]}".`
              : 'Todavía no guardaste juegos en tu biblioteca.'}
          </p>
          <Link
            to="/juegos"
            className="mt-3 inline-block font-medium text-indigo-700 hover:underline"
          >
            Buscar juegos
          </Link>
        </div>
      )}

      {!cargando && !error && guardados.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {guardados.map((guardado) => (
            <li key={guardado.juegoId}>
              <TarjetaJuego
                juego={guardado.juego}
                pie={
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-slate-500">
                      Guardado el{' '}
                      <time dateTime={guardado.fecha}>{formatearFecha(guardado.fecha)}</time>
                    </p>
                    <BotonesBiblioteca
                      juegoId={guardado.juegoId}
                      tituloJuego={guardado.juego.titulo}
                      estado={guardado.estado}
                      onCambio={(estado) => manejarCambio(guardado.juegoId, estado)}
                    />
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
