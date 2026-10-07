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

## Paso 4 - ABM de Juego (07/10/2026)
**Qué se hizo:** alta, baja, modificación y listado de juegos desde Administración. El formulario carga título, año, descripción, imagen (con vista previa), clasificación de edad y las listas de plataformas, géneros y características. Se sumaron dos componentes reutilizables: `SelectorMultiple` e `ImagenJuego`.

**Cómo se hizo:**
- Rama `feature/abm-juego` creada desde `dev`.
- `src/types/juego.ts`: se agregaron `CrearJuegoDto` y `ActualizarJuegoDto`, según el openapi.
- `src/services/juegoService.ts`: `listar(titulo?)` (manda `?titulo=` si se pasa un filtro), `obtenerPorId`, `crear`, `actualizar` y `eliminar`.
- `src/components/SelectorMultiple/SelectorMultiple.tsx`:
  - Grupo de checkboxes con forma de "chips", dentro de `<fieldset>` y `<legend>`.
  - Recibe las opciones, los ids elegidos y el error; devuelve los cambios con `onCambiar(ids)`.
  - Muestra cuántas opciones hay elegidas ("2 de 5").
- `src/components/ImagenJuego/ImagenJuego.tsx`: muestra la portada; si no hay URL o la imagen no carga, muestra un recuadro "Sin imagen".
- `src/utils/mensajeNavegacion.ts`: la función que lee el mensaje de éxito que se pasa al volver al listado, antes repetida en cada listado.
- `src/pages/Juegos/ListadoJuegosAdmin.tsx`: tarjetas con miniatura en celular y tabla (juego, año, clasificación y acciones) desde MD. Eliminar pide confirmación.
- `src/pages/Juegos/FormularioJuego.tsx`:
  - Carga en paralelo (`Promise.all`) las clasificaciones, plataformas, géneros y características, y el juego si se está editando.
  - Valida con las mismas reglas del DTO y muestra un error debajo de cada campo.
  - Arma el DTO convirtiendo los textos a número y la URL vacía a `null`.
- `src/pages/Administracion/Administracion.tsx`: se agregó la tarjeta "Juegos" (grilla de 1, 2 y 3 columnas).
- `src/routes/AppRouter.tsx`: rutas `/admin/juegos`, `/admin/juegos/nuevo` y `/admin/juegos/:id/editar`.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Checkboxes y no `<select multiple>`:** en el select múltiple, sobre todo en celular, no se entiende que se pueden elegir varias opciones. `SelectorMultiple` se va a reutilizar en el Paso 8 (generar recomendación), que pide las mismas tres listas.
- **Valores del formulario como texto:** año y clasificación se guardan como `string` mientras se escribe, para permitir el campo vacío, y se convierten a número recién al armar el DTO. Así se evitan `NaN` y no hace falta `any`.
- **Al editar se manda el juego completo:** el `PATCH` reemplaza las listas de ids que recibe, así que mandar siempre todo evita borrar algo sin querer.
- **Año máximo 2026 fijo**, igual que en el backend, para no aceptar un año que la API va a rechazar. Quedó un comentario para cambiarlo si cambia allá.
- **Aviso de catálogos faltantes:** si no hay clasificaciones, plataformas o géneros, el formulario no se muestra y aparece un aviso con links para cargarlos, porque sin esos datos el juego no se puede crear.

**Requisito del TP que cubre:** ABM de Juego. Componentes con props de entrada y de salida (`onCambiar`), manejo de eventos y reactividad ante el estado (validación en vivo, vista previa de la imagen, contador de caracteres). Servicio para la API, datos tipados sin `any`, errores amigables y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend. Cargar el token de ADMIN (ver el Paso 2) y tener al menos una clasificación, una plataforma y un género cargados (Paso 3).
2. Ir a Administración → "Juegos" → "Nuevo juego".
3. Apretar "Crear juego" con todo vacío: cada campo obligatorio muestra su error en rojo y arriba aparece "Revisá los campos marcados en rojo".
4. Completar los datos, pegar una URL de imagen (se ve la vista previa) y elegir plataformas, géneros y características tocando los chips. Al crear, vuelve al listado con el mensaje "Se creó el juego...".
5. Editar el juego: el formulario aparece con todos los datos y chips marcados. Cambiar algo y guardar.
6. Probar un año fuera de rango (por ejemplo 1900) y una URL inválida.
7. Sin plataformas cargadas, "Nuevo juego" muestra el aviso con el link a Plataformas.
8. Eliminar un juego con la confirmación.
9. Revisar en 375px (una columna, tarjetas), 768px (campos de a dos, selectores de a tres, tabla) y 1280px.

