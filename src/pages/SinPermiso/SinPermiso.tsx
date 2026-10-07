import { Link } from 'react-router-dom'

// Se muestra cuando un usuario con sesión entra a una pantalla que es solo para ADMIN.
export function SinPermiso() {
  return (
    <section className="mx-auto max-w-xl py-12 text-center">
      <p className="text-6xl font-bold text-indigo-700" aria-hidden="true">
        🔒
      </p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">
        No tenés permiso para ver esta página
      </h1>
      <p className="mt-2 text-slate-600">
        Esta sección es solo para administradores. Si creés que es un error, pedile a un
        administrador que revise tu cuenta.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-600"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
