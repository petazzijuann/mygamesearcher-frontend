import { defineConfig, devices } from '@playwright/test'

// Tests end-to-end (npm run test:e2e). Necesitan el backend levantado:
// la app habla con la API real a través del proxy de Vite.
const PUERTO = 5180

export default defineConfig({
  testDir: './e2e',
  // Un solo navegador y de a un test por vez: alcanza para el TP y es más estable en Windows.
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright levanta el frontend solo (o reutiliza uno que ya esté corriendo en ese puerto).
  webServer: {
    command: `npm run dev -- --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
