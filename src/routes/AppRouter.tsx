import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout.tsx'
import { ErrorInesperado } from '../pages/ErrorInesperado/ErrorInesperado.tsx'
import { Inicio } from '../pages/Inicio/Inicio.tsx'
import { NoEncontrada } from '../pages/NoEncontrada/NoEncontrada.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorInesperado />,
    children: [
      { index: true, element: <Inicio /> },
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])
