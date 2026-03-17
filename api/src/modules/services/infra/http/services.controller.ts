import { NotFoundError } from '@/core/errors/NotFoundError'
import type { IServiceRepository } from '../../domain/repositories/IServiceRepository'
import type { CreateServiceBody } from '../../dtos/create-service.dto'
import type { UpdateServiceBody } from '../../dtos/update-service.dto'

export class ServiceController {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async findAll() {
    return await this.serviceRepository.findAll()
  }

  async findById(id: string) {
    const service = await this.serviceRepository.findById(id)
    if (!service) throw new NotFoundError('Service not found')
    return service
  }

  async create(data: CreateServiceBody) {
    return await this.serviceRepository.create(data)
  }

  async update(id: string, data: UpdateServiceBody) {
    const service = await this.serviceRepository.findById(id)
    if (!service) throw new NotFoundError('Service not found')
    return await this.serviceRepository.update(id, data)
  }

  async delete(id: string) {
    const service = await this.serviceRepository.findById(id)
    if (!service) throw new NotFoundError('Service not found')
    await this.serviceRepository.delete(id)
  }
}
