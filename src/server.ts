import { env } from './env/index.js'
import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/users.js'
import { mealsRoutes } from './routes/meals.js'

const app = fastify()

app.register(cookie)
app.register(userRoutes, { prefix: '/users' })
app.register(mealsRoutes, { prefix: '/meals' })

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server running on http://localhost:' + env.PORT)
})
