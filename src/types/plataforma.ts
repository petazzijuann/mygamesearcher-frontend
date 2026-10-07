export interface Plataforma {
  id: number
  nombre: string
}

export interface CrearPlataformaDto {
  nombre: string
}

export interface ActualizarPlataformaDto {
  nombre?: string
}
