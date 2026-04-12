import type { FromSchema } from 'json-schema-to-ts'
export const createServiceBodySchema = {
  type: 'object',
  required: ['name', 'durationMinutes', 'resourceIds'],
  properties: {
    name: { type: 'string' },
    durationMinutes: { type: 'number' },
    resourceIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      minItems: 1,
    },
  },
  additionalProperties: false,
} as const

export type CreateServiceBody = FromSchema<typeof createServiceBodySchema>
