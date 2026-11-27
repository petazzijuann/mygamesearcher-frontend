import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CLAVE_TOKEN, CLAVE_USUARIO } from '../services/api.ts'
import type { UsuarioLogin } from '../types/auth.ts'
import { CANAL_SESION, useSesion } from './sesion.ts'
import { SesionProvider } from './SesionProvider.tsx'

const usuario: UsuarioLogin = {
  id: 1,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@mail.com',
  rol: 'USUARIO',
}

function MostrarSesion() {
  const { usuario: actual, cerrarSesion } = useSesion()
  return (
    <>
      <p>{actual ? `Sesión de ${actual.nombre}` : 'Sin sesión'}</p>
      <button type="button" onClick={cerrarSesion}>
        Salir
      </button>
    </>
  )
}

function guardarSesion() {
  localStorage.setItem(CLAVE_TOKEN, 'token-de-prueba')
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

function dibujar() {
  render(
    <SesionProvider>
      <MostrarSesion />
    </SesionProvider>,
  )
}

// Simula otra pestaña de la app: un canal propio con el mismo nombre
let otraPestania: BroadcastChannel

beforeEach(() => {
  localStorage.clear()
  otraPestania = new BroadcastChannel(CANAL_SESION)
})
afterEach(() => otraPestania.close())

describe('SesionProvider (sincronización entre pestañas)', () => {
  it('se pone al día cuando otra pestaña inicia sesión', async () => {
    dibujar()
    expect(screen.getByText('Sin sesión')).toBeInTheDocument()

    // La otra pestaña guarda la sesión en localStorage y avisa por el canal
    guardarSesion()
    act(() => otraPestania.postMessage({ tipo: 'inicio' }))

    expect(await screen.findByText('Sesión de Ana')).toBeInTheDocument()
  })

  it('cierra la sesión cuando otra pestaña la cierra', async () => {
    guardarSesion()
    dibujar()
    expect(screen.getByText('Sesión de Ana')).toBeInTheDocument()

    act(() => otraPestania.postMessage({ tipo: 'cierre' }))

    expect(await screen.findByText('Sin sesión')).toBeInTheDocument()
  })

  it('al cerrar sesión avisa a las otras pestañas', async () => {
    guardarSesion()
    const recibidos: unknown[] = []
    otraPestania.onmessage = (evento) => recibidos.push(evento.data)
    dibujar()

    await userEvent.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(recibidos).toEqual([{ tipo: 'cierre' }]))
  })

  it('no reacciona al evento storage (cualquier escritura en localStorage)', () => {
    guardarSesion()
    dibujar()

    // Antes, esto releía la sesión; ahora solo cuentan los avisos del canal
    localStorage.removeItem(CLAVE_TOKEN)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: CLAVE_TOKEN }))
    })

    expect(screen.getByText('Sesión de Ana')).toBeInTheDocument()
  })
})
