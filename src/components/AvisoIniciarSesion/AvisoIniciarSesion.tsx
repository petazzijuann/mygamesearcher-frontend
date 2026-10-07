import { Link, useLocation } from 'react-router-dom'

interface AvisoIniciarSesionProps {
  /** Para qué hace falta la sesión, por ejemplo "guardar este juego en tu biblioteca" */
  para: string
  compacto?: boolean
}

// Aviso con link al login. Después de ingresar, se vuelve a la pantalla actual.
export function AvisoIniciarSesion({ para, compacto = false }: AvisoIniciarSesionProps) {
  const location = useLocation()

  return (
    <p
      className={
        compacto
          ? 'rounded-md bg-slate-100 p-3 text-sm text-slate-600'
          : 'rounded-md bg-white p-6 text-center text-slate-600 shadow'
      }
    >
      <Link
        to="/login"
        state={{ desde: `${location.pathname}${location.search}` }}
        className="font-medium text-indigo-700 hover:underline"
      >
        Iniciá sesión
      </Link>{' '}
      para {para}.
    </p>
  )
}
