import type { AppInstance } from '@/@types/fastify'
import { DrizzleServiceRepository } from '../../../services/infra/drizzle/DrizzleServiceRepository'
import { createAppointmentBodySchema } from '../../dtos/create-appointment.dto'
import { updateAppointmentBodySchema } from '../../dtos/update-appointment.dto'
import { DrizzleAppointmentRepository } from '../drizzle/DrizzleAppointmentRepository'
import { AppointmentController } from './appointments.controller'

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const

const errorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
}

const appointmentResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    serviceId: { type: 'string' },
    startTime: { type: 'string' },
    endTime: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
} as const

const availabilityQuerySchema = {
  type: 'object',
  required: ['serviceId', 'date'],
  properties: {
    serviceId: { type: 'string' },
    date: { type: 'string', format: 'date' },
  },
  additionalProperties: false,
} as const

export async function appointmentsRoutes(app: AppInstance) {
  const appointmentRepository = new DrizzleAppointmentRepository()
  const serviceRepository = new DrizzleServiceRepository()
  const controller = new AppointmentController(
    appointmentRepository,
    serviceRepository,
  )

  app.get(
    '/appointments',
    {
      schema: {
        summary: 'List all appointments',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        response: { 200: { type: 'array', items: appointmentResponseSchema } },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const { sub: userId, role } = req.user
      const filterUserId = role === 'admin' ? undefined : userId
      const appointments = await controller.findAll(filterUserId)
      return reply.status(200).send(appointments as never)
    },
  )

  app.get(
    '/availability',
    {
      schema: {
        summary: 'Get available slots for a service on a date',
        tags: ['Appointments'],
        querystring: availabilityQuerySchema,
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                available: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { serviceId, date } = req.query
      const slots = await controller.getAvailability(serviceId, date)
      return reply.status(200).send(slots as never)
    },
  )

  app.get(
    '/appointments/:id',
    {
      schema: {
        summary: 'Get appointment by ID',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        response: {
          200: appointmentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const appointment = await controller.findById(req.params.id)

      if (!appointment) return reply.status(404).send({ message: 'Not found' })

      const isOwner = appointment.userId === req.user.sub
      const isAdmin = req.user.role === 'admin'

      if (!isOwner && !isAdmin) {
        return reply.status(403).send({ message: 'Forbidden' })
      }

      return reply.status(200).send(appointment as never)
    },
  )

  app.post(
    '/appointments',
    {
      schema: {
        summary: 'Create an appointment',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        body: createAppointmentBodySchema,
        response: { 201: appointmentResponseSchema },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const data = { ...req.body, userId: req.user.sub }
      const appointment = await controller.create(data)
      return reply.status(201).send(appointment as never)
    },
  )

  app.put(
    '/appointments/:id',
    {
      schema: {
        summary: 'Update appointment status',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        body: updateAppointmentBodySchema,
        response: {
          200: appointmentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const appointment = await controller.findById(req.params.id)
      if (!appointment) return reply.status(404).send({ message: 'Not found' })

      const isOwner = appointment.userId === req.user.sub
      const isAdmin = req.user.role === 'admin'

      if (!isOwner && !isAdmin) {
        return reply.status(403).send({ message: 'Forbidden' })
      }

      const updated = await controller.update(req.params.id, req.body)
      return reply.status(200).send(updated as never)
    },
  )

  app.delete(
    '/appointments/:id',
    {
      schema: {
        summary: 'Delete appointment',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        response: {
          204: { type: 'null', description: 'No Content' },
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const appointment = await controller.findById(req.params.id)
      if (!appointment) return reply.status(404).send({ message: 'Not found' })

      const isOwner = appointment.userId === req.user.sub
      const isAdmin = req.user.role === 'admin'

      if (!isOwner && !isAdmin) {
        return reply.status(403).send({ message: 'Forbidden' })
      }

      await controller.delete(req.params.id)
      return reply.status(204).send(null)
    },
  )
}
