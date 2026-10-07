/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// La app llama directo a la API del backend (VITE_API_URL, ver src/services/api.ts).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tests unitarios de componentes (npm run test). Los end-to-end van con Playwright (carpeta e2e/).
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
