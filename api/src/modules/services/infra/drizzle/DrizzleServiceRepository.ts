import { eq, inArray } from 'drizzle-orm'
import { serviceResources, services } from '../../../../../db/schema'
import { db } from '../../../../infra/database/db'
import type {
  IServiceRepository,
  NewService,
  Service,
} from '../../domain/repositories/IServiceRepository'

export class DrizzleServiceRepository implements IServiceRepository {
  async findById(id: string): Promise<Service | null> {
    const result = await db.select().from(services).where(eq(services.id, id))

    return result[0] ?? null
  }

  async findAll(): Promise<Service[]> {
    return await db.select().from(services)
  }

  async findByIds(ids: string[]): Promise<Service[]> {
    return await db.select().from(services).where(inArray(services.id, ids))
  }

  async create(data: NewService): Promise<Service> {
    const result = await db.insert(services).values(data).returning()

    return result[0]
  }

  async update(id: string, data: Partial<NewService>): Promise<Service> {
    const result = await db
      .update(services)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(services.id, id))
      .returning()

    return result[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id))
  }

  async findResourcesByServiceId(
    serviceId: string,
  ): Promise<{ resourceId: string }[]> {
    const result = await db
      .select({ resourceId: serviceResources.resourceId })
      .from(serviceResources)
      .where(eq(serviceResources.serviceId, serviceId))

    return result
  }
}
