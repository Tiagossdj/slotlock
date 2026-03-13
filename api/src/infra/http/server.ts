import Fastify from 'fastify'
import { env } from '@/config/env'
import { resourcesRoutes } from '@/modules/resources/infra/http/resources.routes'
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

  // SWAGGER
  await app.register(swaggerPlugin)

  // ROUTES
  await app.register(resourcesRoutes, { prefix: '/api' })

  return app
}
