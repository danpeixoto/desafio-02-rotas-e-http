import { env } from './env/index.js'
import fastify from 'fastify'

const app = fastify()
app.get('/', async () => {
  return { hello: 'world' }
})
app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server running on http://localhost:' + env.PORT)
})
