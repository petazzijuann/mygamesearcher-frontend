import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { Recomendar } from './Recomendar.tsx'
import { plataformaService } from '../../services/plataformaService.ts'
import { generoService } from '../../services/generoService.ts'
import { caracteristicaService } from '../../services/caracteristicaService.ts'
import { recomendacionService } from '../../services/recomendacionService.ts'
import { bibliotecaService } from '../../services/bibliotecaService.ts'
import type { Busqueda } from '../../types/busqueda.ts'

vi.mock('../../services/plataformaService.ts')
vi.mock('../../services/generoService.ts')
vi.mock('../../services/caracteristicaService.ts')
vi.mock('../../services/recomendacionService.ts')
vi.mock('../../services/bibliotecaService.ts')
vi.mock('../../components/BotonesBiblioteca/BotonesBiblioteca.tsx', () => ({ BotonesBiblioteca: () => null }))
const juego = { id: 15, titulo: 'Alfa', anioLanzamiento: 2020, imagenUrl: null, generos: [{ id: 2, nombre: 'RPG' }], clasificacionEdad: { id: 1, nombre: 'ATP' } }
const resultado = { id: 1, tipo: 'IA', plataformas: [{ id: 1, nombre: 'PC' }], generos: juego.generos, caracteristicas: [], recomendaciones: [{ id: 1, juego, orden: 1, motivo: 'Ideal para tus aventuras RPG.' }] } as unknown as Busqueda

beforeEach(() => {
  vi.resetAllMocks()
  Element.prototype.scrollIntoView = vi.fn()
  vi.mocked(plataformaService.listar).mockResolvedValue(resultado.plataformas)
  vi.mocked(generoService.listar).mockResolvedValue(resultado.generos)
  vi.mocked(caracteristicaService.listar).mockResolvedValue([])
  vi.mocked(bibliotecaService.listar).mockResolvedValue([])
})
async function preparar() {
  const user = userEvent.setup()
  render(<MemoryRouter><Recomendar /></MemoryRouter>)
  await user.click(await screen.findByRole('checkbox', { name: 'PC' }))
  await user.click(screen.getByRole('checkbox', { name: 'RPG' }))
  return user
}

describe('modalidades de recomendación', () => {
  it('selecciona sistema por defecto y envía las preferencias', async () => {
    vi.mocked(recomendacionService.generar).mockResolvedValue({ ...resultado, tipo: 'SISTEMA' })
    const user = await preparar()
    expect(screen.getByRole('radio', { name: 'Recomendación por sistema' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Recomendame juegos' }))
    expect(recomendacionService.generar).toHaveBeenCalledWith({ tipo: 'SISTEMA', plataformaIds: [1], generoIds: [2], caracteristicaIds: null })
    expect(await screen.findByText('Alfa')).toBeInTheDocument()
  })

  it('alterna conservando filtros y muestra carga, explicación y detalle de IA', async () => {
    let resolver!: (valor: Busqueda) => void
    vi.mocked(recomendacionService.generar).mockReturnValue(new Promise((resolve) => { resolver = resolve }))
    const user = await preparar()
    await user.click(screen.getByRole('radio', { name: 'Recomendación por IA' }))
    await user.click(screen.getByRole('radio', { name: 'Recomendación por sistema' }))
    await user.click(screen.getByRole('radio', { name: 'Recomendación por IA' }))
    await user.click(screen.getByRole('button', { name: 'Recomendame juegos' }))
    expect(screen.getByText('La IA está analizando tus preferencias...')).toBeInTheDocument()
    expect(recomendacionService.generar).toHaveBeenCalledWith({ tipo: 'IA', plataformaIds: [1], generoIds: [2], caracteristicaIds: null })
    resolver(resultado)
    expect(await screen.findByText('Ideal para tus aventuras RPG.')).toBeInTheDocument()
    expect(screen.getByText(/Generada mediante IA/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alfa' })).toHaveAttribute('href', '/juegos/15')
  })

  it('muestra el error de IA y permite cambiar de modalidad sin fallback', async () => {
    const config = { headers: new AxiosHeaders() }
    vi.mocked(recomendacionService.generar).mockRejectedValue(new AxiosError('error', 'ERR_BAD_RESPONSE', config, null, { status: 503, statusText: 'Unavailable', headers: {}, config, data: { message: 'La IA no está disponible. Intentá nuevamente.' } }))
    const user = await preparar()
    await user.click(screen.getByRole('radio', { name: 'Recomendación por IA' }))
    await user.click(screen.getByRole('button', { name: 'Recomendame juegos' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('La IA no está disponible.')
    expect(recomendacionService.generar).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Recomendame juegos' })).toBeEnabled())
    await user.click(screen.getByRole('radio', { name: 'Recomendación por sistema' }))
    expect(screen.getByRole('radio', { name: 'Recomendación por sistema' })).toBeChecked()
  })
})
