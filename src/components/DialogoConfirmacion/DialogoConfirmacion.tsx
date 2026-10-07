import { useEffect, useRef } from 'react'

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
        <button
          type="button"
          onClick={onCancelar}
          disabled={procesando}
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={procesando}
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          {procesando ? 'Procesando...' : textoConfirmar}
        </button>
      </div>
    </dialog>
  )
}
