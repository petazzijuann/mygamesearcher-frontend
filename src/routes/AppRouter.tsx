import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout.tsx'
import { Administracion } from '../pages/Administracion/Administracion.tsx'
import { catalogos } from '../pages/Catalogo/configCatalogos.ts'
import { FormularioCatalogo } from '../pages/Catalogo/FormularioCatalogo.tsx'
import { ListadoCatalogo } from '../pages/Catalogo/ListadoCatalogo.tsx'
import { ErrorInesperado } from '../pages/ErrorInesperado/ErrorInesperado.tsx'
import { Inicio } from '../pages/Inicio/Inicio.tsx'
import { NoEncontrada } from '../pages/NoEncontrada/NoEncontrada.tsx'

// Listado, alta y edición de cada catálogo. La "key" hace que React arranque
// la pantalla de cero al pasar de un catálogo a otro (o de "nuevo" a "editar").
const rutasCatalogos: RouteObject[] = catalogos.flatMap((config) => [
  {
    path: config.rutaBase,
    element: <ListadoCatalogo key={config.rutaBase} config={config} />,
  },
  {
    path: `${config.rutaBase}/nuevo`,
    element: <FormularioCatalogo key={`${config.rutaBase}/nuevo`} config={config} />,
  },
  {
    path: `${config.rutaBase}/:id/editar`,
    element: <FormularioCatalogo key={`${config.rutaBase}/editar`} config={config} />,
  },
])

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorInesperado />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'admin', element: <Administracion /> },
      ...rutasCatalogos,
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])
