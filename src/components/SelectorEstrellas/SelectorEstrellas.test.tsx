import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectorEstrellas } from './SelectorEstrellas.tsx'

// Test unitario de componente: props de entrada (valor, deshabilitado, error),
// prop de salida (onCambiar) y manejo de eventos (clic y teclado).
describe('SelectorEstrellas', () => {
  it('muestra la leyenda y 5 estrellas, ninguna marcada si no hay valor', () => {
    render(<SelectorEstrellas nombre="prueba" leyenda="Calificá el juego" valor={null} onCambiar={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'Calificá el juego' })).toBeInTheDocument()
    const estrellas = screen.getAllByRole('radio')
    expect(estrellas).toHaveLength(5)
    for (const estrella of estrellas) {
      expect(estrella).not.toBeChecked()
    }
  })

  it('al hacer clic en la tercera estrella avisa 3 con onCambiar', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(<SelectorEstrellas nombre="prueba" valor={null} onCambiar={onCambiar} />)

    await usuario.click(screen.getByRole('radio', { name: '3 de 5 estrellas' }))

    expect(onCambiar).toHaveBeenCalledTimes(1)
    expect(onCambiar).toHaveBeenCalledWith(3)
  })

  it('marca la estrella que corresponde al valor recibido y se actualiza si cambia', () => {
    const { rerender } = render(<SelectorEstrellas nombre="prueba" valor={2} onCambiar={vi.fn()} />)
    expect(screen.getByRole('radio', { name: '2 de 5 estrellas' })).toBeChecked()

    rerender(<SelectorEstrellas nombre="prueba" valor={5} onCambiar={vi.fn()} />)
    expect(screen.getByRole('radio', { name: '5 de 5 estrellas' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '2 de 5 estrellas' })).not.toBeChecked()
  })

  it('se puede manejar con el teclado (flecha derecha pasa a la siguiente estrella)', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(<SelectorEstrellas nombre="prueba" valor={3} onCambiar={onCambiar} />)

    screen.getByRole('radio', { name: '3 de 5 estrellas' }).focus()
    await usuario.keyboard('{ArrowRight}')

    expect(onCambiar).toHaveBeenLastCalledWith(4)
  })

  it('deshabilitado no deja elegir y muestra el mensaje de error', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(
      <SelectorEstrellas
        nombre="prueba"
        valor={null}
        deshabilitado
        error="Elegí de 1 a 5 estrellas."
        onCambiar={onCambiar}
      />,
    )

    for (const estrella of screen.getAllByRole('radio')) {
      expect(estrella).toBeDisabled()
    }
    expect(screen.getByText('Elegí de 1 a 5 estrellas.')).toBeInTheDocument()

    await usuario.click(screen.getByRole('radio', { name: '1 de 5 estrellas' }))
    expect(onCambiar).not.toHaveBeenCalled()
  })
})
