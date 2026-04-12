import type { AppInstance } from '@/@types/fastify'
import { db } from '@/infra/database/db'
import { users } from '../../../../../db/schema'

export async function usersRoutes(app: AppInstance) {
  app.get(
    '/users',
    {
      schema: {
        summary: 'List all users',
        tags: ['Users'],
      },
    },
    async (req, reply) => {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
      return reply.status(200).send(result)
    },
  )
}
