import type { FromSchema } from 'json-schema-to-ts'
export const createServiceBodySchema = {
  type: 'object',
  required: ['name', 'durationMinutes'],
  properties: {
    name: { type: 'string' },
    durationMinutes: { type: 'number' },
  },
  additionalProperties: false,
} as const

export type CreateServiceBody = FromSchema<typeof createServiceBodySchema>
