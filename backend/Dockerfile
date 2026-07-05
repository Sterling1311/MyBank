FROM php:8.4-cli

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev libonig-dev libxml2-dev libsodium-dev \
    && docker-php-ext-install pdo pdo_mysql zip mbstring sodium

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader --no-scripts

EXPOSE 8080

CMD php bin/console doctrine:migrations:migrate --no-interaction --env=prod --allow-no-migration || true && \
    php -S 0.0.0.0:8080 -t public