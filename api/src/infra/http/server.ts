import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'
import { env } from '@/config/env'
import { appointmentsRoutes } from '@/modules/appointments/infra/http/appointments.routes'
import { authRoutes } from '@/modules/auth/infra/http/auth.routes'
import { resourcesRoutes } from '@/modules/resources/infra/http/resources.routes'
import { servicesRoutes } from '@/modules/services/infra/http/services.routes'
import { usersRoutes } from '@/modules/users/infra/http/users.routes'
import { errorHandler } from './error-handler'
import jwtPlugin from './plugins/jwt'
import { swaggerPlugin } from './plugins/swagger'

const isDev = env.NODE_ENV === 'development'

export async function buildApp() {
  const app = Fastify({
    logger: isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
        }
      : true,
  })

  // Error Handler
  errorHandler(app)

  // CORS
  await app.register(fastifyCors, {
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'https://slotlock.up.railway.app',
      'https://slotlock-web.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })

  // RATE LIMIT — global
  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '15 minutes',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Try again later.',
    }),
  })

  // SWAGGER
  await app.register(swaggerPlugin)

  // COOKIES
  await app.register(fastifyCookie)

  // AUTH
  await app.register(jwtPlugin)

  // ROUTES
  await app.register(resourcesRoutes, { prefix: '/api' })
  await app.register(servicesRoutes, { prefix: '/api' })
  await app.register(appointmentsRoutes, { prefix: '/api' })
  await app.register(usersRoutes, { prefix: '/api' })
  await app.register(authRoutes, { prefix: '/api' })

  return app
}
