import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
} from '../entities/Appointment'

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>
  findAll(): Promise<Appointment[]>
  create(data: CreateAppointmentData): Promise<Appointment>
  update(id: string, data: Partial<UpdateAppointmentData>): Promise<Appointment>
  delete(id: string): Promise<void>
  findConflictResources(
    resourceIds: string[],
    startTime: string,
    endTime: string,
  ): Promise<{ resourceId: string }[]>
}
