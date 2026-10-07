interface MensajeErrorProps {
  mensaje: string
  /** Si se pasa, se muestra un botón para volver a intentar */
  onReintentar?: () => void
}

export function MensajeError({ mensaje, onReintentar }: MensajeErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="self-start rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-red-100 sm:self-auto"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
