interface CargandoProps {
  texto?: string
}

export function Cargando({ texto = 'Cargando...' }: CargandoProps) {
  return (
    <p role="status" className="flex items-center justify-center gap-3 py-8 text-slate-600">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-700 border-t-transparent"
      />
      {texto}
    </p>
  )
}
