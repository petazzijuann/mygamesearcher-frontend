import { useEffect, useRef } from 'react'
import { Boton } from '../Boton/Boton.tsx'

interface DialogoConfirmacionProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  procesando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function DialogoConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  procesando = false,
  onConfirmar,
  onCancelar,
}: DialogoConfirmacionProps) {
  const dialogoRef = useRef<HTMLDialogElement>(null)

  // Abre o cierra el <dialog> nativo cuando cambia la prop "abierto".
  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={dialogoRef}
      onCancel={(evento) => {
        // Tecla Escape: se cierra a través del padre para mantener el estado sincronizado.
        evento.preventDefault()
        if (!procesando) onCancelar()
      }}
      aria-labelledby="dialogo-titulo"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg p-6 shadow-xl backdrop:bg-black/50"
    >
      <h2 id="dialogo-titulo" className="text-lg font-semibold text-slate-900">
        {titulo}
      </h2>
      <p className="mt-2 text-slate-600">{mensaje}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Boton variante="secundario" onClick={onCancelar} disabled={procesando}>
          Cancelar
        </Boton>
        <Boton
          variante="peligroSolido"
          onClick={onConfirmar}
          cargando={procesando}
          textoCargando="Procesando..."
        >
          {textoConfirmar}
        </Boton>
      </div>
    </dialog>
  )
}
