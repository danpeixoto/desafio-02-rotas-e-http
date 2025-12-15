// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables.js' {
  interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: Date
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      is_on_diet: boolean
      eaten_at: Date
      created_at: Date
    }
  }
}
