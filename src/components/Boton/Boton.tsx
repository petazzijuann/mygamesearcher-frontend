import type { ButtonHTMLAttributes } from 'react'

export type VarianteBoton =
  | 'primario'
  | 'secundario'
  | 'peligro'
  | 'peligroSolido'
  | 'enlace'
  | 'fantasma'
  | 'sobreOscuro'
export type TamanioBoton = 'chico' | 'normal' | 'grande' | 'icono'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primario: acción principal · secundario: alternativa (Cancelar, Limpiar) ·
   * peligro: acciones que borran · peligroSolido: confirmar un borrado ·
   * enlace: se ve como un link (Volver) · fantasma: sin colores propios, los pone className ·
   * sobreOscuro: sobre el encabezado índigo (menú, cerrar sesión)
   */
  variante?: VarianteBoton
  /** chico: dentro de tarjetas y tablas · icono: botones de un solo símbolo (✕, ☰) */
  tamanio?: TamanioBoton
  /** Mientras es true, el botón se deshabilita y muestra textoCargando con un indicador */
  cargando?: boolean
  textoCargando?: string
}

// Todas las variantes con borde llevan "border" para que tengan la misma altura
// (por ejemplo, dos botones de alternar, uno primario y otro secundario, uno al lado del otro).
// El color del anillo de foco va en cada variante: sobre fondo oscuro tiene que ser blanco.
const FOCO_CLARO = 'focus-visible:ring-indigo-500 focus-visible:ring-offset-white'
const ESTILOS_VARIANTE: Record<VarianteBoton, string> = {
  primario: `border border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-600 ${FOCO_CLARO}`,
  secundario: `border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 ${FOCO_CLARO}`,
  peligro: `border border-red-300 bg-white text-red-700 hover:bg-red-50 ${FOCO_CLARO}`,
  peligroSolido: `border border-red-600 bg-red-600 text-white hover:bg-red-500 ${FOCO_CLARO}`,
  enlace: `text-sm font-medium text-indigo-700 hover:underline ${FOCO_CLARO}`,
  fantasma: FOCO_CLARO,
  sobreOscuro:
    'text-white hover:bg-indigo-600 focus-visible:ring-white focus-visible:ring-offset-indigo-700',
}

const ESTILOS_TAMANIO: Record<TamanioBoton, string> = {
  chico: 'px-3 py-1.5 text-sm font-medium',
  normal: 'px-4 py-2 font-medium',
  grande: 'px-6 py-3 text-lg font-semibold',
  icono: 'px-2 py-1',
}

// Botón base de la app: encapsula los estilos de cada variante y el estado "cargando".
// Acepta todas las props de un <button> (onClick, disabled, aria-*, ...); className suma
// clases de ubicación (por ejemplo "sm:self-end" o "flex-1") a las del botón.
export function Boton({
  variante = 'primario',
  tamanio = 'normal',
  cargando = false,
  textoCargando,
  // Por defecto "button": un <button> sin type dentro de un form lo envía sin querer
  type = 'button',
  disabled,
  className = '',
  children,
  ...resto
}: BotonProps) {
  // El enlace no lleva relleno: se tiene que ver como un link
  const tamanioClases = variante === 'enlace' ? '' : ESTILOS_TAMANIO[tamanio]
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS_VARIANTE[variante]} ${tamanioClases} ${className}`}
      {...resto}
    >
      {cargando && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {cargando && textoCargando ? textoCargando : children}
    </button>
  )
}
