import type { AppInstance } from '@/@types/fastify'
import { createServiceBodySchema } from '../../dtos/create-service.dto'
import { updateServiceBodySchema } from '../../dtos/update-service.dto'
import { DrizzleServiceRepository } from '../drizzle/DrizzleServiceRepository'
import { ServiceController } from './services.controller'

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const

const serviceResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    durationMinutes: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
}

export async function servicesRoutes(app: AppInstance) {
  const repository = new DrizzleServiceRepository()
  const controller = new ServiceController(repository)

  app.get(
    '/services',
    {
      schema: {
        summary: 'List all services',
        tags: ['Services'],
        response: { 200: { type: 'array', items: serviceResponseSchema } },
      },
    },
    async (req, reply) => {
      const services = await controller.findAll()
      return reply.status(200).send(services as never)
    },
  )

  app.get(
    '/services/:id',
    {
      schema: {
        summary: 'Get service by ID',
        tags: ['Services'],
        params: paramsSchema,
        response: { 200: serviceResponseSchema },
      },
    },
    async (req, reply) => {
      const service = await controller.findById(req.params.id)
      return reply.status(200).send(service as never)
    },
  )

  app.post(
    '/services',
    {
      schema: {
        summary: 'Create a service',
        tags: ['Services'],
        body: createServiceBodySchema,
        response: { 201: serviceResponseSchema },
      },
    },
    async (req, reply) => {
      const service = await controller.create(req.body)
      return reply.status(201).send(service as never)
    },
  )

  app.put(
    '/services/:id',
    {
      schema: {
        summary: 'Update a service',
        tags: ['Services'],
        params: paramsSchema,
        body: updateServiceBodySchema,
        response: { 200: serviceResponseSchema },
      },
    },
    async (req, reply) => {
      const service = await controller.update(req.params.id, req.body)
      return reply.status(200).send(service as never)
    },
  )

  app.delete(
    '/services/:id',
    {
      schema: {
        summary: 'Delete a service',
        tags: ['Services'],
        params: paramsSchema,
        response: { 204: { type: 'null' } },
      },
    },
    async (req, reply) => {
      await controller.delete(req.params.id)
      return reply.status(204).send(null)
    },
  )
}
