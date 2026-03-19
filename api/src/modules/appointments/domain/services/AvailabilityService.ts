import { NotFoundError } from '@/core/errors/NotFoundError'
import type { IServiceRepository } from '@/modules/services/domain/repositories/IServiceRepository'
import type { IAppointmentRepository } from '../repositories/IAppointmentRepository'

export interface AvailableSlot {
  startTime: string
  endTime: string
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

    // gera slots de hora em hora das 09 às 18
    const slots: AvailableSlot[] = []
    const baseDate = new Date(date)

    for (let hour = 9; hour < 18; hour++) {
      const startTime = new Date(baseDate)
      startTime.setUTCHours(hour, 0, 0, 0)

      const endTime = new Date(startTime.getTime() + durationMs)

      // não gera slot se o endTime ultrapassar 18:00
      const endLimit = new Date(baseDate)
      endLimit.setUTCHours(18, 0, 0, 0)

      if (endTime > endLimit) break

      const conflicts = await this.appointmentRepository.findConflictResources(
        resourceIds,
        startTime.toISOString(),
        endTime.toISOString(),
      )

      if (conflicts.length === 0) {
        slots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
      }
    }

    return slots
  }
}
