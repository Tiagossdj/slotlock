import type {
  CreateResourceData,
  Resource,
  UpdateResourceData,
} from '../entities/Resource'

export interface IResourceRepository {
  findById(id: string): Promise<Resource | null>
  findAll(): Promise<Resource[]>
  findByIds(ids: string[]): Promise<Resource[]>
  create(data: CreateResourceData): Promise<Resource>
  update(id: string, data: Partial<UpdateResourceData>): Promise<Resource>
  delete(id: string): Promise<void>
}
