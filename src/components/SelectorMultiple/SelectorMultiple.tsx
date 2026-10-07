export interface OpcionSelector {
  id: number
  nombre: string
}

interface SelectorMultipleProps {
  /** Título del grupo, por ejemplo "Plataformas" */
  leyenda: string
  /** Prefijo para los id de los checkboxes (tiene que ser único en la página) */
  nombre: string
  opciones: OpcionSelector[]
  seleccionados: number[]
  obligatorio?: boolean
  error?: string
  /** Devuelve la nueva lista de ids elegidos */
  onCambiar: (ids: number[]) => void
}

// Grupo de checkboxes para elegir varias opciones (plataformas, géneros, características...).
export function SelectorMultiple({
  leyenda,
  nombre,
  opciones,
  seleccionados,
  obligatorio = false,
  error,
  onCambiar,
}: SelectorMultipleProps) {
  function alternar(id: number) {
    onCambiar(
      seleccionados.includes(id)
        ? seleccionados.filter((elegido) => elegido !== id)
        : [...seleccionados, id],
    )
  }

  const idError = `${nombre}-error`

  return (
    <fieldset
      aria-describedby={error ? idError : undefined}
      className={`rounded-md border p-3 ${error ? 'border-red-500' : 'border-slate-300'}`}
    >
      <legend className="px-1 font-medium text-slate-800">
        {leyenda}
        {obligatorio && <span className="text-red-700"> *</span>}
        {opciones.length > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({seleccionados.length} de {opciones.length})
          </span>
        )}
      </legend>

      {opciones.length === 0 ? (
        <p className="text-sm text-slate-500">No hay opciones cargadas.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {opciones.map((opcion) => {
            const idCheckbox = `${nombre}-${opcion.id}`
            const elegido = seleccionados.includes(opcion.id)
            return (
              <li key={opcion.id}>
                <input
                  id={idCheckbox}
                  type="checkbox"
                  checked={elegido}
                  onChange={() => alternar(opcion.id)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={idCheckbox}
                  className="inline-block cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 select-none peer-checked:border-indigo-700 peer-checked:bg-indigo-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 hover:border-indigo-500"
                >
                  {elegido && <span aria-hidden="true">✓ </span>}
                  {opcion.nombre}
                </label>
              </li>
            )
          })}
        </ul>
      )}

      {error && (
        <p id={idError} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  )
}
