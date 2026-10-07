import { Link } from 'react-router-dom'
import { catalogos } from '../Catalogo/configCatalogos.ts'

// Punto de entrada a todos los ABM. Cuando exista el login, se va a mostrar solo a ADMIN.
export function Administracion() {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Administración</h1>
        <p className="mt-2 text-slate-600">Elegí qué datos querés cargar, editar o eliminar.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {catalogos.map((catalogo) => (
          <li key={catalogo.rutaBase}>
            <Link
              to={catalogo.rutaBase}
              className="flex h-full flex-col gap-1 rounded-lg bg-white p-5 shadow transition hover:shadow-md hover:ring-2 hover:ring-indigo-500"
            >
              <h2 className="text-lg font-semibold text-indigo-700">{catalogo.titulo}</h2>
              <p className="text-sm text-slate-600">{catalogo.descripcion}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
