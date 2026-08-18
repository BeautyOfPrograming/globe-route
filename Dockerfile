# Use an official PHP image with Apache
FROM php:8.2-apache

# Copy your local PHP files into the container's web root
COPY . /var/var/www/html/

# Expose port 80 for web traffic
EXPOSE 80

# (Optional) If your project uses Composer, uncomment the lines below:
# RUN apt-get update && apt-get install -y unzip
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# RUN composer install --no-dev --optimize-autoloader
