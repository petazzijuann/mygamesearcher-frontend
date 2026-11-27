import { Boton } from '../Boton/Boton.tsx'

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
        <Boton
          variante="peligro"
          tamanio="chico"
          onClick={onReintentar}
          className="self-start sm:self-auto"
        >
          Reintentar
        </Boton>
      )}
    </div>
  )
}
