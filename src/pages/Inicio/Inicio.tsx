import { Link } from 'react-router-dom'

export function Inicio() {
  return (
    <section className="mx-auto max-w-3xl text-center">
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
        Encontrá tu próximo videojuego
      </h1>
      <p className="mt-4 text-base text-slate-600 md:text-lg">
        MyGameSearcher te recomienda de 1 a 3 videojuegos según los géneros, las características y la
        plataforma que elijas.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/recomendar"
          className="rounded-md bg-indigo-700 px-6 py-3 font-semibold text-white hover:bg-indigo-600"
        >
          Quiero una recomendación
        </Link>
        <Link
          to="/juegos"
          className="rounded-md border border-indigo-700 bg-white px-6 py-3 font-medium text-indigo-700 hover:bg-indigo-50"
        >
          Ver juegos
        </Link>
      </div>

      <ol className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        <li className="rounded-lg bg-white p-4 shadow">
          <h2 className="font-semibold text-indigo-700">1. Elegí</h2>
          <p className="mt-1 text-sm text-slate-600">Tus géneros, características y plataforma.</p>
        </li>
        <li className="rounded-lg bg-white p-4 shadow">
          <h2 className="font-semibold text-indigo-700">2. Descubrí</h2>
          <p className="mt-1 text-sm text-slate-600">Hasta 3 juegos recomendados para vos.</p>
        </li>
        <li className="rounded-lg bg-white p-4 shadow">
          <h2 className="font-semibold text-indigo-700">3. Guardá</h2>
          <p className="mt-1 text-sm text-slate-600">Los que te interesan y los que ya jugaste.</p>
        </li>
      </ol>
    </section>
  )
}
