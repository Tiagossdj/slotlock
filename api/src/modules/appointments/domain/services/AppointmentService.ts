import { AppError } from '@/core/errors/AppError'
import { ConflictError } from '@/core/errors/ConflictError'
import { NotFoundError } from '@/core/errors/NotFoundError'
import type { IAppointmentRepository } from '@/modules/appointments/domain/repositories/IAppointmentRepository'
import type { IServiceRepository } from '@/modules/services/domain/repositories/IServiceRepository'

interface CreateAppointmentInput {
  userId: string
  serviceId: string
  startTime: string
}

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: CreateAppointmentInput) {
    // 1 - busca o serviço
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service) {
      throw new NotFoundError('Service not Found')
    }

    // 2 - calcula o endtime baseado na duração do serviço
    const startDate = new Date(input.startTime)
    const endDate = new Date(
      startDate.getTime() + service.durationMinutes * 60000,
    )
    const endTime = endDate.toISOString()

    // 3 - busca os recursos que o serviço exige
    const serviceResourcesList =
      await this.serviceRepository.findResourcesByServiceId(input.serviceId)
    const resourcesIds = serviceResourcesList.map((r) => r.resourceId)

    if (resourcesIds.length === 0) {
      throw new AppError('service has no resources configured', 400)
    }

    // 4 - checa conflitos (se algum está ocupado no intervalo)
    const conflicting = await this.appointmentRepository.findConflictResources(
      resourcesIds,
      input.startTime,
      endTime,
    )

    // 5 - se houver conflito, lança o erro
    if (conflicting.length > 0) {
      throw new ConflictError(
        'One or more resources are unavailable for this time slot',
      )
    }

    // 6 - cria o agendamento
    return await this.appointmentRepository.create({
      userId: input.userId,
      serviceId: input.serviceId,
      startTime: input.startTime,
      endTime: endTime,
      status: 'pending',
    })
  }
}
