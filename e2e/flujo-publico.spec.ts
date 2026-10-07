import { expect, test } from '@playwright/test'

// Test end-to-end: recorre la app como un visitante sin sesión, contra la API real.
// Requiere el backend levantado y al menos un juego con "zelda" en el título.
// No escribe nada en la base.
test.describe('Visitante sin sesión', () => {
  test('busca un juego, ve su detalle y para guardar o recomendar le piden ingresar', async ({
    page,
  }) => {
    // 1. Inicio
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Encontrá tu próximo videojuego' })).toBeVisible()

    // 2. Ir al listado de juegos desde el botón del inicio
    await page.getByRole('link', { name: 'Ver juegos' }).click()
    await expect(page).toHaveURL(/\/juegos$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Juegos' })).toBeVisible()

    // 3. Buscar por título: la búsqueda queda en la URL y aparecen resultados
    await page.getByLabel('Buscar por título').fill('zelda')
    await expect(page).toHaveURL(/\?titulo=zelda/)
    await expect(page.getByText(/juegos? encontrados?/)).toBeVisible()
    const resultados = page.getByRole('main').getByRole('article')
    await expect(resultados.first()).toContainText(/zelda/i)

    // 4. Abrir el detalle del primer resultado
    const titulo = (await resultados.first().getByRole('link').textContent())?.trim() ?? ''
    await resultados.first().getByRole('link').click()
    await expect(page).toHaveURL(/\/juegos\/\d+$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo)
    await expect(page.getByText('Plataformas')).toBeVisible()

    // 5. Sin sesión, la biblioteca pide ingresar
    await expect(page.getByRole('link', { name: 'Iniciá sesión' })).toBeVisible()

    // 6. "Volver" regresa al listado con la búsqueda intacta
    await page.getByRole('button', { name: '← Volver' }).click()
    await expect(page).toHaveURL(/\/juegos\?titulo=zelda/)

    // 7. "Recomendame" es una pantalla protegida: lleva al login
    await page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: 'Recomendame' })
      .click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Ingresar' })).toBeVisible()
  })

  test('una ruta que no existe muestra la página 404 con link al inicio', async ({ page }) => {
    await page.goto('/una-ruta-que-no-existe')
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible()
    await page.getByRole('link', { name: 'Volver al inicio' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
