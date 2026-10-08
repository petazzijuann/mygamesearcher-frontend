import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListaEtiquetas } from './ListaEtiquetas.tsx'

describe('ListaEtiquetas', () => {
  it('muestra una etiqueta por cada item', () => {
    render(
      <ListaEtiquetas
        items={[
          { id: 1, nombre: 'Acción' },
          { id: 2, nombre: 'Aventura' },
        ]}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Aventura')).toBeInTheDocument()
  })

  it('con una lista vacía muestra el texto de vacío', () => {
    render(<ListaEtiquetas items={[]} textoVacio="Ninguno" />)
    expect(screen.getByText('Ninguno')).toBeInTheDocument()
  })

  it('si la lista no llegó (undefined o null) no muestra nada y no se rompe', () => {
    const { container, rerender } = render(<ListaEtiquetas items={undefined} />)
    expect(container).toBeEmptyDOMElement()

    rerender(<ListaEtiquetas items={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
