import { useState } from 'react'

interface ImagenJuegoProps {
  url: string | null
  titulo: string
  className?: string
}

// Muestra la portada del juego. Si no tiene imagen o no carga, muestra un recuadro neutro.
export function ImagenJuego({ url, titulo, className = '' }: ImagenJuegoProps) {
  const [urlConError, setUrlConError] = useState<string | null>(null)

  if (!url || urlConError === url) {
    return (
      <div
        role="img"
        aria-label={`${titulo} (sin imagen)`}
        className={`flex items-center justify-center bg-slate-200 text-xs text-slate-500 ${className}`}
      >
        Sin imagen
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`Portada de ${titulo}`}
      loading="lazy"
      onError={() => setUrlConError(url)}
      className={`object-cover ${className}`}
    />
  )
}
