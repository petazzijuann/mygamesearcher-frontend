import { Boton } from '../Boton/Boton.tsx'

interface MensajeExitoProps {
  mensaje: string
  onCerrar: () => void
}

export function MensajeExito({ mensaje, onCerrar }: MensajeExitoProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-green-800"
    >
      <p>{mensaje}</p>
      <Boton
        variante="fantasma"
        tamanio="icono"
        onClick={onCerrar}
        aria-label="Cerrar mensaje"
        className="hover:bg-green-100"
      >
        <span aria-hidden="true">✕</span>
      </Boton>
    </div>
  )
}
