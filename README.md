# MyGameSearcher - Frontend

Aplicación web que recomienda de 1 a 3 videojuegos según las plataformas, los géneros y las características que elige el usuario. Además permite buscar juegos, armar una biblioteca personal ("Me interesa" / "Ya jugado"), organizar colecciones y calificar las recomendaciones recibidas.

Trabajo práctico de **Desarrollo de Software** - UTN FRRo. Este repo es el frontend; consume la API de [`mygamesearcher-backend`](https://github.com/petazzijuann/mygamesearcher-backend).

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) (mobile-first, breakpoints SM, MD y LG)
- [react-router-dom](https://reactrouter.com/) para las rutas
- [axios](https://axios-http.com/) para hablar con la API

## Requisitos

- Node.js 20.19 o superior (o 22.12 o superior)
- El backend `mygamesearcher-backend` levantado (por defecto en `http://localhost:3000`)

## Instalación y uso

1. Clonar el repo e instalar las dependencias:
   ```bash
   git clone https://github.com/petazzijuann/mygamesearcher-frontend.git
   cd mygamesearcher-frontend
   npm install
   ```
2. Crear el archivo `.env` copiando `.env.example`:
   ```bash
   cp .env.example .env
   ```
   | Variable | Para qué sirve | Valor por defecto |
   |---|---|---|
   | `VITE_API_URL` | Ruta base que usa axios | `/api` |
   | `API_PROXY_TARGET` | Dirección real de la API (solo la usa el proxy de Vite) | `http://localhost:3000` |
3. Levantar el backend (en su repo: `npm run start:dev`).
4. Levantar el frontend:
   ```bash
   npm run dev
   ```
5. Abrir `http://localhost:5173`.

### Cómo se comunica con la API

El frontend le pide todo a `/api/...` y el **proxy de Vite** lo reenvía a la API, sacándole el `/api` (por ejemplo, `/api/juegos` llega como `/juegos`). Para el navegador es el mismo origen, así que no hace falta CORS. El proxy está configurado en `vite.config.ts` y solo existe con `npm run dev`.

Todas las llamadas pasan por una instancia común de axios (`src/services/api.ts`), que agrega el token JWT si hay una sesión guardada y convierte los errores de la API en mensajes en español.

### Sesión (hasta que exista la pantalla de login)

Las pantallas personales y las de administración necesitan un token. Para probarlas:

1. Hacer login en el Swagger del backend (`http://localhost:3000/api`, `POST /auth/login`) y copiar el `token`.
2. En la consola del navegador (F12): `localStorage.setItem('token', 'PEGAR_TOKEN')`.

Para crear, editar o eliminar datos de Administración, el usuario tiene que ser ADMIN.

## Pantallas

| Ruta | Pantalla | Sesión |
|---|---|---|
| `/` | Inicio | No |
| `/juegos` | Listado de juegos con búsqueda por título | No |
| `/juegos/:id` | Detalle de un juego y botones de biblioteca | No (los botones, sí) |
| `/recomendar` | Generar una recomendación personalizada | Sí |
| `/recomendaciones` | Historial de recomendaciones, filtrado por fecha | Sí |
| `/recomendaciones/:id` | Detalle de una recomendación y calificación de cada juego | Sí |
| `/biblioteca` | Mi biblioteca ("Me interesa" / "Ya jugado") | Sí |
| `/colecciones` | Mis colecciones (alta, edición, baja y detalle con sus juegos) | Sí |
| `/admin` | Administración: ABM de juegos, géneros, plataformas, características y clasificaciones de edad | ADMIN |

## Estructura

```
src/
  components/  -> componentes reutilizables (Buscador, TarjetaJuego, SelectorMultiple, ...)
  pages/       -> una carpeta por pantalla
  routes/      -> definición de rutas (AppRouter.tsx)
  services/    -> un servicio por recurso; todos usan la instancia común de axios (api.ts)
  types/       -> interfaces de los modelos y DTOs, según el openapi del backend
  utils/       -> funciones de ayuda (fechas, estados, mensajes)
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la app en modo desarrollo (con el proxy a la API) |
| `npm run build` | Verifica los tipos y genera la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con oxlint |
| `npm run preview` | Sirve la versión de producción generada |

## Documentación

- [Índice de la documentación](./docs/README.md)
- [Bitácora del desarrollo](./docs/bitacora.md): qué se hizo en cada paso, por qué y cómo probarlo
- [Especificación de la API](./docs/api/openapi.json) (openapi del backend)
