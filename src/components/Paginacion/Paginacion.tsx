import { calcularPaginas, SALTO } from '../../utils/paginas.ts'

interface PaginacionProps {
  /** Página actual, empieza en 1 */
  pagina: number
  totalPaginas: number
  /** Se llama con la página elegida (prop de salida) */
  onCambiarPagina: (pagina: number) => void
  /** Texto para lectores de pantalla, por si hay más de un paginador en la página */
  etiqueta?: string
}

const claseBoton =
  'min-w-10 rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40'

// Paginador numerado: Anterior, números de página y Siguiente.
// En celular solo muestra "Página X de Y" entre los botones para no desbordar.
export function Paginacion({
  pagina,
  totalPaginas,
  onCambiarPagina,
  etiqueta = 'Paginación',
}: PaginacionProps) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label={etiqueta} className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onCambiarPagina(pagina - 1)}
        disabled={pagina <= 1}
        className={`${claseBoton} border-slate-300 bg-white text-slate-700 hover:bg-slate-100`}
      >
        <span aria-hidden="true">←</span> Anterior
      </button>

      <p className="px-2 text-sm text-slate-600 sm:hidden">
        Página {pagina} de {totalPaginas}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {calcularPaginas(pagina, totalPaginas).map((item, indice) =>
          item === SALTO ? (
            <li key={`salto-${indice}`} aria-hidden="true" className="px-1 text-slate-500">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onCambiarPagina(item)}
                aria-label={`Página ${item}`}
                aria-current={item === pagina ? 'page' : undefined}
                className={`${claseBoton} ${
                  item === pagina
                    ? 'border-indigo-700 bg-indigo-700 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onCambiarPagina(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className={`${claseBoton} border-slate-300 bg-white text-slate-700 hover:bg-slate-100`}
      >
        Siguiente <span aria-hidden="true">→</span>
      </button>
    </nav>
  )
}
