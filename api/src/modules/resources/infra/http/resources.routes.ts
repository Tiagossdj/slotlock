import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import type { AppInstance } from '@/@types/fastify'
import { createResourceBodySchema } from '../../dtos/create-resource.dto'
import { updateResourceBodySchema } from '../../dtos/update-resource.dto'
import { DrizzleResourceRepository } from '../drizzle/DrizzleResourceRepository'
import { ResourceController } from './resources.controller'

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const

const resourceResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string', enum: ['professional', 'room', 'equipment'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
}

export async function resourcesRoutes(app: AppInstance) {
  const repository = new DrizzleResourceRepository()
  const controller = new ResourceController(repository)

  app.get(
    '/resources',
    {
      schema: {
        summary: 'List all resources',
        tags: ['Resources'],
        security: [{ bearerAuth: [] }],
        response: { 200: { type: 'array', items: resourceResponseSchema } },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const resources = await controller.findAll()
      return reply.status(200).send(resources)
    },
  )

  app.get(
    '/resources/:id',
    {
      schema: {
        summary: 'Get resource by ID',
        tags: ['Resources'],
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        response: { 200: resourceResponseSchema },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const resources = await controller.findById(req.params.id)
      return reply.status(200).send(resources)
    },
  ),
    app.post(
      '/resources',
      {
        schema: {
          summary: 'Create a resource',
          tags: ['Resources'],
          security: [{ bearerAuth: [] }],
          body: createResourceBodySchema,
          response: { 201: resourceResponseSchema },
        },
        onRequest: [async (req, reply) => await app.requireAdmin(req, reply)],
      },
      async (req, reply) => {
        const resource = await controller.create(req.body)
        return reply.status(201).send(resource)
      },
    )

  app.put(
    '/resources/:id',
    {
      schema: {
        summary: 'Update a resource',
        tags: ['Resources'],
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        body: updateResourceBodySchema,
        response: { 200: resourceResponseSchema },
      },
      onRequest: [async (req, reply) => await app.requireAdmin(req, reply)],
    },
    async (req, reply) => {
      const resource = await controller.update(req.params.id, req.body)
      return reply.status(200).send(resource)
    },
  )

  app.delete(
    '/resources/:id',
    {
      schema: {
        summary: 'Delete a resource',
        tags: ['Resources'],
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        response: { 204: { type: 'null' } },
      },
      onRequest: [async (req, reply) => await app.requireAdmin(req, reply)],
    },
    async (req, reply) => {
      await controller.delete(req.params.id)
      return reply.status(204).send(null)
    },
  )
}
