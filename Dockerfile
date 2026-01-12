FROM node:22.17.0-alpine AS base

# 1. Установка зависимостей
FROM base AS deps
# в alpine нет стандатной glibc, а вместо нее используется musl libc6-compat для совместимости,
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# corepack - повзоляет использовать pnpm как менеджер пакетов в npm без установки pnpm отдельно
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# 2. Сборка
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Передаем переменную окружения на этапе сборки (дефолтное значение) передаваь через --build-arg NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN corepack enable pnpm && pnpm run build

# 3. Финальный образ
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Копируем только то, что нужно для standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]