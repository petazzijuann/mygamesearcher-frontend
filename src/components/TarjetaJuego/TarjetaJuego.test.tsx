import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Juego } from '../../types/juego.ts'
import { TarjetaJuego } from './TarjetaJuego.tsx'

const juegoCompleto: Juego = {
  id: 7,
  titulo: 'Juego de prueba',
  anioLanzamiento: 2020,
  descripcion: 'Descripción',
  imagenUrl: null,
  clasificacionEdad: { id: 1, nombre: 'ATP' },
  plataformas: [{ id: 1, nombre: 'PC' }],
  generos: [{ id: 3, nombre: 'Estrategia' }],
  caracteristicas: [],
}

// TarjetaJuego tiene un Link: necesita estar dentro de un router.
function dibujar(juego: Parameters<typeof TarjetaJuego>[0]['juego']) {
  return render(
    <MemoryRouter>
      <TarjetaJuego juego={juego} />
    </MemoryRouter>,
  )
}

describe('TarjetaJuego', () => {
  it('con el juego completo muestra título, año, clasificación y géneros, y lleva al detalle', () => {
    dibujar(juegoCompleto)
    expect(screen.getByRole('link', { name: 'Juego de prueba' })).toHaveAttribute('href', '/juegos/7')
    expect(screen.getByText('2020 · ATP')).toBeInTheDocument()
    expect(screen.getByText('Estrategia')).toBeInTheDocument()
  })

  it('con el juego resumido (sin clasificación ni géneros) se dibuja igual, sin romperse', () => {
    // Así llegaba el juego desde GET /biblioteca antes del arreglo del backend.
    dibujar({ id: 9, titulo: 'Juego resumido', imagenUrl: null, anioLanzamiento: 2015 })

    expect(screen.getByRole('link', { name: 'Juego resumido' })).toBeInTheDocument()
    expect(screen.getByText('2015')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
