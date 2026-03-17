export interface Service {
  id: string
  name: string
  durationMinutes: number
  createdAt: string
  updatedAt: string
}

export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateServiceData = Partial<CreateServiceData>
