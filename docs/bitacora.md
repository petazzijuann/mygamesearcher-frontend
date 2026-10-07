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

## Paso 2 - ABM de Género (07/10/2026)
**Qué se hizo:** alta, baja, modificación y listado de géneros contra la API. Se armaron componentes reutilizables (formulario de nombre, diálogo de confirmación y mensajes de carga, error y éxito) que van a servir de molde para Plataforma, Característica y Clasificación de Edad. Se agregó el envío del token JWT en los pedidos.

**Cómo se hizo:**
- Rama `feature/abm-genero` creada desde `dev`.
- `src/types/genero.ts`: se agregaron `CrearGeneroDto` y `ActualizarGeneroDto`, según el openapi.
- `src/services/generoService.ts`: `listar`, `obtenerPorId`, `crear`, `actualizar` y `eliminar` sobre `/generos`, con la instancia común de axios.
- `src/services/api.ts`:
  - Un interceptor manda `Authorization: Bearer <token>` si hay un token guardado en `localStorage` (clave `token`).
  - `obtenerMensajeError` ahora tiene mensajes propios para 401 ("Necesitás iniciar sesión como administrador...") y 403.
- `src/components/`:
  - `FormularioNombre`: un campo `nombre` con validación (obligatorio, máximo 50 caracteres) y los callbacks `onGuardar` y `onCancelar`.
  - `DialogoConfirmacion`: `<dialog>` nativo con `onConfirmar` y `onCancelar`; se cierra también con Escape.
  - `Cargando`, `MensajeError` (con botón "Reintentar" opcional) y `MensajeExito`.
- `src/pages/Generos/`:
  - `ListadoGeneros`: listado, botón "Nuevo género", editar y eliminar con confirmación.
  - `FormularioGenero`: la misma pantalla para crear y editar; al editar carga el género con `GET /generos/:id`.
- `src/routes/AppRouter.tsx`: rutas `/generos`, `/generos/nuevo` y `/generos/:id/editar`.
- `src/components/Layout/Layout.tsx`: link "Géneros" en el menú.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- Crear, editar y eliminar requieren token de ADMIN, y el login está planeado para más adelante. Se eligió dejar listo el interceptor que lee el token de `localStorage`. Cuando se haga la pantalla de login, solo tiene que guardar el token con la misma clave (`CLAVE_TOKEN`). Se descartó adelantar el login para no cambiar el orden de trabajo.
- Crear y editar comparten pantalla: el formulario es el mismo y cambia solo si hay `id` en la URL. Editar en una pantalla aparte (y no en la misma fila) usa `GET /generos/:id` y maneja el caso de un id que no existe.
- `FormularioNombre` es genérico porque Plataforma, Característica y Clasificación de Edad tienen la misma forma (`id`, `nombre`), así que el paso 3 lo reutiliza.
- La validación en el navegador copia las reglas del DTO (obligatorio, máximo 50). Los errores que solo sabe el backend, como un duplicado (409) o un género usado por un juego al eliminarlo (409), se muestran con el mensaje que devuelve la API.
- Para confirmar se usa `<dialog>` y no `window.confirm`, porque se puede estilar, es accesible y muestra props de entrada y salida.
- La lista es una `<table>` semántica que en celular se ve como tarjetas y desde MD como tabla, sin duplicar el HTML.

**Requisito del TP que cubre:** ABM de Género. Componentes con eventos (submit, click, Escape), reactividad ante el estado (cargando, error, guardando, diálogo abierto), props de entrada y props de salida (`onGuardar`, `onCancelar`, `onConfirmar`, `onReintentar`, `onCerrar`). Servicio para la API, errores mostrados de forma amigable y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend (`npm run dev`).
2. Entrar a "Géneros" en el menú: se ve el listado. Con el backend apagado, aparece "No se pudo conectar con el servidor" y el botón "Reintentar".
3. Sin token, "Nuevo género" → "Crear género" muestra "Necesitás iniciar sesión como administrador para hacer esto."
4. Para cargar un token de ADMIN (hasta que exista el login):
   - Hacer `POST /auth/login` con `{ "email": "...", "contrasena": "..." }` de un usuario ADMIN (por Swagger o Postman) y copiar el `token` de la respuesta.
   - En la consola del navegador (F12), correr `localStorage.setItem('token', 'PEGAR_TOKEN')`.
