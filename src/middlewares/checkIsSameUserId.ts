import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

export async function checkIsSameUserId(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const userId = request.cookies.userId
  const getUserIdParamsSchema = z.object({
    id: z.uuid(),
  })
  const { id } = getUserIdParamsSchema.parse(request.params)

  if (userId !== id) {
    return response.status(403).send({ message: 'Forbidden.' })
  }
}
