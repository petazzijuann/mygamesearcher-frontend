export interface Caracteristica {
  id: number
  nombre: string
}

export interface CrearCaracteristicaDto {
  nombre: string
}

export interface ActualizarCaracteristicaDto {
  nombre?: string
}
