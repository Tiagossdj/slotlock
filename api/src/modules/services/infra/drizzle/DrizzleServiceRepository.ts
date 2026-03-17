import { eq } from 'drizzle-orm'
import { serviceResources, services } from '../../../../../db/schema'
import { db } from '../../../../infra/database/db'
import type {
  CreateServiceData,
  Service,
  UpdateServiceData,
} from '../../domain/entities/Service'
import type { IServiceRepository } from '../../domain/repositories/IServiceRepository'

function toDomain(raw: typeof services.$inferSelect): Service {
  return {
    id: raw.id,
    name: raw.name,
    durationMinutes: raw.durationMinutes,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export class DrizzleServiceRepository implements IServiceRepository {
  async findById(id: string): Promise<Service | null> {
    const result = await db.select().from(services).where(eq(services.id, id))
    return result[0] ? toDomain(result[0]) : null
  }

  async findAll(): Promise<Service[]> {
    const result = await db.select().from(services)
    return result.map(toDomain)
  }

  async create(data: CreateServiceData): Promise<Service> {
    const result = await db.insert(services).values(data).returning()
    return toDomain(result[0])
  }

  async update(id: string, data: UpdateServiceData): Promise<Service> {
    const result = await db
      .update(services)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(services.id, id))
      .returning()
    return toDomain(result[0])
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
