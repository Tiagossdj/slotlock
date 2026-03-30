import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify()
  if (req.user.role !== 'admin') {
    reply.code(403).send({ message: 'Forbidden' })
  }
}
