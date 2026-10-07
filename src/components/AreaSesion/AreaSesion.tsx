import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../../context/sesion.ts'

// Parte derecha del encabezado: "Ingresar" sin sesión; saludo y "Cerrar sesión" con sesión.
export function AreaSesion() {
  const { usuario, cerrarSesion } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()

  if (!usuario) {
    // En la pantalla de login no tiene sentido mostrar "Ingresar".
    if (location.pathname === '/login') return null
    return (
      <Link
        to="/login"
        state={{ desde: `${location.pathname}${location.search}` }}
        className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-indigo-700 hover:bg-indigo-50"
      >
        Ingresar
      </Link>
    )
  }

  function salir() {
    cerrarSesion()
    navigate('/')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-indigo-100 sm:inline">
        Hola, <strong className="text-white">{usuario.nombre}</strong>
        {usuario.rol === 'ADMIN' && (
          <span className="ml-1 rounded bg-indigo-900 px-1.5 py-0.5 text-xs">ADMIN</span>
        )}
      </span>
      <button
        type="button"
        onClick={salir}
        className="rounded-md border border-indigo-300 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white hover:bg-indigo-600"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