## Paso 5 - ABM de Colección (07/10/2026)
**Qué se hizo:** cada usuario puede crear, ver, editar y eliminar sus colecciones, y agregarles o quitarles juegos desde el detalle (CUU "Administrar colección"). Se sumó "Mis colecciones" al menú.

**Cómo se hizo:**
- Rama `feature/abm-coleccion` creada desde `dev`.
- `src/types/coleccion.ts`: se agregaron `CrearColeccionDto`, `ActualizarColeccionDto` y `AgregarJuegoDto`, según el openapi.
- `src/services/coleccionService.ts`:
  - `listar` (solo las del usuario logueado), `obtenerPorId`, `crear`, `actualizar` y `eliminar`.
  - `agregarJuego` (`POST /colecciones/:id/juegos`) y `quitarJuego` (`DELETE /colecciones/:id/juegos/:juegoId`).
- `src/services/api.ts`: el mensaje del 401 pasó a ser "Necesitás iniciar sesión para hacer esto.", porque las colecciones las usa cualquier usuario y no solo ADMIN.
- `src/utils/fechas.ts`: `formatearFecha(iso)` usa `Intl.DateTimeFormat('es-AR')` y muestra, por ejemplo, "7 de octubre de 2026".
- `src/pages/Colecciones/`:
  - `ListadoColecciones.tsx`: tarjetas `<article>` con nombre, cantidad de juegos, fecha (`<time>`) y descripción; botones Ver, Editar y Eliminar (con confirmación).
  - `FormularioColeccion.tsx`: nombre (obligatorio, máximo 100) y descripción (opcional, máximo 500, con contador; vacía se manda como `null`). Al crear, lleva directo al detalle para empezar a agregar juegos.
  - `DetalleColeccion.tsx`: datos de la colección, lista de juegos con "Quitar" y buscador "Agregar juegos". El buscador usa `juegoService.listar(titulo)` y marca como "Ya agregado" los juegos que ya están en la colección.
- `src/routes/AppRouter.tsx`: rutas `/colecciones`, `/colecciones/nueva`, `/colecciones/:id` y `/colecciones/:id/editar`.
- `src/components/Layout/Layout.tsx`: link "Mis colecciones" en el menú.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Juegos solo desde el detalle:** se usan los endpoints propios de agregar y quitar (el CUU del backend), el formulario queda simple y se ve al instante qué juegos tiene la colección. Se descartó elegir los juegos en el formulario de alta con `juegoIds`.
- **Del alta al detalle:** después de crear una colección lo siguiente es agregarle juegos, así que se va directo al detalle y no al listado.
- **Quitar sin confirmación:** quitar un juego se deshace volviendo a agregarlo. Eliminar la colección entera sí pide confirmación.
- **Buscador con botón "Buscar" (submit):** no se busca en cada tecla, así no se le pega a la API todo el tiempo, y el evento submit también funciona con Enter.
- **En el detalle, la colección se actualiza con la respuesta del `POST`** (que devuelve la colección completa) y, al quitar, se filtra localmente. No hace falta volver a pedir todo.
- **"Mis colecciones" en el menú y no en Administración:** las colecciones son de cada usuario, no son datos que carga el ADMIN.

