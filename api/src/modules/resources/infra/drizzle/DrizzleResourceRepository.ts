import { eq, inArray } from 'drizzle-orm'
import { ConflictError } from '@/core/errors/ConflictError'
import { resources, serviceResources } from '../../../../../db/schema'
import { db } from '../../../../infra/database/db'
import type {
  CreateResourceData,
  Resource,
  UpdateResourceData,
} from '../../domain/entities/Resource'
import type { IResourceRepository } from '../../domain/repositories/IResourceRepository'

function toDomain(raw: typeof resources.$inferSelect): Resource {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type as Resource['type'],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export class DrizzleResourceRepository implements IResourceRepository {
  async findById(id: string): Promise<Resource | null> {
    const result = await db.select().from(resources).where(eq(resources.id, id))

    return result[0] ? toDomain(result[0]) : null
  }

  async findAll(): Promise<Resource[]> {
    const result = await db.select().from(resources)
    return result.map(toDomain)
  }

  async findByIds(ids: string[]): Promise<Resource[]> {
    const result = await db
      .select()
      .from(resources)
      .where(inArray(resources.id, ids))
    return result.map(toDomain)
  }

  async create(data: CreateResourceData): Promise<Resource> {
    const result = await db.insert(resources).values(data).returning()

    return toDomain(result[0])
  }

  async update(id: string, data: UpdateResourceData): Promise<Resource> {
    const result = await db
      .update(resources)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(resources.id, id))
      .returning()

    return toDomain(result[0])
  }

  async delete(id: string): Promise<void> {
    const links = await db
      .select()
      .from(serviceResources)
      .where(eq(serviceResources.resourceId, id))

    if (links.length > 0) {
      throw new ConflictError(
        'Cannot delete resource — it is linked to one or more services',
      )
    }

    await db.delete(resources).where(eq(resources.id, id))
  }
}
