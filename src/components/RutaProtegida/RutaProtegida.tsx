import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../../context/sesion.ts'
import { SinPermiso } from '../../pages/SinPermiso/SinPermiso.tsx'

interface RutaProtegidaProps {
  /** 'sesion': cualquier usuario logueado; 'admin': solo ADMIN */
  requiere: 'sesion' | 'admin'
}

// Envuelve un grupo de rutas (se usa como ruta "layout" en AppRouter).
// Sin sesión manda al login (y vuelve después); sin el rol muestra "No tenés permiso".
export function RutaProtegida({ requiere }: RutaProtegidaProps) {
  const { usuario, esAdmin } = useSesion()
  const location = useLocation()

  if (!usuario) {
    return (
      <Navigate to="/login" replace state={{ desde: `${location.pathname}${location.search}` }} />
    )
  }
  if (requiere === 'admin' && !esAdmin) {
    return <SinPermiso />
  }
  return <Outlet />
}
