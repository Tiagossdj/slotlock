import type { AppInstance } from '@/@types/fastify'
import { DrizzleUserRepository } from '../../../users/infra/drizzle/DrizzleUserRepository'
import { AuthService } from '../../domain/services/AuthService'
import { AuthController } from './auth.controller'

const registerBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    role: { type: 'string', enum: ['client', 'admin'] },
  },
} as const

const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
} as const

const authResponseSchema = {
  200: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          role: { type: 'string' },
        },
      },
    },
  },
}

export async function authRoutes(app: AppInstance) {
  const userRepository = new DrizzleUserRepository()
  const authService = new AuthService()
  const authController = new AuthController(userRepository, authService, app)

  app.post(
    '/auth/register',
    {
      schema: {
        body: registerBodySchema,
        response: authResponseSchema,
        tags: ['auth'],
      },
    },
    async (req, reply) => {
      const result = await authController.register(req.body)
      return reply.send(result)
    },
  )

  app.post(
    '/auth/login',
    {
      schema: {
        body: loginBodySchema,
        response: authResponseSchema,
        tags: ['auth'],
      },
    },
    async (req, reply) => {
      const result = await authController.login(req.body)
      return reply.send(result)
    },
  )

  app.get(
    '/auth/me',
    {
      schema: {
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: authResponseSchema[200].properties.user,
        },
      },

      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const userId = req.user.sub
      const user = await authController.me(userId)
      return reply.send(user)
    },
  )
}
