interface Etiqueta {
  id: number
  nombre: string
}

interface ListaEtiquetasProps {
  items: Etiqueta[]
  /** Texto a mostrar si la lista está vacía */
  textoVacio?: string
  /** Tamaño chico para tarjetas, normal para el detalle */
  chica?: boolean
}

// Muestra nombres (géneros, plataformas, características...) como etiquetas.
export function ListaEtiquetas({ items, textoVacio = 'Ninguna', chica = false }: ListaEtiquetasProps) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{textoVacio}</p>
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item.id}
          className={`rounded-full bg-indigo-50 font-medium text-indigo-800 ${chica ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
        >
          {item.nombre}
        </li>
      ))}
    </ul>
  )
}
