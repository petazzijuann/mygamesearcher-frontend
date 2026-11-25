import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { calcularPaginas, SALTO } from '../../utils/paginas.ts'
import { Paginacion } from './Paginacion.tsx'

describe('calcularPaginas', () => {
  it('muestra la primera, la última y las vecinas de la actual', () => {
    expect(calcularPaginas(5, 54)).toEqual([1, SALTO, 4, 5, 6, SALTO, 54])
  })

  it('no pone "…" para saltear una sola página', () => {
    expect(calcularPaginas(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('en los extremos no repite números', () => {
    expect(calcularPaginas(1, 54)).toEqual([1, 2, SALTO, 54])
    expect(calcularPaginas(54, 54)).toEqual([1, SALTO, 53, 54])
  })
})

describe('Paginacion', () => {
  it('avisa la página elegida y marca la actual', async () => {
    const onCambiarPagina = vi.fn()
    render(<Paginacion pagina={5} totalPaginas={54} onCambiarPagina={onCambiarPagina} />)

    expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute('aria-current', 'page')

    await userEvent.click(screen.getByRole('button', { name: 'Página 54' }))
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(onCambiarPagina.mock.calls).toEqual([[54], [6], [4]])
  })

  it('deshabilita "Anterior" en la primera página y "Siguiente" en la última', () => {
    const { rerender } = render(
      <Paginacion pagina={1} totalPaginas={3} onCambiarPagina={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled()

    rerender(<Paginacion pagina={3} totalPaginas={3} onCambiarPagina={() => {}} />)
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
  })

  it('no se muestra si hay una sola página', () => {
    render(<Paginacion pagina={1} totalPaginas={1} onCambiarPagina={() => {}} />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
