# Сокращатель ссылок - Frontend

Next.js приложение для сокращения ссылок с аутентификацией.

## Быстрый старт

### Локальная разработка

1. Установите зависимости:
```bash
pnpm install
```

2. (Опционально) Создайте `.env.local` для настройки API URL:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8082
```

3. Запустите development сервер:
```bash
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### Production сборка

#### Standalone сборка
```bash
pnpm build
# Запуск
node .next/standalone/server.js
```

#### Docker
```bash
docker build --build-arg NEXT_PUBLIC_API_URL=/api -t shortener-front .
docker run -p 3000:3000 shortener-front
```

Подробнее: [deployment/DOCKER.md](./deployment/DOCKER.md)

## Переменные окружения

### `NEXT_PUBLIC_API_URL`

URL для API запросов:
- **Development (по умолчанию)**: `http://localhost:8082`
- **Production**: `/api` (через Nginx прокси)

⚠️ Переменные с префиксом `NEXT_PUBLIC_` встраиваются в код **при сборке**.

## Деплой

- [deployment/QUICK_START.md](./deployment/QUICK_START.md) - Быстрый старт для деплоя
- [deployment/DOCKER.md](./deployment/DOCKER.md) - Docker конфигурация
- [deployment/README.md](./deployment/README.md) - Детальная документация

## Структура проекта

```
app/
├── lib/
│   └── api.ts          # API клиент
├── login/
│   └── page.tsx        # Страница входа
├── register/
│   └── page.tsx        # Страница регистрации
└── page.tsx            # Главная страница (список алиасов)

deployment/
├── nginx.conf          # Конфигурация Nginx
├── shortener-front.service  # Systemd сервис
└── *.md                # Документация
```

## Технологии

- **Next.js 16** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS 4** - Стилизация
- **pnpm** - Менеджер пакетов
