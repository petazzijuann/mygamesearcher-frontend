import { Link } from 'react-router-dom'

export function NoEncontrada() {
  return (
    <section className="mx-auto max-w-xl py-12 text-center">
      <p className="text-6xl font-bold text-indigo-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">La página que buscás no existe o fue movida.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-600"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
