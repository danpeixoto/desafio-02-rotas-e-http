import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { knex } from '../database.js'
import crypto from 'node:crypto'
import { checkUserAuth } from '../middlewares/checkUserAuth.js'
import { checkIsSameUserId } from '../middlewares/checkIsSameUserId.js'

function bestDietStreak(meals: Array<{ inside_diet: boolean }>) {
  let max = 0
  let cur = 0
  for (const meal of meals) {
    if (meal.inside_diet) {
      cur += 1
      if (cur > max) max = cur
    } else {
      cur = 0
    }
  }
  return max
}

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.email(),
    })
    const { name, email } = createUserBodySchema.parse(request.body)

    const userExists = await knex('users').where({ email }).first()

    if (userExists) {
      return response.status(409).send({ message: 'User already exists.' })
    }

    const newUser = await knex('users')
      .insert({
        name,
        email,
        id: crypto.randomUUID(),
      })
      .returning('*')
      .first()

    response.cookie('userId', newUser!.id, { maxAge: 60 * 60 * 24 * 7 })

    return response.status(201).send()
  })

  app.post('/auth', async (request, response) => {
    const authUserBodySchema = z.object({
      email: z.string().email(),
    })
    const { email } = authUserBodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return response.status(404).send({ message: 'User not found.' })
    }

    response.cookie('userId', user.id, { maxAge: 60 * 60 * 24 * 7 })

    return response.status(200).send()
  })

  app.get(
    '/:id/summary',
    { preHandler: [checkUserAuth, checkIsSameUserId] },
    async (request, response) => {
      const getUserSummaryParamsSchema = z.object({
        id: z.uuid(),
      })
      const { id } = getUserSummaryParamsSchema.parse(request.params)

      const summary = await knex('meals')
        .where({ user_id: id })
        .select(
          knex.raw(
            'COUNT(*) FILTER (WHERE is_on_diet = true) AS on_diet_count',
          ),
          knex.raw(
            'COUNT(*) FILTER (WHERE is_on_diet = false) AS off_diet_count',
          ),
          knex.raw('COUNT(*) AS total_meals'),
        )
        .first()

      const allMeals = await knex('meals')
        .where({ user_id: id })
        .orderBy('created_at', 'asc')
        .select('inside_diet', 'created_at')

      const streak = bestDietStreak(allMeals)

      return response.status(200).send({ summary: { ...summary, streak } })
    },
  )
}