**Requisito del TP que cubre:** ABM de Colección y CUU "Administrar colección" (agregar y quitar juegos). Eventos (submit, click), reactividad ante el estado (botones "Agregando..." y "Quitando...", "Ya agregado"), servicio para la API, HTML semántico (`article`, `time`, `search`), errores amigables y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend. Cargar el token de cualquier usuario en `localStorage` (como en el Paso 2) y tener juegos cargados (Paso 4).
2. Sin token, "Mis colecciones" muestra "Necesitás iniciar sesión para hacer esto."
3. "Mis colecciones" → "Nueva colección": crear una. Lleva al detalle con el mensaje "Se creó la colección...".
4. En "Agregar juegos", buscar por título (o vacío para ver todos) y apretar "Agregar". El juego pasa a la lista de la izquierda y su botón dice "Ya agregado".
5. Quitar un juego con "Quitar".
6. "Editar datos": cambiar nombre y descripción y guardar.
7. Volver al listado y eliminar la colección con la confirmación.
8. Ir a `/colecciones/9999`: muestra el error de "no se encontró".
9. Revisar en 375px (una columna), 640px (listado de a dos) y 1024px (listado de a tres; en el detalle, juegos y buscador lado a lado).

## Paso 6 - Listado de juegos filtrado por nombre + detalle (07/10/2026)
**Qué se hizo:** pantalla pública "Juegos" con búsqueda en vivo por título y una grilla de tarjetas, y pantalla de detalle de cada juego. Se sumaron tres componentes reutilizables: `Buscador`, `TarjetaJuego` y `ListaEtiquetas`.

**Cómo se hizo:**
- Rama `feature/listado-juegos` creada desde `dev`.
- `src/components/Buscador/Buscador.tsx`:
  - Campo de búsqueda con `<label>`, botón ✕ para limpiar y `role="search"`.
  - Espera 400 ms después de la última tecla y avisa con `onBuscar(texto)`. Con Enter busca en el momento.
- `src/components/TarjetaJuego/TarjetaJuego.tsx`:
  - `<article>` con portada, título, año, clasificación y géneros. El link del título se estira a toda la tarjeta para que se pueda tocar en cualquier parte.
  - La prop opcional `pie` permite sumar contenido; se va a usar en recomendaciones.
- `src/components/ListaEtiquetas/ListaEtiquetas.tsx`: muestra listas de nombres como etiquetas, en tamaño chico o normal.
- `src/pages/Juegos/ListadoJuegos.tsx`:
  - El filtro se guarda en la URL (`?titulo=`) con `useSearchParams` y se busca con `juegoService.listar(titulo)`.
  - Grilla de 1, 2, 3 y 4 columnas (base, SM, MD y LG) y contador de resultados.
  - Mensajes para "sin resultados" y para errores, con "Reintentar".
- `src/pages/Juegos/DetalleJuego.tsx`:
  - `GET /juegos/:id`, con portada, título, año, clasificación, descripción, y plataformas, géneros y características en una `<dl>`.
  - En celular, una columna; desde MD, portada a la izquierda y datos a la derecha.
- `src/routes/AppRouter.tsx`: rutas `/juegos` y `/juegos/:id`.
- Menú: link "Juegos". Inicio: botón "Ver juegos".
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Búsqueda en vivo con espera (debounce) de 400 ms:** es lo que se espera de un buscador, y la espera evita pedirle a la API una búsqueda por cada letra. Se descartó buscar solo con un botón.
- **Respuestas viejas ignoradas:** si una búsqueda vieja llega después de una nueva, se ignora con una bandera `vigente` en el efecto. Así nunca se muestran resultados que no corresponden al texto actual.
- **Filtro en la URL y no en un estado:** al entrar a un juego y volver, la búsqueda sigue ahí, y el link se puede compartir. Se usa `replace` para no llenar el historial con cada letra.
- **"Volver" en el detalle:** si se llegó desde el listado, vuelve atrás (con la búsqueda que había); si se entró directo por la URL, va a `/juegos`.
- **Etiquetas de solo lectura** (`ListaEtiquetas`) para mostrar las listas, distintas del `SelectorMultiple` del ABM, que sirve para elegir.