5. Crear un género: vuelve al listado con el mensaje "Se creó el género...". Probar el nombre vacío o un nombre repetido (error 409 de la API).
6. Editar un género: el formulario aparece con el nombre cargado. Ir a `/generos/9999/editar` muestra el error de "no se encontró".
7. Eliminar: se abre el diálogo de confirmación. Si un juego usa ese género, se ve el mensaje de la API y el género no se borra.
8. Revisar en 375px (tarjetas), 768px (tabla) y 1280px.

## Paso 3 - ABM de Plataforma, Característica y Clasificación de Edad (07/10/2026)
**Qué se hizo:** ABM de Plataforma, Característica y Clasificación de Edad. Como las tres tienen la misma forma que Género (`id`, `nombre`), se hicieron un servicio y dos pantallas genéricas de "catálogo", y Género pasó a usarlas también. Se sumó la pantalla "Administración", que reúne todos los ABM, y los ABM se movieron a rutas bajo `/admin`.

**Cómo se hizo:**
- Rama `feature/abm-catalogos` creada desde `dev`.
- `src/types/plataforma.ts`, `caracteristica.ts` y `clasificacionEdad.ts`: se agregaron los DTOs `Crear...Dto` y `Actualizar...Dto`, según el openapi.
- `src/services/catalogoService.ts`:
  - `crearServicioCatalogo(ruta)` devuelve `listar`, `obtenerPorId`, `crear`, `actualizar` y `eliminar`.
  - Define las interfaces `ItemCatalogo` y `ServicioCatalogo`.
- Un servicio por recurso:
  - Nuevos: `plataformaService.ts` (`/plataformas`), `caracteristicaService.ts` (`/caracteristicas`) y `clasificacionEdadService.ts` (`/clasificaciones-edad`).
  - `generoService.ts` ahora usa la misma función.
- `src/pages/Catalogo/`:
  - `configCatalogos.ts`: configuración de cada catálogo (ruta, título, singular, femenino o masculino, descripción y servicio).
  - `ListadoCatalogo.tsx` y `FormularioCatalogo.tsx`: reciben esa configuración por props.
- Se borraron `src/pages/Generos/ListadoGeneros.tsx` y `FormularioGenero.tsx`, reemplazadas por las genéricas.
- `src/pages/Administracion/Administracion.tsx`: una tarjeta por catálogo (1 columna en celular, 2 desde SM y 4 desde LG).
- `src/routes/AppRouter.tsx`:
  - `/admin`.
  - Para cada catálogo, `<rutaBase>`, `<rutaBase>/nuevo` y `<rutaBase>/:id/editar`, generadas a partir de la configuración.
  - Las rutas de Género cambiaron de `/generos` a `/admin/generos`.
- Menú: "Géneros" se reemplazó por "Administración".
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Pantallas genéricas:** copiar las de Género para cada entidad dejaba 8 pantallas casi idénticas; un arreglo había que hacerlo 4 veces. Con la configuración por props, sumar un catálogo es agregar un objeto a `catalogos`. Se mantiene un archivo de servicio por recurso, como pide la estructura del proyecto.
- **Género gramatical en la configuración** (`femenino`), para que los textos sean correctos: "Nueva plataforma", "Se eliminó la característica", "Nuevo género".
- **`key` en cada ruta** para que React arranque la pantalla de cero al pasar de un catálogo a otro y no quede el estado del anterior.
- **Pantalla "Administración" en vez de un link por ABM en el menú:** con Juegos y Colecciones el menú no entraría en tablet. Además, cuando exista el login, proteger `/admin` y ocultar un solo link alcanza para restringir los ABM a ADMIN. Se descartó mostrar el botón ☰ hasta LG con todos los links.

**Requisito del TP que cubre:** ABM de Plataforma, Característica y Clasificación de Edad. Componentes con props de entrada (`config`) y de salida, reactividad ante el estado, servicios para la API, errores amigables (incluido el 409 al eliminar algo que usa un juego) y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend (`npm run dev`). Para crear, editar y eliminar hace falta el token de ADMIN en `localStorage` (ver el Paso 2).
2. En el menú, entrar a "Administración": se ven 4 tarjetas (Géneros, Plataformas, Características y Clasificaciones de edad).
3. Entrar a "Plataformas": crear, editar y eliminar una. Los textos dicen "Nueva plataforma", "Se creó la plataforma...". Repetir con Características y Clasificaciones de edad.
4. Entrar a "Géneros": funciona igual que antes, ahora en `/admin/generos`.
5. Ir a `/admin/plataformas/9999/editar`: muestra el error de "no se encontró".
6. Revisar la pantalla de Administración en 375px (1 columna), 640px (2 columnas) y 1024px (4 columnas).
