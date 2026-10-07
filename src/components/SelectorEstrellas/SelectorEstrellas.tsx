const VALORES = [1, 2, 3, 4, 5]

interface SelectorEstrellasProps {
  /** Prefijo para los id de los radio buttons (tiene que ser único en la página) */
  nombre: string
  leyenda?: string
  valor: number | null
  deshabilitado?: boolean
  error?: string
  /** Devuelve la cantidad de estrellas elegida (prop de salida) */
  onCambiar: (valor: number) => void
}

// Calificación de 1 a 5 estrellas. Por dentro son radio buttons, así que se maneja
// con el teclado (flechas) y el lector de pantalla lee "3 de 5 estrellas".
export function SelectorEstrellas({
  nombre,
  leyenda = 'Calificación',
  valor,
  deshabilitado = false,
  error,
  onCambiar,
}: SelectorEstrellasProps) {
  const idError = `${nombre}-error`

  return (
    <fieldset disabled={deshabilitado} aria-describedby={error ? idError : undefined}>
      <legend className="mb-1 text-sm font-medium text-slate-800">{leyenda}</legend>
      <div className="flex gap-1">
        {VALORES.map((estrellas) => {
          const id = `${nombre}-${estrellas}`
          const encendida = valor !== null && estrellas <= valor
          return (
            <div key={estrellas}>
              <input
                id={id}
                type="radio"
                name={nombre}
                value={estrellas}
                checked={valor === estrellas}
                onChange={() => onCambiar(estrellas)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`block cursor-pointer rounded px-0.5 text-3xl leading-none transition select-none peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 hover:scale-110 ${
                  encendida ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                <span aria-hidden="true">★</span>
                <span className="sr-only">{estrellas} de 5 estrellas</span>
              </label>
            </div>
          )
        })}
      </div>
      {error && (
        <p id={idError} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  )
}
