import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Boton } from './Boton.tsx'

describe('Boton', () => {
  it('es type="button" por defecto, para no enviar formularios sin querer', async () => {
    const onSubmit = vi.fn()
    render(
      <form onSubmit={onSubmit}>
        <Boton>Acción</Boton>
      </form>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Acción' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('avisa el click (prop de salida)', async () => {
    const onClick = vi.fn()
    render(<Boton onClick={onClick}>Guardar</Boton>)
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('mientras carga se deshabilita y muestra el texto de carga', async () => {
    const onClick = vi.fn()
    render(
      <Boton cargando textoCargando="Guardando..." onClick={onClick}>
        Guardar
      </Boton>,
    )
    const boton = screen.getByRole('button', { name: 'Guardando...' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(boton)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('suma las clases de ubicación a las de la variante', () => {
    render(
      <Boton variante="secundario" className="sm:self-end">
        Volver
      </Boton>,
    )
    expect(screen.getByRole('button', { name: 'Volver' })).toHaveClass('bg-white', 'sm:self-end')
  })
})
