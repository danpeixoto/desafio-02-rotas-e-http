import type { FastifyInstance } from 'fastify'
import { knex } from '../database.js'
import z from 'zod'
import { checkUserAuth } from '../middlewares/checkUserAuth.js'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, response) => {
    await checkUserAuth(request, response)
  })

  app.get('/', async (request, response) => {
    const userId = request.cookies.userId
    const meals = await knex('meals').where({ user_id: userId! }).select('*')
    return response.status(200).send({ meals })
  })

  app.get('/:id', async (request, response) => {
    const getMealParamsSchema = z.object({
      id: z.uuid(),
    })
    const { id } = getMealParamsSchema.parse(request.params)

    const userId = request.cookies.userId

    const meal = await knex('meals').where({ id, user_id: userId! }).first()

    if (!meal) {
      return response.status(404).send({ message: 'Meal not found.' })
    }

    return response.status(200).send({ meal })
  })

  app.post('/', async (request, response) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      eatenAt: z.iso.datetime(),
    })
    const { name, description, isOnDiet, eatenAt } = createMealBodySchema.parse(
      request.body,
    )
    const userId = request.cookies.userId

    await knex('meals').insert({
      id: crypto.randomUUID(),
      user_id: userId!,
      name,
      description,
      is_on_diet: isOnDiet,
      eaten_at: new Date(eatenAt),
      created_at: new Date(),
    })

    return response.status(201).send()
  })

  app.patch('/:id', async (request, response) => {
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = updateMealParamsSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
      eatenAt: z.iso.datetime().optional(),
    })
    const { name, description, isOnDiet, eatenAt } = updateMealBodySchema.parse(
      request.body,
    )
    const userId = request.cookies.userId

    const meal = await knex('meals').where({ id, user_id: userId! }).first()

    if (!meal) {
      return response.status(404).send({ message: 'Meal not found.' })
    }

    await knex('meals')
      .where({ id })
      .update({
        name: name ?? meal.name,
        description: description ?? meal.description,
        is_on_diet: isOnDiet ?? meal.is_on_diet,
        eaten_at: eatenAt ? new Date(eatenAt) : meal.eaten_at,
      })

    return response.status(200).send()
  })

  app.delete('/:id', async (request, response) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = deleteMealParamsSchema.parse(request.params)

    const userId = request.cookies.userId

    const meal = await knex('meals').where({ id, user_id: userId! }).first()

    if (!meal) {
      return response.status(404).send({ message: 'Meal not found.' })
    }

    await knex('meals').where({ id }).delete()

    return response.status(204).send()
  })
}