**Requisito del TP que cubre:** listado de juegos filtrado por nombre y detalle. Eventos (input, submit, click), reactividad ante el estado (resultados, cargando, error, sin resultados), props de entrada y de salida (`onBuscar`), HTML semántico (`article`, `search`, `dl`), errores amigables y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend. No hace falta token, porque estas pantallas son públicas.
2. En el menú (o en el botón "Ver juegos" del inicio), entrar a "Juegos": se ven todas las tarjetas.
3. Escribir parte de un título: al dejar de escribir, la lista se filtra y la URL cambia a `?titulo=...`. Con ✕ se limpia.
4. Buscar algo que no exista: aparece "No encontramos juegos que coincidan con «...»".
5. Tocar una tarjeta: abre el detalle. "← Volver" regresa al listado con la búsqueda intacta.
6. Ir a `/juegos/9999`: muestra el error de "no se encontró" y el link "Ver todos los juegos".
7. Revisar el listado en 375px (1 columna), 640px (2), 768px (3) y 1024px (4), y el detalle en celular (una columna) y desde 768px (dos columnas).

## Paso 7 - Biblioteca personal (07/10/2026)
**Qué se hizo:** el usuario puede marcar cualquier juego como "Me interesa" o "Ya jugado" desde su detalle, y ver, filtrar y cambiar sus juegos guardados en la pantalla "Mi biblioteca".

**Cómo se hizo:**
- Rama `feature/biblioteca` creada desde `dev`.
- `src/types/juegoGuardado.ts`: se agregaron `GuardarJuegoDto` y `CambiarEstadoDto`, según el openapi.
- `src/utils/estadoJuego.ts`: textos de cada estado ("Me interesa", "Ya jugado"), la lista de estados y `esEstadoJuego()`, que valida lo que llega en la URL.
- `src/services/bibliotecaService.ts`: `listar(estado?)`, `guardar` (`POST /biblioteca`), `cambiarEstado` (`PATCH /biblioteca/:juegoId`) y `quitar` (`DELETE /biblioteca/:juegoId`).
- `src/services/api.ts`: `haySesion()` dice si hay un token guardado.
- `src/components/BotonesBiblioteca/BotonesBiblioteca.tsx`:
  - Dos botones de alternar con `aria-pressed`. Según el estado actual, hace `POST` (no estaba guardado), `PATCH` (cambia de estado) o `DELETE` (se tocó el que ya estaba marcado).
  - Avisa el nuevo estado con `onCambio`, recién cuando la API confirmó el cambio. Mientras espera, los botones quedan deshabilitados; los errores se muestran debajo.
- `src/pages/Juegos/DetalleJuego.tsx`: nueva sección "En tu biblioteca". Trae la biblioteca y busca el juego para saber su estado. Sin sesión, muestra "Iniciá sesión para guardar este juego en tu biblioteca" y no le pide nada a la API.
- `src/pages/Biblioteca/MiBiblioteca.tsx`:
  - Pestañas Todos / Me interesa / Ya jugado. La elegida queda en la URL (`?estado=`) y el filtro lo aplica la API.
  - Grilla de `TarjetaJuego`; el pie de cada tarjeta muestra la fecha de guardado y los `BotonesBiblioteca`.
- `src/components/TarjetaJuego/TarjetaJuego.tsx`: el pie se puso por encima (`z-10`) del link que cubre toda la tarjeta, para que sus botones se puedan tocar.
- Menú: link "Mi biblioteca". Rutas: `/biblioteca`.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Estado de un juego:** la API no tiene un endpoint para consultar un solo juego, así que el detalle trae la biblioteca (`GET /biblioteca`) y lo busca ahí. No se inventó un endpoint.
- **Botones de alternar:** tocar el estado marcado lo quita de la biblioteca. Con dos botones se cubren las tres operaciones (guardar, cambiar y quitar) sin un tercer botón "Quitar".
- **`onCambio` después de la confirmación:** el estado cambia solo cuando la API respondió bien, así la pantalla nunca muestra algo que no se guardó. Se descartó la actualización optimista, porque habría que deshacerla si falla.
- **La lista se actualiza sin volver a pedirla:** en una pestaña filtrada, el juego que cambia de estado o se quita desaparece al instante.
- **Pestaña en la URL:** al recargar o volver desde un juego, se mantiene la pestaña elegida.
- **Sin sesión no se llama a la API desde el detalle:** se evita mostrar un error 401 a alguien que solo está mirando juegos. Cuando exista el login, `haySesion()` va a seguir funcionando igual.

