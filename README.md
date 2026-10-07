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
- El backend `mygamesearcher-backend` levantado (por defecto en `http://localhost:3000`) y con este frontend permitido en su CORS (variable `FRONTEND_URL` del backend; por defecto ya permite `http://localhost:5173`)

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
   | `VITE_API_URL` | Dirección de la API del backend (sin barra al final) | `http://localhost:3000` |
3. Levantar el backend (en su repo: `npm run start:dev`).
4. Levantar el frontend:
   ```bash
   npm run dev
   ```
5. Abrir `http://localhost:5173`.

### Cómo se comunica con la API

El frontend llama **directo a la API REST del backend**, a la dirección de `VITE_API_URL` (por ejemplo, `GET http://localhost:3000/juegos`). Como frontend y backend están en direcciones distintas, el backend tiene que permitir la del frontend en su CORS (variable `FRONTEND_URL` del backend).

Todas las llamadas pasan por una instancia común de axios (`src/services/api.ts`), que agrega el token JWT si hay una sesión guardada y convierte los errores de la API en mensajes en español.

Vite escribe `VITE_API_URL` dentro del código al compilar: si se cambia, hay que reiniciar `npm run dev` (o volver a publicar en Vercel).

## Publicar en Vercel

El frontend se publica como un proyecto de Vercel separado del backend.

1. En Vercel: **Add New → Project** e importar este repo. Vercel detecta Vite solo: el comando de build es `npm run build` y la carpeta de salida, `dist`.
2. En **Settings → Environment Variables**, cargar `VITE_API_URL` con la URL **pública** del backend, sin barra al final (por ejemplo `https://mygamesearcher-backend.vercel.app`). Tiene que ser la dirección de producción del backend, no la de un deploy puntual (`...-abc123.vercel.app`), que Vercel protege con login.
3. Publicar (**Deploy**). Si después se cambia la variable, hay que volver a publicar.
4. En el proyecto del **backend**, agregar la URL del frontend publicado a su `FRONTEND_URL` (por ejemplo `http://localhost:5173,https://mygamesearcher-frontend.vercel.app`) y volver a publicarlo, para que su CORS lo permita.

`vercel.json` hace que cualquier ruta de la app (`/juegos/5`, `/admin`...) devuelva `index.html`. Sin eso, al recargar o abrir un link directo, Vercel respondería 404, porque esas rutas las maneja react-router en el navegador.

### Sesión

Desde "Ingresar" (arriba a la derecha) se inicia sesión, y desde "Creá una" se crea una cuenta nueva (con rol USUARIO). La sesión (token JWT y datos del usuario) se guarda en el navegador y se comparte en toda la app con un contexto de React (`src/context/`). Si el token vence, la app avisa y pide ingresar de nuevo.

El primer administrador lo crea el backend al arrancar, con los datos `ADMIN_EMAIL` y `ADMIN_CONTRASENA` de su `.env`. Solo un ADMIN ve "Administración" y puede crear, editar o eliminar sus datos.

## Pantallas

| Ruta | Pantalla | Sesión |
|---|---|---|
| `/` | Inicio | No |
| `/login` | Ingresar | No |
| `/registro` | Crear cuenta | No |
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
  context/     -> sesión compartida (SesionProvider y el hook useSesion)
  pages/       -> una carpeta por pantalla
  routes/      -> definición de rutas (AppRouter.tsx)
  services/    -> un servicio por recurso; todos usan la instancia común de axios (api.ts)
  types/       -> interfaces de los modelos y DTOs, según el openapi del backend
  utils/       -> funciones de ayuda (fechas, estados, mensajes)
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la app en modo desarrollo en `http://localhost:5173` |
| `npm run build` | Verifica los tipos y genera la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con oxlint |
| `npm run preview` | Sirve la versión de producción generada |
| `npm run test` | Corre los tests unitarios de componentes (Vitest + Testing Library) |
| `npm run test:watch` | Igual que `test`, pero los vuelve a correr al guardar cambios |
| `npm run test:e2e` | Corre los tests end-to-end en un navegador (Playwright). Necesita el backend levantado |

### Tests

- **Unitario de componente:** `src/components/SelectorEstrellas/SelectorEstrellas.test.tsx`. Prueba que el componente muestre las 5 estrellas, que marque la del valor recibido (props de entrada), que avise la elegida con `onCambiar` (prop de salida) al hacer clic o usar el teclado, y que no deje elegir cuando está deshabilitado.
- **End-to-end:** `e2e/flujo-publico.spec.ts`. Recorre la app como un visitante sin sesión: inicio, listado de juegos, búsqueda por título, detalle, volver con la búsqueda intacta, y "Recomendame" lleva al login. También prueba la página 404. Usa la API real y no escribe nada en la base.

La primera vez, antes de `npm run test:e2e`, hay que descargar el navegador: `npx playwright install chromium`.

## Documentación

- [Índice de la documentación](./docs/README.md)
- [Bitácora del desarrollo](./docs/bitacora.md): qué se hizo en cada paso, por qué y cómo probarlo
- [Especificación de la API](./docs/api/openapi.json) (openapi del backend)
