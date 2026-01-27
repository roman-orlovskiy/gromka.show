import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    // Prisma CLI грузит config всегда, даже для `generate`.
    // Поэтому не используем env('DATABASE_URL') (оно бросает ошибку если переменная не задана).
    url: process.env.DATABASE_URL ?? ''
  }
})

