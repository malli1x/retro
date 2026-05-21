# Dockerfile для RetroTech Hub (Apache + PHP 8.2)
FROM php:8.2-apache

# Встановлюємо розширення PDO для MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Копіюємо всі файли проекту в контейнер
COPY . /var/www/html/

# Даємо Apache права на файли
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Відкриваємо порт 80
EXPOSE 80
