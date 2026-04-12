import { eq } from 'drizzle-orm'
import { ConflictError } from '@/core/errors/ConflictError'
import { resources, serviceResources, services } from '../../../../../db/schema'
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
    resources: [],
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
    const rows = await db
      .select({
        id: services.id,
        name: services.name,
        durationMinutes: services.durationMinutes,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
        resourceId: resources.id,
        resourceName: resources.name,
        resourceType: resources.type,
      })
      .from(services)
      .leftJoin(serviceResources, eq(serviceResources.serviceId, services.id))
      .leftJoin(resources, eq(resources.id, serviceResources.resourceId))

    // Agrupa os recursos por service
    const map = new Map<string, Service>()

    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          name: row.name,
          durationMinutes: row.durationMinutes,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          resources: [],
        })
      }

      if (row.resourceId && row.resourceName && row.resourceType) {
        map.get(row.id)!.resources.push({
          id: row.resourceId,
          name: row.resourceName,
          type: row.resourceType as 'professional' | 'room' | 'equipment',
        })
      }
    }

    return Array.from(map.values())
  }

  async create(data: CreateServiceData): Promise<Service> {
    const { resourceIds, ...serviceData } = data

    return await db.transaction(async (tx) => {
      const [service] = await tx
        .insert(services)
        .values(serviceData)
        .returning()

      await tx.insert(serviceResources).values(
        resourceIds.map((resourceId) => ({
          serviceId: service.id,
          resourceId,
        })),
      )

      return toDomain(service)
    })
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
    try {
      await db.transaction(async (tx) => {
        await tx
          .delete(serviceResources)
          .where(eq(serviceResources.serviceId, id))
        await tx.delete(services).where(eq(services.id, id))
      })
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message?.includes('appointments_service_id_services_id_fk')
      ) {
        throw new ConflictError(
          'Service has appointments and cannot be deleted',
        )
      }
      throw err
    }
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
