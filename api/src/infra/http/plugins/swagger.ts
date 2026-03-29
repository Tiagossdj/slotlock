import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export const swaggerPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'SlotLock API',
        description: 'Resource-aware scheduling API',
        version: '1.0.0',
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === 'production'
              ? 'https://slotlock-api.up.railway.app'
              : 'http://localhost:3000',
        },
      ],
    },
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
})
