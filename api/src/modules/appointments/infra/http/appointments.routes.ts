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
}

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
        response: { 200: { type: 'array', items: appointmentResponseSchema } },
      },
    },
    async (req, reply) => {
      const appointments = await controller.findAll()
      return reply.status(200).send(appointments as never)
    },
  )

  app.get(
    '/appointments/:id',
    {
      schema: {
        summary: 'Get appointment by ID',
        tags: ['Appointments'],
        params: paramsSchema,
        response: { 200: appointmentResponseSchema },
      },
    },
    async (req, reply) => {
      const appointment = await controller.findById(req.params.id)
      return reply.status(200).send(appointment as never)
    },
  )

  app.post(
    '/appointments',
    {
      schema: {
        summary: 'Create an appointment',
        tags: ['Appointments'],
        body: createAppointmentBodySchema,
        response: { 201: appointmentResponseSchema },
      },
    },
    async (req, reply) => {
      const appointment = await controller.create(req.body)
      return reply.status(201).send(appointment as never)
    },
  )

  app.put(
    '/appointments/:id',
    {
      schema: {
        summary: 'Update appointment status',
        tags: ['Appointments'],
        params: paramsSchema,
        body: updateAppointmentBodySchema,
        response: { 200: appointmentResponseSchema },
      },
    },
    async (req, reply) => {
      const appointment = await controller.update(req.params.id, req.body)
      return reply.status(200).send(appointment as never)
    },
  )

  app.delete(
    '/appointments/:id',
    {
      schema: {
        summary: 'Delete appointment',
        tags: ['Appointments'],
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
