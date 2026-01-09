#!/bin/bash

# Скрипт для первичной настройки сервера
# Запускать на сервере от root: bash setup-server.sh

set -e

echo "=== Настройка сервера для Next.js приложения ==="

# Создаем необходимые директории
echo "1. Создание директорий..."
mkdir -p /var/www/url-shortener/frontend
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# Проверяем, что Node.js установлен
echo "2. Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js не установлен. Устанавливаем..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js уже установлен: $(node --version)"
fi

# Проверяем, что Nginx установлен
echo "3. Проверка Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Nginx не установлен. Устанавливаем..."
    apt-get update
    apt-get install -y nginx
else
    echo "Nginx уже установлен: $(nginx -v)"
fi

# Проверяем главный конфиг Nginx
echo "4. Проверка конфигурации Nginx..."
if ! grep -q "include /etc/nginx/sites-enabled/\*;" /etc/nginx/nginx.conf; then
    echo "Добавляем include для sites-enabled в nginx.conf..."
    sed -i '/http {/a \    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
fi

# Удаляем дефолтный сайт Nginx (если есть)
echo "5. Очистка дефолтного конфига..."
rm -f /etc/nginx/sites-enabled/default

# Устанавливаем права
echo "6. Установка прав доступа..."
chown -R www-data:www-data /var/www/url-shortener
chmod -R 755 /var/www/url-shortener

echo ""
echo "=== Настройка завершена! ==="
echo ""
echo "Следующие шаги:"
echo "1. Убедитесь, что бэкенд запущен на localhost:8082"
echo "2. Запустите GitHub Actions workflow для деплоя"
echo "3. Проверьте статус сервисов:"
echo "   - systemctl status shortener-front"
echo "   - systemctl status nginx"

