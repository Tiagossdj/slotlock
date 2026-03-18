import type { FromSchema } from 'json-schema-to-ts'

export const updateAppointmentBodySchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'cancelled'],
    },
  },
  additionalProperties: false,
} as const

export type UpdateAppointmentBody = FromSchema<
  typeof updateAppointmentBodySchema
>
