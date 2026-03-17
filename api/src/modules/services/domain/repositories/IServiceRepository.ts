import type {
  CreateServiceData,
  Service,
  UpdateServiceData,
} from '../entities/Service'

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>
  findAll(): Promise<Service[]>
  create(data: CreateServiceData): Promise<Service>
  update(id: string, data: UpdateServiceData): Promise<Service>
  delete(id: string): Promise<void>
  findResourcesByServiceId(serviceId: string): Promise<{ resourceId: string }[]>
}
