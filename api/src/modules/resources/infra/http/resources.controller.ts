import { NotFoundError } from '@/core/errors/NotFoundError'
import type { IResourceRepository } from '../../domain/repositories/IResourceRepository'
import type { CreateResourceBody } from '../../dtos/create-resource.dto'
import type { UpdateResourceBody } from '../../dtos/update-resource.dto'

export class ResourceController {
  constructor(private readonly resourceRepository: IResourceRepository) {}

  async findAll() {
    return await this.resourceRepository.findAll()
  }

  async findById(id: string) {
    const resource = await this.resourceRepository.findById(id)
    if (!resource) throw new NotFoundError('Resource not found')
    return resource
  }

  async create(data: CreateResourceBody) {
    return await this.resourceRepository.create(data)
  }

  async update(id: string, data: UpdateResourceBody) {
    const resource = await this.resourceRepository.findById(id)
    if (!resource) throw new NotFoundError('Resource not found')
    return await this.resourceRepository.update(id, data)
  }

  async delete(id: string) {
    const resource = await this.resourceRepository.findById(id)
    if (!resource) throw new NotFoundError('Resource not found')
    await this.resourceRepository.delete(id)
  }
}
