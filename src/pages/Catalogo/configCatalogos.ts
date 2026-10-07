import { caracteristicaService } from '../../services/caracteristicaService.ts'
import type { ItemCatalogo, ServicioCatalogo } from '../../services/catalogoService.ts'
import { clasificacionEdadService } from '../../services/clasificacionEdadService.ts'
import { generoService } from '../../services/generoService.ts'
import { plataformaService } from '../../services/plataformaService.ts'

// Todo lo que cambia entre un catálogo y otro: rutas, textos y servicio.
export interface ConfigCatalogo {
  /** Ruta de la pantalla de listado, por ejemplo '/admin/generos' */
  rutaBase: string
  /** Título en plural, por ejemplo 'Géneros' */
  titulo: string
  /** Nombre en singular y minúscula, por ejemplo 'género' */
  singular: string
  /** Para concordar los textos: "la plataforma", "Nueva característica" */
  femenino: boolean
  /** Texto corto para la tarjeta de la pantalla de Administración */
  descripcion: string
  servicio: ServicioCatalogo<ItemCatalogo, { nombre: string }, { nombre?: string }>
}

export function textosCatalogo(config: ConfigCatalogo) {
  const articulo = config.femenino ? 'la' : 'el'
  return {
    articulo,
    nuevo: `${config.femenino ? 'Nueva' : 'Nuevo'} ${config.singular}`,
    plural: config.titulo.toLowerCase(),
    cargados: config.femenino ? 'cargadas' : 'cargados',
  }
}

export const catalogos: ConfigCatalogo[] = [
  {
    rutaBase: '/admin/generos',
    titulo: 'Géneros',
    singular: 'género',
    femenino: false,
    descripcion: 'Acción, aventura, estrategia...',
    servicio: generoService,
  },
  {
    rutaBase: '/admin/plataformas',
    titulo: 'Plataformas',
    singular: 'plataforma',
    femenino: true,
    descripcion: 'PC, consolas, celulares...',
    servicio: plataformaService,
  },
  {
    rutaBase: '/admin/caracteristicas',
    titulo: 'Características',
    singular: 'característica',
    femenino: true,
    descripcion: 'Multijugador, mundo abierto, cooperativo...',
    servicio: caracteristicaService,
  },
  {
    rutaBase: '/admin/clasificaciones-edad',
    titulo: 'Clasificaciones de edad',
    singular: 'clasificación de edad',
    femenino: true,
    descripcion: 'ATP, +13, +18...',
    servicio: clasificacionEdadService,
  },
]
