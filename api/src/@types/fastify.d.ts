import type { FastifyInstance } from 'fastify'
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

export type AppInstance = FastifyInstance<
  import('http').Server,
  import('http').IncomingMessage,
  import('http').ServerResponse,
  import('fastify').FastifyBaseLogger,
  JsonSchemaToTsProvider
>

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: string }
    user: { sub: string; email: string; role: string }
  }
}