**Requisito del TP que cubre:** biblioteca personal ("Me interesa" / "Ya jugado"). Componente con props de entrada (`estado`) y de salida (`onCambio`), eventos (click), reactividad ante el estado (botón marcado, deshabilitado mientras procesa, tarjetas que desaparecen), servicio para la API, errores amigables y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend. Cargar el token de un usuario en `localStorage` (como en el Paso 2).
2. Sin token, el detalle de un juego muestra "Iniciá sesión para guardar este juego en tu biblioteca".
3. Con token, en el detalle de un juego tocar "⭐ Me interesa": queda marcado. Tocar "✔ Ya jugado": cambia. Tocar de nuevo el marcado: se quita.
4. Ir a "Mi biblioteca": aparecen los juegos guardados con la fecha. Cambiar de pestaña: la URL cambia a `?estado=...` y la lista se filtra.
5. En la pestaña "Me interesa", pasar un juego a "Ya jugado": desaparece de esa pestaña y aparece en "Ya jugado".
6. Con la biblioteca vacía aparece el mensaje con el link "Buscar juegos".
7. Revisar en 375px (pestañas a todo el ancho, 1 columna), 640px, 768px y 1024px (hasta 4 columnas).

## Paso 8 - Generar recomendación personalizada (07/10/2026)
**Qué se hizo:** pantalla "Recomendame" (CUU Generar recomendación). El usuario elige plataformas, géneros y, si quiere, características, y la API devuelve de 1 a 3 juegos, que se muestran en orden y se pueden guardar en la biblioteca. Además, el menú pasó a mostrarse con ☰ hasta LG.

**Cómo se hizo:**
- Rama `feature/generar-recomendacion` creada desde `dev`.
- `src/types/busqueda.ts`: se agregó `GenerarRecomendacionDto`, según el openapi.
- `src/services/recomendacionService.ts`: `generar(dto)` (`POST /recomendaciones`). El Paso 9 le suma el resto.
- `src/pages/Recomendar/Recomendar.tsx`:
  - Sin sesión, muestra un aviso y no llama a la API.
  - Con sesión, carga en paralelo plataformas, géneros y características, y muestra tres `SelectorMultiple` (plataformas y géneros obligatorios).
  - Al generar, también pide la biblioteca para saber qué juegos ya están en "Me interesa".
  - Resultados ordenados por `orden` en una lista `<ol>` de `TarjetaJuego`; el pie de cada tarjeta muestra "Recomendación #N" y los `BotonesBiblioteca`. Arriba, un resumen de los criterios usados y el botón "Cambiar criterios", que vuelve al formulario sin perder lo elegido.
  - Si la API responde 404 (ningún juego cumple), muestra su mensaje con una sugerencia para ampliar la búsqueda.
- `src/components/MenuNavegacion/MenuNavegacion.tsx`: el botón ☰ se ve hasta LG (`md:` → `lg:`), y el menú desplegado queda por encima del contenido (`z-20`).
- Menú: link "Recomendame". Inicio: botón principal "Quiero una recomendación" y "Ver juegos" como secundario.
- `src/routes/AppRouter.tsx`: ruta `/recomendar`.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Se reutilizan `SelectorMultiple`, `TarjetaJuego` y `BotonesBiblioteca`:** se hicieron en los pasos 4, 6 y 7 pensando en esta pantalla.
- **El 404 no se trata como error:** "ningún juego cumple los criterios" es un resultado posible de la búsqueda, así que se muestra como aviso (amarillo) con una sugerencia y no como falla (rojo).
- **Foco al título de los resultados:** al generar, el contenido cambia abajo del formulario. Llevar la vista y el foco al título hace que se note el cambio, también con lector de pantalla.
- **Pedir la biblioteca después de generar:** la API excluye los "Ya jugado", pero puede recomendar uno que ya está en "Me interesa". Para que el botón aparezca marcado hay que saberlo. Si ese pedido falla, la recomendación igual se muestra.
- **Menú con ☰ hasta LG:** con 6 links (y el historial del Paso 9) no entran en una fila en 768px. Se descartó por ahora un submenú desplegable; se va a reordenar el menú cuando exista el login.

