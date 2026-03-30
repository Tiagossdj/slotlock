import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '@/config/env'

async function jwtPlugin(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })
}

export default fp(jwtPlugin)
