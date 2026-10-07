# Documentación - MyGameSearcher Frontend

La instalación y el uso están en el [README principal](../README.md).

## Contenido

- [Bitácora](./bitacora.md): registro de cada paso del desarrollo (qué se hizo, cómo, por qué, qué requisito del TP cubre y cómo probarlo).
- [openapi.json](./api/openapi.json): especificación de la API del backend. Es la referencia para las rutas y los tipos de datos (`src/types/`).

## Requisitos de la cátedra y dónde se cumplen

| Requisito | Dónde |
|---|---|
| CSS mobile-first con breakpoints SM, MD y LG | Tailwind en todas las pantallas (por ejemplo, las grillas de 1, 2, 3 y 4 columnas) |
| HTML5 semántico | `header`, `nav`, `main`, `footer`, `article`, `section`, `time`, `dl`, `fieldset`, `search` |
| Errores manejados de forma amigable | `obtenerMensajeError` en `src/services/api.ts`, componentes `MensajeError` y `Cargando`, página 404 y pantalla de error inesperado |
| Componentes con eventos, estado y props de entrada y salida | Por ejemplo, `MenuNavegacion` (`onNavegar`), `Buscador` (`onBuscar`), `SelectorMultiple` (`onCambiar`), `BotonesBiblioteca` (`onCambio`), `FormularioCalificacion` (`onCalificada`) |
| Al menos un servicio para la API | `src/services/` (un servicio por recurso, con una instancia común de axios) |
| Datos de la API tipados, sin `any` | `src/types/` |

## Cómo probar las pantallas con sesión

Desde "Ingresar" en el encabezado: con una cuenta creada en "Crear cuenta" (rol USUARIO) o con el administrador que crea el backend al arrancar (`ADMIN_EMAIL` y `ADMIN_CONTRASENA` de su `.env`).