**Requisito del TP que cubre:** CUU Generar recomendación personalizada. Componentes con props de entrada y de salida, eventos (submit, click), reactividad ante el estado (validación, "Buscando juegos para vos...", resultados, sin resultados), servicio para la API, errores amigables y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend. Cargar el token de un usuario en `localStorage` (como en el Paso 2) y tener juegos cargados.
2. Sin token, "Recomendame" muestra "Iniciá sesión para recibir recomendaciones personalizadas".
3. Con token, entrar a "Recomendame" (menú o botón del inicio). Apretar "Recomendame juegos" sin elegir nada: aparecen los errores en plataformas y géneros.
4. Elegir plataformas y géneros y generar: la pantalla baja a los resultados (1 a 3 juegos, "Recomendación #1", "#2"...), con el resumen de criterios.
5. Marcar un resultado como "Me interesa" y verificarlo en "Mi biblioteca". Marcar uno como "Ya jugado" y volver a generar con los mismos criterios: ese juego ya no aparece.
6. "Cambiar criterios" vuelve al formulario con lo elegido. Elegir una combinación sin juegos: aparece el aviso amarillo con la sugerencia.
7. Revisar en 375px (selectores y resultados en una columna), 768px (☰ todavía visible, selectores de a dos) y 1024px (menú horizontal, selectores y resultados de a tres).

## Paso 9 - Listado de recomendaciones filtrado por fecha + detalle (07/10/2026)
**Qué se hizo:** pantalla "Mis recomendaciones" con el historial de búsquedas, filtro por fecha (desde / hasta) y opción de borrar cada una. Pantalla de detalle de cada búsqueda con los criterios usados, los juegos recomendados y un formulario para calificar cada juego de 1 a 5 estrellas con un comentario.

**Cómo se hizo:**
- Rama `feature/historial-recomendaciones` creada desde `dev`.
- `src/types/recomendacion.ts`: se agregó `CalificarRecomendacionDto`, según el openapi.
- `src/types/busqueda.ts`:
  - `JuegoResumen`, `RecomendacionResumen` y `BusquedaResumen`: tipos para el historial, armados con `Pick`/`Omit` sobre los del openapi, sin campos nuevos.
  - `FiltroHistorial` (`desde` y `hasta`).
- `src/services/recomendacionService.ts`: se agregaron `listar(filtro)`, `obtenerPorId`, `eliminar` y `calificar(busquedaId, juegoId, dto)`.
- `src/utils/fechas.ts`: se agregaron `formatearFechaHora` (fecha con hora) y `esFechaAAAAMMDD`, que valida las fechas que llegan en la URL.
- `src/components/SelectorEstrellas/SelectorEstrellas.tsx`:
  - 5 estrellas que por dentro son radio buttons en un `<fieldset>`: se manejan con las flechas del teclado y el lector de pantalla lee "3 de 5 estrellas".
  - Devuelve el valor con `onCambiar`.
- `src/components/FormularioCalificacion/FormularioCalificacion.tsx`:
  - Estrellas, un comentario opcional (máximo 500, con contador) y el botón "Guardar calificación" (o "Actualizar", si ya estaba calificado).
  - Muestra la fecha de la última calificación y avisa con `onCalificada`.
- `src/pages/Recomendaciones/HistorialRecomendaciones.tsx`:
  - Filtro con dos `<input type="date">` que queda en la URL (`?desde=&hasta=`); se valida que "Desde" no sea posterior a "Hasta".
  - Tarjetas con fecha y hora, criterios, los juegos recomendados en miniatura (con sus estrellas, si ya se calificaron) y los botones "Ver detalle y calificar" y "Borrar" (con confirmación).
