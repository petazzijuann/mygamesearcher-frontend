import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout.tsx'
import { Administracion } from '../pages/Administracion/Administracion.tsx'
import { catalogos } from '../pages/Catalogo/configCatalogos.ts'
import { FormularioCatalogo } from '../pages/Catalogo/FormularioCatalogo.tsx'
import { ListadoCatalogo } from '../pages/Catalogo/ListadoCatalogo.tsx'
import { MiBiblioteca } from '../pages/Biblioteca/MiBiblioteca.tsx'
import { DetalleColeccion } from '../pages/Colecciones/DetalleColeccion.tsx'
import { FormularioColeccion } from '../pages/Colecciones/FormularioColeccion.tsx'
import { ListadoColecciones } from '../pages/Colecciones/ListadoColecciones.tsx'
import { ErrorInesperado } from '../pages/ErrorInesperado/ErrorInesperado.tsx'
import { Inicio } from '../pages/Inicio/Inicio.tsx'
import { DetalleJuego } from '../pages/Juegos/DetalleJuego.tsx'
import { FormularioJuego } from '../pages/Juegos/FormularioJuego.tsx'
import { ListadoJuegos } from '../pages/Juegos/ListadoJuegos.tsx'
import { ListadoJuegosAdmin } from '../pages/Juegos/ListadoJuegosAdmin.tsx'
import { NoEncontrada } from '../pages/NoEncontrada/NoEncontrada.tsx'
import { DetalleRecomendacion } from '../pages/Recomendaciones/DetalleRecomendacion.tsx'
import { HistorialRecomendaciones } from '../pages/Recomendaciones/HistorialRecomendaciones.tsx'
import { Recomendar } from '../pages/Recomendar/Recomendar.tsx'

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
      { path: 'recomendar', element: <Recomendar /> },
      { path: 'recomendaciones', element: <HistorialRecomendaciones /> },
      { path: 'recomendaciones/:id', element: <DetalleRecomendacion /> },
      { path: 'juegos', element: <ListadoJuegos /> },
      { path: 'juegos/:id', element: <DetalleJuego /> },
      { path: 'biblioteca', element: <MiBiblioteca /> },
      { path: 'colecciones', element: <ListadoColecciones /> },
      { path: 'colecciones/nueva', element: <FormularioColeccion key="nueva" /> },
      { path: 'colecciones/:id', element: <DetalleColeccion /> },
      { path: 'colecciones/:id/editar', element: <FormularioColeccion key="editar" /> },
      { path: 'admin', element: <Administracion /> },
      ...rutasCatalogos,
      { path: 'admin/juegos', element: <ListadoJuegosAdmin /> },
      { path: 'admin/juegos/nuevo', element: <FormularioJuego key="nuevo" /> },
      { path: 'admin/juegos/:id/editar', element: <FormularioJuego key="editar" /> },
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])
