import { eq, sql } from 'drizzle-orm'
import { appointments } from '../../../../../db/schema'
import { db } from '../../../../infra/database/db'
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
} from '../../domain/entities/Appointment'
import type { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'

function toDomain(raw: typeof appointments.$inferSelect): Appointment {
  return {
    id: raw.id,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    userId: raw.userId,
    serviceId: raw.serviceId,
    startTime: raw.startTime,
    endTime: raw.endTime,
    status: raw.status as Appointment['status'],
  }
}

export class DrizzleAppointmentRepository implements IAppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))

    return result[0] ? toDomain(result[0]) : null
  }

  async findAll(): Promise<Appointment[]> {
    const result = await db.select().from(appointments)
    return result.map(toDomain)
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const result = await db.insert(appointments).values(data).returning()
    return toDomain(result[0])
  }

  async update(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const result = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(appointments.id, id))
      .returning()

    return toDomain(result[0])
  }

  async delete(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id))
  }

  async findConflictResources(
    resourceIds: string[],
    startTime: string,
    endTime: string,
  ): Promise<{ resourceId: string }[]> {
    return await db.transaction(async (tx) => {
      const result = await tx.execute(sql`
        SELECT ar.resource_id as "resourceId"
        FROM appointment_resources ar
        INNER JOIN appointments a ON a.id = ar.appointment_id
        WHERE ar.resource_id = ANY(ARRAY[${sql.join(
          resourceIds.map((id) => sql`${id}::uuid`),
          sql`, `,
        )}])
        AND a.status != 'cancelled'
        AND (a.start_time, a.end_time) OVERLAPS (
          ${startTime}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo',
          ${endTime}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'
        )
        FOR UPDATE
      `)

      return result.rows as { resourceId: string }[]
    })
  }
}