- `src/pages/Recomendaciones/DetalleRecomendacion.tsx`: fecha, criterios en una `<dl>` con etiquetas, cada juego recomendado (con link a su detalle) con su `FormularioCalificacion`, y el botón "Borrar del historial".
- `src/pages/Recomendar/Recomendar.tsx`: al pie de los resultados, un link "Ver en mi historial" que lleva al detalle de esa búsqueda.
- `src/components/MenuNavegacion/MenuNavegacion.tsx`: entre LG y XL los links van un poco más compactos (`lg:px-2 lg:text-sm`) para que los 7 entren en una fila desde 1024px.
- Menú: link "Mis recomendaciones". Rutas: `/recomendaciones` y `/recomendaciones/:id`.
- Verificado con `npm run build` y `npm run lint` sin errores.

**Por qué:**
- **Formato de fecha `AAAA-MM-DD`:** el openapi solo dice que `desde` y `hasta` son texto, así que se confirmó en el código del backend (`filtro-historial.dto.ts`). Exige ese formato y toma los días completos en hora argentina (el día "hasta" entra entero). Es justo lo que devuelve un `<input type="date">`, así que no hace falta convertir nada.
- **Tipos de resumen para el historial:** el backend devuelve en `GET /recomendaciones` solo un resumen de cada juego (`id`, `titulo`, `anioLanzamiento`, `imagenUrl`) y no incluye el usuario, aunque el openapi dice `Busqueda[]` completas. Con los tipos de resumen, TypeScript no deja usar en el listado un dato que no llega (por ejemplo, los géneros del juego). **Pendiente:** corregir el Swagger del backend para que lo documente.
- **Las estrellas son radio buttons:** son accesibles con teclado y lector de pantalla sin código extra, y se ven como estrellas con CSS.
- **Al calificar, se actualizan solo la calificación, el comentario y la fecha:** no se vuelve a pedir la búsqueda entera.
- **"Volver al historial"** vuelve atrás en el navegador si se llegó desde el listado, así se mantiene el filtro de fechas.

**Requisito del TP que cubre:** listado de recomendaciones filtrado por fecha + detalle (CUU Consultar historial: ver, calificar y borrar). Componentes con props de entrada y de salida (`onCambiar`, `onCalificada`), eventos (submit, change, click), reactividad ante el estado (estrellas, "Guardando...", mensajes), servicio para la API, HTML semántico (`article`, `time`, `dl`, `fieldset`), errores amigables y diseño responsive mobile-first.

**Cómo probarlo:**
1. Levantar el backend y el frontend. Cargar el token de un usuario en `localStorage` (como en el Paso 2) y generar un par de recomendaciones (Paso 8).
2. Sin token, "Mis recomendaciones" muestra "Iniciá sesión para ver tu historial de recomendaciones".
3. Con token, entrar a "Mis recomendaciones": se ven las búsquedas de la más nueva a la más vieja, con fecha y hora, criterios y juegos.
4. Filtrar con "Desde" y "Hasta" (por ejemplo, el día de hoy en los dos): la URL cambia a `?desde=...&hasta=...`. Poner "Desde" posterior a "Hasta": aparece el error. "Limpiar" vuelve a mostrar todo.
5. "Ver detalle y calificar": elegir estrellas (también con las flechas del teclado), escribir un comentario y guardar. Aparece "¡Gracias! Se guardó tu calificación." y la fecha. Al volver al historial, se ven las estrellas en ese juego.
6. Borrar una búsqueda desde el historial o desde el detalle (con confirmación).
7. Desde los resultados de "Recomendame", el link "Ver en mi historial" abre el detalle de esa búsqueda.
8. Ir a `/recomendaciones/9999`: muestra el error de "no se encontró".
9. Revisar en 375px (todo en una columna, filtro apilado), 768px (historial de a dos, filtro en fila) y 1024px (menú horizontal con 7 links, detalle de a dos juegos).
