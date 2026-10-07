const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// Convierte una fecha ISO de la API (por ejemplo "2026-10-07T14:30:00.000Z")
// en un texto como "7 de octubre de 2026".
export function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? 'Fecha desconocida' : formatoFecha.format(fecha)
}
