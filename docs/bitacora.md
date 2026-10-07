# Bitácora del frontend

## Paso 1 - Estructura base (07/10/2026)
**Qué se hizo:** se armó la base de la app: rutas con react-router-dom, un layout responsive con menú de navegación, la instancia común de axios, los tipos TypeScript de todos los modelos de la API, la pantalla de inicio, la página 404 y una pantalla de error inesperado. Se instaló Tailwind CSS y se quitó el contenido de demo de la plantilla de Vite.

**Cómo se hizo:**
- Rama `feature/estructura-base` creada desde `dev`.
- `npm install tailwindcss @tailwindcss/vite` y se agregó el plugin en `vite.config.ts`. `src/index.css` importa Tailwind y define los estilos base.
- Se borraron `src/App.tsx`, `src/App.css`, `src/assets/*` y `public/icons.svg` (eran de la plantilla).
- `index.html`: idioma `es` y título de la app.
- `src/vite-env.d.ts`: tipa la variable `VITE_API_URL`.
- `src/services/api.ts`: instancia de axios con `baseURL = VITE_API_URL` y la función `obtenerMensajeError()`. Esta función traduce los errores del backend (`ErrorRespuestaDto`, cuyo `message` puede ser un texto o una lista) y los errores de conexión a un mensaje amigable en español.
- `src/types/`: un archivo por modelo según `docs/api/openapi.json`: `Genero`, `Plataforma`, `Caracteristica`, `ClasificacionEdad`, `Juego`, `Usuario` (y el tipo `Rol`), `Coleccion`, `JuegoGuardado` (y el tipo `EstadoJuego`), `Busqueda`, `Recomendacion` y `ErrorRespuesta`.
- `src/routes/AppRouter.tsx`: `createBrowserRouter` con `/` (Layout + Inicio), `*` (404) y `errorElement`.
- `src/components/Layout/Layout.tsx`: estructura semántica `header` / `nav` / `main` / `footer`.
- `src/components/MenuNavegacion/MenuNavegacion.tsx`: menú con botón hamburguesa en celular y menú horizontal desde MD.
- `src/pages/Inicio`, `src/pages/NoEncontrada` y `src/pages/ErrorInesperado`.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Tailwind v4** porque sus breakpoints `sm` (640px), `md` (768px) y `lg` (1024px) son mobile-first: se escribe primero el estilo del celular y se agrega lo de pantallas más grandes. Así se cumple el requisito de la cátedra de forma visible. Se descartaron CSS Modules (más lento de escribir) y Bootstrap (trae su propia estética y no muestra CSS mobile-first propio).
- `MenuNavegacion` recibe los links por props (entrada), maneja el estado `abierto` con el evento click y avisa con `onNavegar` (salida). Cubre desde el primer paso los requisitos de componentes.
- Los tipos usan uniones (`'USUARIO' | 'ADMIN'`) en vez de `enum` porque el proyecto tiene `erasableSyntaxOnly`. Las fechas quedan como `string` porque la API las manda en formato ISO. Los DTOs para crear y editar se agregan en el paso de cada ABM.
- El menú solo muestra "Inicio": cada link se agrega cuando su pantalla exista, para que no haya links rotos.
- El token JWT en los headers queda para el paso de login.

**Requisito del TP que cubre:** CSS mobile-first con 3 breakpoints, HTML5 semántico, errores mostrados de forma amigable (404, error inesperado y mensajes de la API), interfaz usable sin manual, componente con eventos, estado y props de entrada y salida, base del servicio para la API y tipado de los datos sin `any`.

**Cómo probarlo:**
1. Copiar `.env.example` a `.env` y completar `VITE_API_URL`. Correr `npm run dev`.
2. Abrir `http://localhost:5173`: se ve la pantalla de inicio.
3. Con las herramientas de desarrollo, en modo responsive: por debajo de 768px aparece el botón ☰, que abre y cierra el menú. Desde 768px el menú se ve horizontal. Las tarjetas de inicio se apilan en celular y pasan a 3 columnas desde 640px.
4. Ir a `http://localhost:5173/cualquier-cosa`: aparece la página 404 con el botón "Volver al inicio".
