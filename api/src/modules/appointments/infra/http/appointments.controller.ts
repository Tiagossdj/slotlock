import { NotFoundError } from '@/core/errors/NotFoundError'
import type { IServiceRepository } from '../../../services/domain/repositories/IServiceRepository'
import type { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { AppointmentService } from '../../domain/services/AppointmentService'
import type { CreateAppointmentBody } from '../../dtos/create-appointment.dto'
import type { UpdateAppointmentBody } from '../../dtos/update-appointment.dto'

export class AppointmentController {
  private readonly appointmentService: AppointmentService

  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    serviceRepository: IServiceRepository,
  ) {
    this.appointmentService = new AppointmentService(
      appointmentRepository,
      serviceRepository,
    )
  }

  async findAll() {
    return await this.appointmentRepository.findAll()
  }

  async findById(id: string) {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) throw new NotFoundError('Appointment not found')
    return appointment
  }

  async create(data: CreateAppointmentBody) {
    return await this.appointmentService.execute(data)
  }

  async update(id: string, data: UpdateAppointmentBody) {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) throw new NotFoundError('Appointment not found')
    return await this.appointmentRepository.update(id, data)
  }

  async delete(id: string) {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) throw new NotFoundError('Appointment not found')
    await this.appointmentRepository.delete(id)
  }
}
