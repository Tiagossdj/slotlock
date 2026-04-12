export interface Service {
  id: string
  name: string
  durationMinutes: number
  resources: ServiceResource[]
  createdAt: string
  updatedAt: string
}

export interface ServiceResource {
  id: string
  name: string
  type: 'professional' | 'room' | 'equipment'
}

export interface CreateServiceData {
  name: string
  durationMinutes: number
  resourceIds: string[]
}

export type UpdateServiceData = Partial<
  Omit<CreateServiceData, 'resourceIds'> & { resourceIds?: string[] }
>
