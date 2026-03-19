import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'
import { env } from '@/config/env'
import { appointmentsRoutes } from '@/modules/appointments/infra/http/appointments.routes'
import { resourcesRoutes } from '@/modules/resources/infra/http/resources.routes'
import { servicesRoutes } from '@/modules/services/infra/http/services.routes'
import { errorHandler } from './error-handler'
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
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })

  // SWAGGER
  await app.register(swaggerPlugin)

  // ROUTES
  await app.register(resourcesRoutes, { prefix: '/api' })
  await app.register(servicesRoutes, { prefix: '/api' })
  await app.register(appointmentsRoutes, { prefix: '/api' })

  return app
}
