const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function aFecha(iso: string): Date | null {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

// Convierte una fecha ISO de la API (por ejemplo "2026-10-07T14:30:00.000Z")
// en un texto como "7 de octubre de 2026".
export function formatearFecha(iso: string): string {
  const fecha = aFecha(iso)
  return fecha ? formatoFecha.format(fecha) : 'Fecha desconocida'
}

// Igual que formatearFecha, pero con la hora: "7 de octubre de 2026, 11:30".
export function formatearFechaHora(iso: string): string {
  const fecha = aFecha(iso)
  return fecha ? formatoFechaHora.format(fecha) : 'Fecha desconocida'
}

// Valida el formato AAAA-MM-DD que usan los filtros por fecha de la API.
export function esFechaAAAAMMDD(valor: string | null): valor is string {
  return valor !== null && /^\d{4}-\d{2}-\d{2}$/.test(valor) && aFecha(valor) !== null
}
