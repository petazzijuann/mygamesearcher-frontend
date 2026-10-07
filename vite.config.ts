import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // El tercer parámetro '' carga también las variables sin prefijo VITE_
  // (API_PROXY_TARGET se usa solo acá y no llega al navegador).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Proxy de desarrollo: el frontend le pide todo a /api/... y Vite lo reenvía
      // a la API (sacándole el /api). Para el navegador es el mismo origen,
      // así que no hace falta CORS en el backend.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (ruta) => ruta.replace(/^\/api/, ''),
        },
      },
    },
  }
})
