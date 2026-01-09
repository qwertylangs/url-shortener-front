# Развертывание Frontend приложения

## Структура Standalone сборки Next.js

При выполнении `pnpm build` с `output: 'standalone'` Next.js создает следующую структуру:

```
.next/
├── standalone/
│   └── <абсолютный-путь-к-проекту>/  # Next.js воссоздает полный путь!
│       ├── server.js                  # Точка входа сервера
│       ├── package.json
│       └── node_modules/              # Минимальные зависимости
├── static/                            # Статические ассеты (_buildManifest, chunks)
└── ...

public/                                # Публичные файлы (favicon, images)
```

**Важно**: Путь внутри `standalone/` зависит от того, где находится проект:
- Локально: `.next/standalone/Users/egor/learn/go/shortener-front/`
- GitHub Actions: `.next/standalone/home/runner/work/shortener-front/shortener-front/`

Поэтому в CI/CD используется динамический поиск папки с `server.js`.

## Проверка структуры локально

Чтобы увидеть, какую структуру создает Next.js standalone:

```bash
# Выполнить сборку
pnpm build

# Найти где находится server.js
find .next/standalone -name "server.js" -type f

# Например, может быть:
# .next/standalone/Users/egor/learn/go/shortener-front/server.js (локально)
# .next/standalone/home/runner/work/shortener-front/shortener-front/server.js (GitHub Actions)
```

## Процесс развертывания

### 1. Копирование файлов

Файлы копируются в `/var/www/url-shortener/frontend/` на сервере:

```bash
# 1. Динамически находим папку с server.js
STANDALONE_DIR=$(find .next/standalone -name "server.js" -type f | head -n 1 | xargs dirname)

# 2. Копируем Server файлы (server.js, node_modules, package.json)
rsync "$STANDALONE_DIR/" -> /var/www/url-shortener/frontend/

# 3. Копируем статические файлы Next.js
rsync .next/static/ -> /var/www/url-shortener/frontend/.next/static/

# 4. Копируем публичные файлы
rsync public/ -> /var/www/url-shortener/frontend/public/
```

### 2. Структура на сервере

После развертывания структура на сервере:

```
/var/www/url-shortener/frontend/
├── server.js                # Запускается через systemd
├── package.json
├── node_modules/
├── .next/
│   └── static/             # Статические файлы Next.js
└── public/                 # Публичные файлы
```

### 3. Systemd Service

Сервис запускает Next.js сервер на порту 3000:

```ini
ExecStart=/usr/bin/node server.js
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
```

### 4. Nginx конфигурация

**Важно**: Убедитесь, что основной конфиг Nginx (`/etc/nginx/nginx.conf`) содержит строку:

```nginx
http {
    ...
    include /etc/nginx/sites-enabled/*;
}
```

Если этой строки нет, добавьте её или используйте альтернативный путь `/etc/nginx/conf.d/`.

Nginx проксирует запросы:

- `/` → `http://127.0.0.1:3000` (Next.js приложение)
- `/api/*` → `http://127.0.0.1:8082/*` (Backend API)

### 5. Переменные окружения

Frontend автоматически определяет URL бэкенда:
- **Development**: `http://localhost:8082` (прямое обращение)
- **Production**: `/api` (через Nginx прокси)

## Первичная настройка сервера

Перед первым деплоем выполните на сервере:

```bash
# Скачайте скрипт настройки
wget https://raw.githubusercontent.com/YOUR_REPO/main/deployment/setup-server.sh

# Или скопируйте вручную и выполните:
chmod +x setup-server.sh
sudo bash setup-server.sh
```

Скрипт автоматически:
- Создаст необходимые директории
- Установит Node.js (если не установлен)
- Установит Nginx (если не установлен)
- Настроит конфигурацию Nginx для работы с sites-enabled
- Установит правильные права доступа

## Команды для ручного управления

```bash
# Перезапуск frontend сервиса
sudo systemctl restart shortener-front

# Проверка статуса
sudo systemctl status shortener-front

# Просмотр логов
sudo journalctl -u shortener-front -f

# Перезагрузка Nginx
sudo nginx -t && sudo systemctl reload nginx

# Права доступа
sudo chown -R www-data:www-data /var/www/url-shortener/frontend
sudo chmod -R 755 /var/www/url-shortener/frontend
```

## Troubleshooting

### Проблема: 502 Bad Gateway

**Причина**: Next.js сервер не запущен или неправильный путь к server.js

**Решение**:
```bash
# Проверить статус сервиса
sudo systemctl status shortener-front

# Проверить что server.js находится в правильном месте
ls -la /var/www/url-shortener/frontend/server.js

# Проверить логи
sudo journalctl -u shortener-front -n 50
```

### Проблема: Static файлы не загружаются (404)

**Причина**: Не скопировалась директория `.next/static/` или `public/`

**Решение**:
```bash
# Проверить наличие файлов
ls -la /var/www/url-shortener/frontend/.next/static/
ls -la /var/www/url-shortener/frontend/public/

# Пересобрать и задеплоить
```

### Проблема: API запросы не работают

**Причина**: Backend не запущен или неправильная конфигурация Nginx

**Решение**:
```bash
# Проверить что backend запущен на 8082
curl http://localhost:8082/login

# Проверить Nginx конфиг
sudo nginx -t

# Проверить логи Nginx
sudo tail -f /var/log/nginx/shortener-front-error.log
```

