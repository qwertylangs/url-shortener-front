# Быстрый старт

## Шаг 1: Подготовка сервера

На вашем сервере выполните:

```bash
# Создать директории
sudo mkdir -p /var/www/url-shortener/frontend
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Установить Node.js 22 (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs

# Проверить версию
node --version  # должно быть v22.x.x
```

## Шаг 2: Настройка Nginx

```bash
# Проверьте, что в /etc/nginx/nginx.conf есть строка:
sudo nano /etc/nginx/nginx.conf
```

В секции `http {` должно быть:
```nginx
http {
    ...
    include /etc/nginx/sites-enabled/*;
    ...
}
```

Если её нет, добавьте.

## Шаг 3: Настройка GitHub Secrets

В настройках вашего GitHub репозитория (Settings → Secrets and variables → Actions) добавьте:

**DEPLOY_SSH_KEY** - приватный SSH ключ для доступа к серверу

```bash
# На своей машине создайте SSH ключ (если нет):
ssh-keygen -t ed25519 -C "github-deploy"

# Скопируйте публичный ключ на сервер:
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@178.72.136.82

# Скопируйте ПРИВАТНЫЙ ключ в GitHub Secret:
cat ~/.ssh/id_ed25519
# (скопируйте весь вывод, включая BEGIN и END)
```

## Шаг 4: Проверка бэкенда

Убедитесь, что бэкенд запущен на сервере:

```bash
# На сервере
curl http://localhost:8082/login
# Должен вернуть ответ (не connection refused)
```

## Шаг 5: Запуск деплоя

1. Закоммитьте и запушьте изменения в GitHub
2. Перейдите в Actions
3. Выберите workflow "Deploy Frontend"
4. Нажмите "Run workflow"
5. Укажите тег (например, `v1.0.0`)
6. Нажмите "Run workflow"

## Шаг 6: Проверка

После успешного деплоя:

```bash
# На сервере проверьте статус сервисов:
sudo systemctl status shortener-front
sudo systemctl status nginx

# Проверьте логи:
sudo journalctl -u shortener-front -n 50

# Проверьте что приложение отвечает:
curl http://localhost:3000
```

Откройте в браузере: `http://178.72.136.82`

## Troubleshooting

### Ошибка: "Permission denied (publickey)"
- Проверьте, что публичный ключ добавлен на сервер в `~/.ssh/authorized_keys`
- Проверьте, что приватный ключ добавлен в GitHub Secrets

### Ошибка: "502 Bad Gateway"
- Проверьте, что сервис запущен: `sudo systemctl status shortener-front`
- Проверьте логи: `sudo journalctl -u shortener-front -n 50`

### Ошибка: "nginx: [emerg] bind() to 0.0.0.0:80 failed"
- Порт 80 уже занят, проверьте: `sudo netstat -tlnp | grep :80`
- Остановите конфликтующий сервис

### API запросы не работают
- Проверьте, что бэкенд запущен: `curl http://localhost:8082/login`
- Проверьте конфиг Nginx: `sudo nginx -t`
- Проверьте логи Nginx: `sudo tail -f /var/log/nginx/shortener-front-error.log`

