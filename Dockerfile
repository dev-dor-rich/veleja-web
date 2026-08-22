FROM php:8.2-fpm-alpine
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli
COPY . /var/www/html/
WORKDIR /var/www/html/
EXPOSE 80
CMD ["php", "-S", "0.0.0.0:80", "-t", "/var/www/html/"]
