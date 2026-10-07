import { Link, Outlet } from 'react-router-dom'
import { MenuNavegacion, type ItemMenu } from '../MenuNavegacion/MenuNavegacion.tsx'

// Se agrega un link por cada pantalla a medida que se construye.
const itemsMenu: ItemMenu[] = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/recomendar', texto: 'Recomendame' },
  { ruta: '/juegos', texto: 'Juegos' },
  { ruta: '/biblioteca', texto: 'Mi biblioteca' },
  { ruta: '/colecciones', texto: 'Mis colecciones' },
  { ruta: '/admin', texto: 'Administración' },
]

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-indigo-700 shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="text-xl font-bold text-white sm:text-2xl">
            DGame
          </Link>
          <MenuNavegacion items={itemsMenu} onNavegar={() => window.scrollTo(0, 0)} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-slate-800 py-4 text-center text-sm text-slate-300">
        <p>DGame · Desarrollo de Software · UTN FRRo</p>
      </footer>
    </div>
  )
}
