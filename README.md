# gromka.show

Nuxt 4 приложение + Postgres (Prisma) для сохранения заявок с формы “Контакты”.

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости поменяйте `DATABASE_URL`.

## База данных (Prisma)

- **Dev (локально)**: миграции создаём и применяем только через `prisma migrate dev`.
- **Prod/CI**: применяем уже существующие миграции через `prisma migrate deploy`.

Команды (внутри контейнера `app`):

```bash
# dev: создать и применить миграцию (локально)
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name init_contacts

# dev/prod: сгенерировать Prisma Client
docker compose -f docker-compose.dev.yml exec app npx prisma generate

# prod/ci: применить существующие миграции (без создания новых)
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

## Docker

- **Dev**: `docker-compose.dev.yml` (код монтируется volume’ом).
- **Prod**: `docker-compose.prod.yml` (сборка образа + `migrate deploy` перед стартом).
