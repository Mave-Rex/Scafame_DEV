# Usa la imagen oficial de Apache
FROM httpd:2.4

# Copia tu configuración personalizada a la carpeta extra
COPY 000-default.conf /usr/local/apache2/conf/extra/httpd-angular.conf

# Agrega la inclusión de tu configuración al final del httpd.conf base
RUN echo "Include conf/extra/httpd-angular.conf" >> /usr/local/apache2/conf/httpd.conf

# Copia los archivos compilados del frontend Angular
COPY dist/sigfame_frontend/browser/ /usr/local/apache2/htdocs/
