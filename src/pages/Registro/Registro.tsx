import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MensajeError } from '../../components/MensajeError/MensajeError.tsx'
import { useSesion } from '../../context/sesion.ts'
import { obtenerMensajeError } from '../../services/api.ts'
import { authService } from '../../services/authService.ts'
import { plataformaService } from '../../services/plataformaService.ts'
import { usuarioService } from '../../services/usuarioService.ts'
import type { Plataforma } from '../../types/plataforma.ts'
import { leerDestino } from '../../utils/destinoNavegacion.ts'

// Mismos límites que CrearUsuarioDto en el backend.
const LARGO_NOMBRE = 50
const LARGO_EMAIL = 100
const CONTRASENA_MINIMO = 8
const CONTRASENA_MAXIMO = 72

interface ValoresRegistro {
  nombre: string
  apellido: string
  email: string
  contrasena: string
  confirmacion: string
  plataformaId: string
}

type ErroresRegistro = Partial<Record<keyof ValoresRegistro, string>>

function validar(valores: ValoresRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {}
  if (valores.nombre.trim() === '') errores.nombre = 'Ingresá tu nombre.'
  else if (valores.nombre.trim().length > LARGO_NOMBRE) {
    errores.nombre = `El nombre no puede tener más de ${LARGO_NOMBRE} caracteres.`
  }
  if (valores.apellido.trim() === '') errores.apellido = 'Ingresá tu apellido.'
  else if (valores.apellido.trim().length > LARGO_NOMBRE) {
    errores.apellido = `El apellido no puede tener más de ${LARGO_NOMBRE} caracteres.`
  }
  if (valores.email.trim() === '') errores.email = 'Ingresá tu email.'
  else if (!/^\S+@\S+\.\S+$/.test(valores.email.trim())) errores.email = 'El email no es válido.'
  else if (valores.email.trim().length > LARGO_EMAIL) {
    errores.email = `El email no puede tener más de ${LARGO_EMAIL} caracteres.`
  }
  if (valores.contrasena.length < CONTRASENA_MINIMO || valores.contrasena.length > CONTRASENA_MAXIMO) {
    errores.contrasena = `La contraseña tiene que tener entre ${CONTRASENA_MINIMO} y ${CONTRASENA_MAXIMO} caracteres.`
  }
  if (valores.confirmacion !== valores.contrasena) {
    errores.confirmacion = 'Las contraseñas no coinciden.'
  }
  return errores
}

const claseInput =
  'w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'

interface CampoProps {
  id: keyof ValoresRegistro
  etiqueta: string
  error?: string
  ayuda?: string
  className?: string
  children: ReactNode
}

