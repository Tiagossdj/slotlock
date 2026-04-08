import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '@/config/env'

import { authenticate, requireAdmin } from '../hooks/authenticate'

async function jwtPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  app.decorate('authenticate', authenticate)
  app.decorate('requireAdmin', requireAdmin)
}

export default fp(jwtPlugin)
