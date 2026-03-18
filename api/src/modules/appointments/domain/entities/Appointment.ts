export interface Appointment {
  id: string
  userId: string
  serviceId: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export type CreateAppointmentData = Omit<
  Appointment,
  'id' | 'createdAt' | 'updatedAt'
>
export type UpdateAppointmentData = Partial<Pick<Appointment, 'status'>>
