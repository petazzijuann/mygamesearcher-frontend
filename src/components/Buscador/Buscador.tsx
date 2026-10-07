import { useEffect, useRef, useState, type FormEvent } from 'react'

interface BuscadorProps {
  /** Texto con el que arranca el campo (por ejemplo, el que viene en la URL) */
  valorInicial?: string
  etiqueta: string
  placeholder?: string
  maxLength?: number
  /** Milisegundos que espera después de la última tecla antes de buscar */
  demoraMs?: number
  /** Se llama con el texto a buscar (prop de salida) */
  onBuscar: (texto: string) => void
}

// Campo de búsqueda "en vivo": avisa al padre cuando el usuario deja de escribir.
export function Buscador({
  valorInicial = '',
  etiqueta,
  placeholder,
  maxLength = 100,
  demoraMs = 400,
  onBuscar,
}: BuscadorProps) {
  const [texto, setTexto] = useState(valorInicial)
  // Último texto avisado al padre, para no repetir la misma búsqueda.
  const ultimoAvisado = useRef(valorInicial)

  useEffect(() => {
    if (texto === ultimoAvisado.current) return
    const temporizador = setTimeout(() => {
      ultimoAvisado.current = texto
      onBuscar(texto)
    }, demoraMs)
    // Si el usuario sigue escribiendo, se cancela la búsqueda anterior.
    return () => clearTimeout(temporizador)
  }, [texto, demoraMs, onBuscar])

  // Con Enter se busca en el momento, sin esperar.
  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    ultimoAvisado.current = texto
    onBuscar(texto)
  }

  return (
    <form role="search" onSubmit={manejarEnvio} className="relative">
      <label htmlFor="buscador" className="mb-1 block font-medium text-slate-800">
        {etiqueta}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
        >
          🔍
        </span>
        <input
          id="buscador"
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          className="w-full rounded-md border border-slate-300 bg-white py-2 pr-10 pl-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {texto !== '' && (
          <button
            type="button"
            onClick={() => setTexto('')}
            aria-label="Limpiar búsqueda"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>
    </form>
  )
}
