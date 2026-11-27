import { calcularPaginas, SALTO } from '../../utils/paginas.ts'
import { Boton } from '../Boton/Boton.tsx'

interface PaginacionProps {
  /** Página actual, empieza en 1 */
  pagina: number
  totalPaginas: number
  /** Se llama con la página elegida (prop de salida) */
  onCambiarPagina: (pagina: number) => void
  /** Texto para lectores de pantalla, por si hay más de un paginador en la página */
  etiqueta?: string
}

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
      <Boton
        variante="secundario"
        tamanio="chico"
        onClick={() => onCambiarPagina(pagina - 1)}
        disabled={pagina <= 1}
      >
        <span aria-hidden="true">←</span> Anterior
      </Boton>

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
              <Boton
                variante={item === pagina ? 'primario' : 'secundario'}
                tamanio="chico"
                onClick={() => onCambiarPagina(item)}
                aria-label={`Página ${item}`}
                aria-current={item === pagina ? 'page' : undefined}
                className="min-w-10"
              >
                {item}
              </Boton>
            </li>
          ),
        )}
      </ul>

      <Boton
        variante="secundario"
        tamanio="chico"
        onClick={() => onCambiarPagina(pagina + 1)}
        disabled={pagina >= totalPaginas}
      >
        Siguiente <span aria-hidden="true">→</span>
      </Boton>
    </nav>
  )
}
