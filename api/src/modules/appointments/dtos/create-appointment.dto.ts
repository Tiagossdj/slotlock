import type { FromSchema } from 'json-schema-to-ts'

export const createAppointmentBodySchema = {
  type: 'object',
  required: ['userId', 'serviceId', 'startTime'],
  properties: {
    userId: { type: 'string' },
    serviceId: { type: 'string' },
    startTime: { type: 'string', format: 'date-time' },
  },
  additionalProperties: false,
} as const

export type CreateAppointmentBody = FromSchema<
  typeof createAppointmentBodySchema
>
