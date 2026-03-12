import Fastify from 'fastify'
import { swaggerPlugin } from './plugins/swagger'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  await app.register(swaggerPlugin)

  return app
}
