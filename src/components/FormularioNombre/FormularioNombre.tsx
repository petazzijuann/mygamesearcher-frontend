import { useState, type FormEvent } from 'react'
import { Boton } from '../Boton/Boton.tsx'

const LARGO_MAXIMO = 50

interface FormularioNombreProps {
  /** Valor con el que arranca el campo (al editar) */
  valorInicial?: string
  textoBoton: string
  guardando: boolean
  onGuardar: (nombre: string) => void
  onCancelar: () => void
}

// Formulario con un único campo "nombre". Sirve para Género, Plataforma,
// Característica y Clasificación de Edad, que tienen la misma forma.
export function FormularioNombre({
  valorInicial = '',
  textoBoton,
  guardando,
  onGuardar,
  onCancelar,
}: FormularioNombreProps) {
  const [nombre, setNombre] = useState(valorInicial)
  const [error, setError] = useState<string | null>(null)

  function validar(valor: string): string | null {
    if (valor.trim() === '') return 'El nombre es obligatorio.'
    if (valor.trim().length > LARGO_MAXIMO) {
      return `El nombre no puede tener más de ${LARGO_MAXIMO} caracteres.`
    }
    return null
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const errorValidacion = validar(nombre)
    setError(errorValidacion)
    if (!errorValidacion) onGuardar(nombre.trim())
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="font-medium text-slate-800">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(evento) => {
            setNombre(evento.target.value)
            if (error) setError(validar(evento.target.value))
          }}
          maxLength={LARGO_MAXIMO}
          autoFocus
          aria-invalid={error !== null}
          aria-describedby="nombre-ayuda"
          className={`rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${error ? 'border-red-500' : 'border-slate-300'}`}
        />
        <p id="nombre-ayuda" className={`text-sm ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {error ?? `${nombre.trim().length}/${LARGO_MAXIMO} caracteres`}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Boton variante="secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando} textoCargando="Guardando...">
          {textoBoton}
        </Boton>
      </div>
    </form>
  )
}
