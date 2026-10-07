import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Juego } from '../../types/juego.ts'
import { ImagenJuego } from '../ImagenJuego/ImagenJuego.tsx'
import { ListaEtiquetas } from '../ListaEtiquetas/ListaEtiquetas.tsx'

interface TarjetaJuegoProps {
  juego: Juego
  /** Contenido extra al pie de la tarjeta (por ejemplo, datos de una recomendación) */
  pie?: ReactNode
}

// Tarjeta resumida de un juego; el título lleva al detalle.
export function TarjetaJuego({ juego, pie }: TarjetaJuegoProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500">
      <ImagenJuego url={juego.imagenUrl} titulo={juego.titulo} className="aspect-[3/4] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-semibold text-slate-900 group-hover:text-indigo-700">
          {/* El "after" estira el link a toda la tarjeta, así se puede tocar en cualquier parte */}
          <Link
            to={`/juegos/${juego.id}`}
            className="after:absolute after:inset-0 focus:outline-none"
          >
            {juego.titulo}
          </Link>
        </h2>
        <p className="text-sm text-slate-500">
          {juego.anioLanzamiento} · {juego.clasificacionEdad.nombre}
        </p>
        <ListaEtiquetas items={juego.generos} chica />
        {pie && <div className="relative mt-auto pt-2">{pie}</div>}
      </div>
    </article>
  )
}
