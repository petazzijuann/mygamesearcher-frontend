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
}

export function MenuNavegacion({ items, onNavegar }: MenuNavegacionProps) {
  const [abierto, setAbierto] = useState(false)

  function manejarClick(item: ItemMenu) {
    setAbierto(false)
    onNavegar?.(item)
  }

  return (
    <nav aria-label="Navegación principal" className="relative">
      {/* Botón hamburguesa: solo en celulares */}
      <button
        type="button"
        className="rounded-md p-2 text-white hover:bg-indigo-600 focus:ring-2 focus:ring-white focus:outline-none md:hidden"
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
        className={`${abierto ? 'flex' : 'hidden'} absolute right-0 mt-2 w-48 flex-col gap-1 rounded-md bg-indigo-700 p-2 shadow-lg md:static md:mt-0 md:flex md:w-auto md:flex-row md:gap-2 md:bg-transparent md:p-0 md:shadow-none`}
      >
        {items.map((item) => (
          <li key={item.ruta}>
            <NavLink
              to={item.ruta}
              end={item.ruta === '/'}
              onClick={() => manejarClick(item)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 font-medium text-white hover:bg-indigo-600 ${isActive ? 'bg-indigo-800' : ''}`
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
