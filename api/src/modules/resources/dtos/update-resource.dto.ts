import type { FromSchema } from 'json-schema-to-ts'

export const updateResourceBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    type: {
      type: 'string',
      enum: ['professional', 'room', 'equipment'],
    },
  },
  additionalProperties: false,
} as const

export type UpdateResourceBody = FromSchema<typeof updateResourceBodySchema>
