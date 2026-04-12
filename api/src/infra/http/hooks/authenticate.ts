import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    // Tenta o cookie httpOnly primeiro
    const token = req.cookies?.slotlock_token

    if (token) {
      req.user = req.server.jwt.verify(token)
    } else {
      // Fallback pro Bearer — útil pra testar no Swagger
      await req.jwtVerify()
    }
  } catch {
    reply.code(401).send({ message: 'Unauthorized' })
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply)

  if (req.user?.role !== 'admin') {
    reply.code(403).send({ message: 'Forbidden' })
  }
}
