import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

export async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'SlotLock API',
        description: 'Resource-aware scheduling API',
        version: '1.0.0',
      },
    },
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
}
