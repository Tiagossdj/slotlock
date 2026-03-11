import type { appointments } from "../../../../../db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Appointment = InferSelectModel<typeof appointments>;
export type NewAppointment = InferInsertModel<typeof appointments>;

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findAll(): Promise<Appointment[]>;
  create(data: NewAppointment): Promise<Appointment>;
  update(id: string, data: Partial<NewAppointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;
  findConflictResources(
    resourceIds: string,
    startTime: string,
    endTime: string,
  ): Promise<{ resourceId: string }[]>;
}
