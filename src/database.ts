import setupKnex from 'knex'
import { env } from './env/index.js'

export const config: setupKnex.Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: env.DATABASE_MIGRATIONS,
  },
}

export const knex = setupKnex(config)
