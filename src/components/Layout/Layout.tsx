import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../../context/sesion.ts'
import { AreaSesion } from '../AreaSesion/AreaSesion.tsx'
import { MenuNavegacion, type ItemMenu } from '../MenuNavegacion/MenuNavegacion.tsx'

interface ItemMenuConPermiso extends ItemMenu {
  /** 'sesion': solo con sesión iniciada; 'admin': solo para ADMIN */
  requiere?: 'sesion' | 'admin'
}

const itemsMenu: ItemMenuConPermiso[] = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/juegos', texto: 'Juegos' },
  { ruta: '/recomendar', texto: 'Recomendame' },
  { ruta: '/recomendaciones', texto: 'Mis recomendaciones', requiere: 'sesion' },
  { ruta: '/biblioteca', texto: 'Mi biblioteca', requiere: 'sesion' },
  { ruta: '/colecciones', texto: 'Mis colecciones', requiere: 'sesion' },
  { ruta: '/admin', texto: 'Administración', requiere: 'admin' },
]

export function Layout() {
  const { usuario, esAdmin, vencida, olvidarVencimiento } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()

  // Si la API rechazó el token, se manda al login con el aviso y la pantalla para volver.
  useEffect(() => {
    if (!vencida) return
    olvidarVencimiento()
    navigate('/login', {
      state: { desde: `${location.pathname}${location.search}`, vencida: true },
    })
  }, [vencida, olvidarVencimiento, navigate, location.pathname, location.search])

  const itemsVisibles = itemsMenu.filter(
    (item) =>
      item.requiere === undefined ||
      (item.requiere === 'sesion' && usuario !== null) ||
      (item.requiere === 'admin' && esAdmin),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-indigo-700 shadow">
        {/* En celular y tablet: logo, sesión y ☰ en una fila.
            Desde LG el menú baja a una segunda fila para que entren todos los links. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 lg:px-8">
          <Link to="/" className="text-xl font-bold text-white sm:text-2xl">
            MyGameSearcher
          </Link>
          <div className="ml-auto lg:order-2">
            <AreaSesion />
          </div>
          <MenuNavegacion
            items={itemsVisibles}
            onNavegar={() => window.scrollTo(0, 0)}
            className="lg:order-3 lg:w-full lg:border-t lg:border-indigo-600 lg:pt-2"
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-slate-800 py-4 text-center text-sm text-slate-300">
        <p>MyGameSearcher · Desarrollo de Software · UTN FRRo</p>
      </footer>
    </div>
  )
}
