/** Marca un salto entre números de página (se muestra como "…") */
export const SALTO = 'salto'

/**
 * Páginas a mostrar: siempre la primera y la última, y la actual con una vecina de cada lado.
 * Ej.: página 5 de 54 -> [1, salto, 4, 5, 6, salto, 54]
 */
export function calcularPaginas(pagina: number, totalPaginas: number): (number | typeof SALTO)[] {
  const visibles = new Set(
    [1, pagina - 1, pagina, pagina + 1, totalPaginas].filter((n) => n >= 1 && n <= totalPaginas),
  )
  const ordenadas = [...visibles].sort((a, b) => a - b)
  const resultado: (number | typeof SALTO)[] = []
  ordenadas.forEach((numero, indice) => {
    const anterior = ordenadas[indice - 1]
    // Si falta una sola página, se muestra el número en vez de "…"
    if (anterior !== undefined && numero - anterior === 2) resultado.push(anterior + 1)
    else if (anterior !== undefined && numero - anterior > 2) resultado.push(SALTO)
    resultado.push(numero)
  })
  return resultado
}
