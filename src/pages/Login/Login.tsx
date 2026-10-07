import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { useSesion } from '../../context/sesion.ts'
import { obtenerMensajeError } from '../../services/api.ts'
import { authService } from '../../services/authService.ts'
import { leerDestino } from '../../utils/destinoNavegacion.ts'

interface ErroresLogin {
  email?: string
  contrasena?: string
}

function validar(email: string, contrasena: string): ErroresLogin {
  const errores: ErroresLogin = {}
  if (email.trim() === '') errores.email = 'Ingresá tu email.'
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errores.email = 'El email no es válido.'
  if (contrasena === '') errores.contrasena = 'Ingresá tu contraseña.'
  return errores
}

function vieneDeSesionVencida(estado: unknown): boolean {
  return typeof estado === 'object' && estado !== null && 'vencida' in estado && estado.vencida === true
}

const claseInput =
  'w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'

export function Login() {
  const { usuario, iniciarSesion } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()
  const destino = leerDestino(location.state)
  const sesionVencida = vieneDeSesionVencida(location.state)

  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<ErroresLogin>({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const erroresValidacion = validar(email, contrasena)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setEnviando(true)
    setError(null)
    try {
      const respuesta = await authService.login({ email: email.trim(), contrasena })
      iniciarSesion(respuesta)
      navigate(destino, { replace: true })
    } catch (errorLogin) {
      setError(obtenerMensajeError(errorLogin))
      setEnviando(false)
    }
  }

  if (usuario) {
    return (
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow">
        <h1 className="text-xl font-bold text-slate-900">Ya iniciaste sesión</h1>
        <p className="mt-2 text-slate-600">
          Estás conectado como {usuario.nombre} {usuario.apellido} ({usuario.email}).
        </p>
        <Link to={destino} className="mt-4 inline-block font-medium text-indigo-700 hover:underline">
          Continuar
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Ingresar</h1>
        <p className="mt-1 text-slate-600">Entrá para recibir recomendaciones y guardar tus juegos.</p>
      </header>

      {sesionVencida && (
        <p role="status" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Tu sesión venció. Volvé a ingresar para continuar.
        </p>
      )}

      <form
        onSubmit={(evento) => void manejarEnvio(evento)}
        noValidate
        className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6"
      >
        {error && <MensajeError mensaje={error} />}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoFocus
            aria-invalid={errores.email !== undefined}
            aria-describedby="email-error"
            className={`${claseInput} ${errores.email ? 'border-red-500' : 'border-slate-300'}`}
          />
          {errores.email && (
            <p id="email-error" className="text-sm text-red-700">
              {errores.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contrasena" className="font-medium text-slate-800">
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
            aria-invalid={errores.contrasena !== undefined}
            aria-describedby="contrasena-error"
            className={`${claseInput} ${errores.contrasena ? 'border-red-500' : 'border-slate-300'}`}
          />
          {errores.contrasena && (
            <p id="contrasena-error" className="text-sm text-red-700">
              {errores.contrasena}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link
          to="/registro"
          state={{ desde: destino }}
          className="font-medium text-indigo-700 hover:underline"
        >
          Creá una
        </Link>
      </p>
    </section>
  )
}
