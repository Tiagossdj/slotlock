import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { services } from '../../../../../db/schema'

export type Service = InferSelectModel<typeof services>
export type NewService = InferInsertModel<typeof services>

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>
  findAll(): Promise<Service[]>
  findByIds(ids: string[]): Promise<Service[]>
  create(data: NewService): Promise<Service>
  update(id: string, data: Partial<NewService>): Promise<Service>
  delete(id: string): Promise<void>
  findResourcesByServiceId(serviceId: string): Promise<{ resourceId: string }[]>
}
