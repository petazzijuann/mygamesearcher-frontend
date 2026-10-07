import { defineConfig, devices } from '@playwright/test'

// Tests end-to-end (npm run test:e2e). Necesitan el backend levantado: la app llama
// directo a la API (VITE_API_URL). Se usa el puerto 5173 porque es el que el backend
// permite por defecto en su CORS (FRONTEND_URL=http://localhost:5173).
const PUERTO = 5173

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
