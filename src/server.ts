import { env } from './env/index.js'
import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/users.js'

const app = fastify()

app.register(cookie)
app.register(userRoutes, { prefix: '/users' })

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server running on http://localhost:' + env.PORT)
})
