import type { FromSchema } from 'json-schema-to-ts'

export const createResourceBodySchema = {
  type: 'object',
  required: ['name', 'type'],
  properties: {
    name: { type: 'string' },
    type: {
      type: 'string',
      enum: ['professional', 'room', 'equipment'],
    },
  },
  additionalProperties: false,
} as const

export type CreateResourceBody = FromSchema<typeof createResourceBodySchema>
