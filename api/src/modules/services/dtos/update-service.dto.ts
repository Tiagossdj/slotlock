import type { FromSchema } from 'json-schema-to-ts'
export const updateServiceBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    durationMinutes: { type: 'number' },
  },
  additionalProperties: false,
} as const

export type UpdateServiceBody = FromSchema<typeof updateServiceBodySchema>
