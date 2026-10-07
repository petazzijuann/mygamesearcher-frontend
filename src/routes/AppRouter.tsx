import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout.tsx'
import { ErrorInesperado } from '../pages/ErrorInesperado/ErrorInesperado.tsx'
import { FormularioGenero } from '../pages/Generos/FormularioGenero.tsx'
import { ListadoGeneros } from '../pages/Generos/ListadoGeneros.tsx'
import { Inicio } from '../pages/Inicio/Inicio.tsx'
import { NoEncontrada } from '../pages/NoEncontrada/NoEncontrada.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorInesperado />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'generos', element: <ListadoGeneros /> },
      { path: 'generos/nuevo', element: <FormularioGenero /> },
      { path: 'generos/:id/editar', element: <FormularioGenero /> },
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])
