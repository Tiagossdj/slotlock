import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../../infra/database/db";
import { appointments, appointmentResources } from "../../../../../db/schema";
import type {
  IAppointmentRepository,
  Appointment,
  NewAppointment,
} from "../../domain/repositories/IAppointmentRepository";

export class DrizzleAppointmentRepository implements IAppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));

    return result[0] ?? null;
  }

  async findAll(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async create(data: NewAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(data).returning();

    return result[0];
  }

  async update(
    id: string,
    data: Partial<NewAppointment>,
  ): Promise<Appointment> {
    const result = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(appointments.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async findConflictResources(
    resourceIds: string,
    startTime: string,
    endTime: string,
  ): Promise<{ resourceId: string }[]> {
    return await db.transaction(async (tx) => {
      const result = await tx.execute(sql`
            SELECT ar.resource_id as "resourceId"
            FROM appointment_resources ar
            INNER JOIN appointments a ON a.id = ar.appointment_id
            WHERE ar.resource_id = ANY(${resourceIds})
            AND a.status != 'cancelled'
            AND (a.start_time, a.end_time) OVERLAPS (
                ${startTime}::timestamp,
                ${endTime}::timestamp
            )
            FOR UPDATE
            `);

      return result.rows as { resourceId: string }[];
    });
  }
}
