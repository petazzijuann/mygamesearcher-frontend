import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export interface ItemMenu {
  ruta: string
  texto: string
}

interface MenuNavegacionProps {
  /** Links a mostrar en el menú (prop de entrada) */
  items: ItemMenu[]
  /** Se llama cuando el usuario elige una opción (prop de salida) */
  onNavegar?: (item: ItemMenu) => void
  /** Clases extra para ubicar el menú dentro del encabezado */
  className?: string
}

export function MenuNavegacion({ items, onNavegar, className = '' }: MenuNavegacionProps) {
  const [abierto, setAbierto] = useState(false)

  function manejarClick(item: ItemMenu) {
    setAbierto(false)
    onNavegar?.(item)
  }

  return (
    <nav aria-label="Navegación principal" className={`relative ${className}`}>
      {/* Botón hamburguesa: en celulares y tablets (los links no entran en una fila hasta LG) */}
      <button
        type="button"
        className="rounded-md p-2 text-white hover:bg-indigo-600 focus:ring-2 focus:ring-white focus:outline-none lg:hidden"
        aria-expanded={abierto}
        aria-controls="menu-principal"
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span aria-hidden="true" className="text-2xl leading-none">
          {abierto ? '✕' : '☰'}
        </span>
      </button>

      <ul
        id="menu-principal"
        className={`${abierto ? 'flex' : 'hidden'} absolute right-0 z-20 mt-2 w-56 flex-col gap-1 rounded-md bg-indigo-700 p-2 shadow-lg lg:static lg:z-auto lg:mt-0 lg:flex lg:w-auto lg:flex-row lg:gap-1 lg:bg-transparent lg:p-0 lg:shadow-none`}
      >
        {items.map((item) => (
          <li key={item.ruta}>
            <NavLink
              to={item.ruta}
              end={item.ruta === '/'}
              onClick={() => manejarClick(item)}
              className={({ isActive }) =>
                // Entre LG y XL los 7 links van un poco más compactos para entrar en una fila.
                `block rounded-md px-3 py-2 font-medium whitespace-nowrap text-white hover:bg-indigo-600 lg:px-2 lg:text-sm xl:px-3 xl:text-base ${isActive ? 'bg-indigo-800' : ''}`
              }
            >
              {item.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
