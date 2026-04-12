import fastifyCookie from '@fastify/cookie'
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
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
      schema: {
        body: registerBodySchema,
        response: authResponseSchema,
        tags: ['auth'],
      },
    },
    async (req, reply) => {
      const { token, user } = await authController.register(req.body)

      reply.setCookie('slotlock_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
        path: '/',
      })

      return reply.send({ user })
    },
  )

  app.post(
    '/auth/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
      schema: {
        body: loginBodySchema,
        response: authResponseSchema,
        tags: ['auth'],
      },
    },
    async (req, reply) => {
      const { token, user } = await authController.login(req.body)

      reply.setCookie('slotlock_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return reply.send({ user })
    },
  )

  app.post(
    '/auth/logout',
    { schema: { tags: ['auth'] } },
    async (req, reply) => {
      reply.clearCookie('slotlock_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      return reply.send({ ok: true })
    },
  )

  app.get(
    '/auth/me',
    {
      schema: { tags: ['auth'] },
      onRequest: [async (req, reply) => await app.authenticate(req, reply)],
    },
    async (req, reply) => {
      const userId = req.user.sub
      const user = await authController.me(userId)
      return reply.send(user)
    },
  )
}
