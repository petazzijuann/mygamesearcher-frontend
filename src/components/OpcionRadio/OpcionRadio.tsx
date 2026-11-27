import type { InputHTMLAttributes, ReactNode } from 'react'

interface OpcionRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Texto de la opción; toda la tarjeta es clickeable porque el input va dentro del label */
  etiqueta: ReactNode
}

// Opción de un grupo de radio con forma de tarjeta: se resalta cuando está elegida.
// Acepta las props de un <input> (name, value, checked, onChange, ...).
export function OpcionRadio({ etiqueta, className = '', ...resto }: OpcionRadioProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-4 py-3 has-checked:border-indigo-600 has-checked:bg-indigo-50 has-focus-visible:ring-2 has-focus-visible:ring-indigo-500 has-disabled:cursor-not-allowed has-disabled:opacity-60 ${className}`}
    >
      <input type="radio" className="accent-indigo-700" {...resto} />
      {etiqueta}
    </label>
  )
}
