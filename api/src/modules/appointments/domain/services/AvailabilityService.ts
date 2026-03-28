import { NotFoundError } from '@/core/errors/NotFoundError'
import type { IServiceRepository } from '@/modules/services/domain/repositories/IServiceRepository'
import type { IAppointmentRepository } from '../repositories/IAppointmentRepository'

export interface AvailableSlot {
  startTime: string
  endTime: string
  available: boolean
}

export class AvailabilityService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(serviceId: string, date: string): Promise<AvailableSlot[]> {
    const service = await this.serviceRepository.findById(serviceId)
    if (!service) throw new NotFoundError('Service not found')

    const resources =
      await this.serviceRepository.findResourcesByServiceId(serviceId)
    if (resources.length === 0)
      throw new NotFoundError('Service has no resources configured')

    const resourceIds = resources.map((r) => r.resourceId)
    const durationMs = service.durationMinutes * 60 * 1000

    const slots: AvailableSlot[] = []

    const [year, month, day] = date.split('-').map(Number)
    const baseDate = new Date(year, month - 1, day)

    const now = new Date()

    for (let hour = 9; hour < 18; hour++) {
      const startTime = new Date(baseDate)
      startTime.setHours(hour, 0, 0, 0)

      const endTime = new Date(startTime.getTime() + durationMs)

      const endLimit = new Date(baseDate)
      endLimit.setHours(18, 0, 0, 0)

      if (endTime > endLimit) break

      // slot no passado
      const isPast = startTime.getTime() < now.getTime()

      // slot com conflito de recursos
      const conflicts = await this.appointmentRepository.findConflictResources(
        resourceIds,
        startTime.toISOString(),
        endTime.toISOString(),
      )

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available: !isPast && conflicts.length === 0,
      })
    }

    return slots
  }
}
