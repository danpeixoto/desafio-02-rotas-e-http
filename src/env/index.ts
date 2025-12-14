import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is not defined'),
  DATABASE_MIGRATIONS: z.string().min(1, 'DATABASE_MIGRATIONS is not defined'),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

const _env = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_MIGRATIONS: process.env.DATABASE_MIGRATIONS,
  PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
  NODE_ENV: process.env.NODE_ENV,
})

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables.')
}

export const env = _env.data
