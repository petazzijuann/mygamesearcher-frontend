export interface Genero {
  id: number
  nombre: string
}

export interface CrearGeneroDto {
  nombre: string
}

export interface ActualizarGeneroDto {
  nombre?: string
}
