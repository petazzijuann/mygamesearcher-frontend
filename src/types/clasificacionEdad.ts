export interface ClasificacionEdad {
  id: number
  nombre: string
}

export interface CrearClasificacionEdadDto {
  nombre: string
}

export interface ActualizarClasificacionEdadDto {
  nombre?: string
}
