export interface Resource {
  id: string
  name: string
  type: 'professional' | 'room' | 'equipment'
  createdAt: string
  updatedAt: string
}

export type CreateResourceData = Omit<
  Resource,
  'id' | 'createdAt' | 'updatedAt'
>
export type UpdateResourceData = Partial<CreateResourceData>