function Campo({ id, etiqueta, error, ayuda, className = '', children }: CampoProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="font-medium text-slate-800">
        {etiqueta}
      </label>
      {children}
      {(error ?? ayuda) && (
        <p id={`${id}-ayuda`} className={`text-sm ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {error ?? ayuda}
        </p>
      )}
    </div>
  )
}

export function Registro() {
  const { usuario, iniciarSesion } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()
  const destino = leerDestino(location.state)

  const [valores, setValores] = useState<ValoresRegistro>({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    confirmacion: '',
    plataformaId: '',
  })
  const [errores, setErrores] = useState<ErroresRegistro>({})
  const [plataformas, setPlataformas] = useState<Plataforma[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // La plataforma favorita es opcional: si no se pueden cargar, el campo no se muestra.
  useEffect(() => {
    let vigente = true
    plataformaService
      .listar()
      .then((datos) => {
        if (vigente) setPlataformas(datos)
      })
      .catch(() => {
        if (vigente) setPlataformas([])
      })
    return () => {
      vigente = false
    }
  }, [])

  function cambiar(campo: keyof ValoresRegistro, valor: string) {
    const nuevos = { ...valores, [campo]: valor }
    setValores(nuevos)
    if (errores[campo]) {
      setErrores((actuales) => ({ ...actuales, [campo]: validar(nuevos)[campo] }))
    }
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const erroresValidacion = validar(valores)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setEnviando(true)
    setError(null)
    const email = valores.email.trim()
    try {
      await usuarioService.registrar({
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim(),
        email,
        contrasena: valores.contrasena,
        ...(valores.plataformaId ? { plataformaId: Number(valores.plataformaId) } : {}),
      })
      // Recién registrado: se inicia sesión con los mismos datos.
      const respuesta = await authService.login({ email, contrasena: valores.contrasena })
      iniciarSesion(respuesta)
      navigate(destino, { replace: true })
    } catch (errorRegistro) {
      setError(obtenerMensajeError(errorRegistro))
      setEnviando(false)
    }
  }

  if (usuario) {
    return (
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow">
        <h1 className="text-xl font-bold text-slate-900">Ya tenés una sesión iniciada</h1>
        <p className="mt-2 text-slate-600">
          Para crear otra cuenta, primero cerrá la sesión de {usuario.nombre}.
        </p>
        <Link to="/" className="mt-4 inline-block font-medium text-indigo-700 hover:underline">
          Ir al inicio
        </Link>
      </section>
    )
  }

  function claseCampo(campo: keyof ValoresRegistro): string {
    return `${claseInput} ${errores[campo] ? 'border-red-500' : 'border-slate-300'}`
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Crear cuenta</h1>
        <p className="mt-1 text-slate-600">Es gratis y te lleva un minuto.</p>
      </header>

      <form
        onSubmit={(evento) => void manejarEnvio(evento)}
        noValidate
        className="grid gap-4 rounded-lg bg-white p-4 shadow sm:grid-cols-2 sm:p-6"
      >
        {error && (
          <div className="sm:col-span-2">
            <MensajeError mensaje={error} />
          </div>
        )}

        <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
          <input
            id="nombre"
            type="text"
            autoComplete="given-name"
            value={valores.nombre}
            onChange={(evento) => cambiar('nombre', evento.target.value)}
            maxLength={LARGO_NOMBRE}
            autoFocus
            aria-invalid={errores.nombre !== undefined}
            aria-describedby="nombre-ayuda"
            className={claseCampo('nombre')}
          />
        </Campo>

        <Campo id="apellido" etiqueta="Apellido" error={errores.apellido}>
          <input
            id="apellido"
            type="text"
            autoComplete="family-name"
            value={valores.apellido}
            onChange={(evento) => cambiar('apellido', evento.target.value)}
            maxLength={LARGO_NOMBRE}
            aria-invalid={errores.apellido !== undefined}
            aria-describedby="apellido-ayuda"
            className={claseCampo('apellido')}
          />
        </Campo>

        <Campo id="email" etiqueta="Email" error={errores.email} className="sm:col-span-2">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={valores.email}
            onChange={(evento) => cambiar('email', evento.target.value)}
            maxLength={LARGO_EMAIL}
            aria-invalid={errores.email !== undefined}
            aria-describedby="email-ayuda"
            className={claseCampo('email')}
          />
        </Campo>

        <Campo
          id="contrasena"
          etiqueta="Contraseña"
          error={errores.contrasena}
          ayuda={`Entre ${CONTRASENA_MINIMO} y ${CONTRASENA_MAXIMO} caracteres.`}
        >
          <input
            id="contrasena"
            type="password"
            autoComplete="new-password"
            value={valores.contrasena}
            onChange={(evento) => cambiar('contrasena', evento.target.value)}
            maxLength={CONTRASENA_MAXIMO}
            aria-invalid={errores.contrasena !== undefined}
            aria-describedby="contrasena-ayuda"
            className={claseCampo('contrasena')}
          />
        </Campo>

        <Campo id="confirmacion" etiqueta="Repetí la contraseña" error={errores.confirmacion}>
          <input
            id="confirmacion"
            type="password"
            autoComplete="new-password"
            value={valores.confirmacion}
            onChange={(evento) => cambiar('confirmacion', evento.target.value)}
            maxLength={CONTRASENA_MAXIMO}
            aria-invalid={errores.confirmacion !== undefined}
            aria-describedby="confirmacion-ayuda"
            className={claseCampo('confirmacion')}
          />
        </Campo>

        {plataformas.length > 0 && (
          <Campo
            id="plataformaId"
            etiqueta="Plataforma favorita"
            ayuda="Opcional."
            className="sm:col-span-2"
          >
            <select
              id="plataformaId"
              value={valores.plataformaId}
              onChange={(evento) => cambiar('plataformaId', evento.target.value)}
              aria-describedby="plataformaId-ayuda"
              className={`${claseInput} border-slate-300 bg-white`}
            >
              <option value="">Ninguna</option>
              {plataformas.map((plataforma) => (
                <option key={plataforma.id} value={plataforma.id}>
                  {plataforma.nombre}
                </option>
              ))}
            </select>
          </Campo>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 sm:col-span-2"
        >
          {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" state={{ desde: destino }} className="font-medium text-indigo-700 hover:underline">
          Ingresá
        </Link>
      </p>
    </section>
  )
}
