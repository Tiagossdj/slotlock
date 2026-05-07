import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '@/config/env'

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
          url: 'http://localhost:3000',
          description: 'Ambiente de Desenvolvimento (Local)',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
})
