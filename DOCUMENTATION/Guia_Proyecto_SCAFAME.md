# Guia general del proyecto SCAFAME

## 1. Descripcion general
SCAFAME es un sistema de gestion de inventario y procesos internos, compuesto por:
- Frontend web en Angular.
- Backend API en NestJS.
- Base de datos PostgreSQL.
- Despliegue en contenedores Docker (backend, frontend, db y nginx).

El sistema cubre gestion de productos, categorias, unidades, entradas/salidas de inventario, reportes, historial y administracion de usuarios.

## 2. Estructura principal del repositorio
- `CODE/scafame_frontend`: aplicacion Angular.
- `CODE/scafame_backend`: API NestJS + TypeORM.
- `CODE/docker-compose.yml`: orquestacion principal de servicios en Docker.
- `CODE/deploy frontend`: imagen y configuracion de Apache para servir frontend compilado.
- `CODE/nginx`: configuracion de reverse proxy.
- `DOCUMENTATION`: documentacion funcional y tecnica.
- `QR GENERATION APP`: utilitario independiente para generacion de QR.

## 3. Stack tecnologico
### Frontend
- Angular 20
- RxJS
- TailwindCSS
- ngx-toastr
- Chart.js
- ExcelJS

### Backend
- NestJS 11
- TypeORM 0.3
- PostgreSQL (driver `pg`)
- JWT/Passport para autenticacion
- Multer para subida de imagenes
- ExcelJS para exportes

### Infraestructura
- Docker Compose
- PostgreSQL 16
- Nginx + Apache (frontend servido como contenido estatico)

## 4. Modulos funcionales
### 4.1 Usuarios
- Alta, edicion y eliminacion de usuarios.
- Roles: `admin`, `manager`, `user`.
- Cambio de contrasena.

### 4.2 Inventario
- Visualizacion general de productos.
- Filtros por texto y categoria.
- Gestion de productos, categorias y unidades.
- Soporte de imagen por producto.

### 4.3 Entradas y retiros
- Solicitud de productos para entradas.
- Solicitud y gestion de retiros.
- Revision de solicitudes antes de registrar.

### 4.4 Historial y reportes
- Historial de movimientos.
- Detalle de reportes.
- Exportacion a Excel/PDF en vistas operativas.

### 4.5 Dashboard
- KPIs de inventario.
- Grafico de stock por categoria/producto.
- Exporte de reporte filtrado.

## 5. Rutas principales de frontend
Rutas base:
- `/auth/login`
- `/home`
- `/users`
- `/inventory`
- `/dashboard`
- `/removals`
- `/entries`
- `/history`
- `/modify`

Rutas de usuarios:
- `/users/list`
- `/users/add`
- `/users/edit`
- `/users/delete`

## 6. Endpoints principales de backend
Controladores detectados:
- `auth`
- `users`
- `products`
- `product-categories`
- `units`
- `reports`

Ejemplos de uso frecuentes:
- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `GET /reports`
- `POST /reports`
- `GET /users`
- `POST /users`

## 7. Modelo de datos (entidades)
Entidades principales configuradas en TypeORM:
- `User`
- `Product`
- `Unit`
- `ProductCategory`
- `Report`
- `ProductReport`

Relaciones clave:
- `Product` pertenece a `ProductCategory` y opcionalmente a `Unit`.
- `Report` se relaciona con productos a traves de `ProductReport`.

## 8. Imagenes de productos
- Las imagenes se sirven desde `/uploads`.
- En backend, la carga de archivos se maneja con Multer.
- Para despliegue en contenedor, la carpeta de uploads debe persistirse con volumen.

## 9. Ejecucion en desarrollo
### Backend
Desde `CODE/scafame_backend`:

```bash
npm install
npm run start:dev
```

### Frontend
Desde `CODE/scafame_frontend`:

```bash
npm install
npm start
```

## 10. Despliegue con Docker (referencia)
Desde `CODE`:

```bash
docker compose build
docker compose up -d
```

Servicios esperados:
- `db` (PostgreSQL)
- `backend` (NestJS)
- `frontend` (Apache con build Angular)
- `nginx` (proxy)

## 11. Variables y configuracion clave
### Backend
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `NODE_ENV`

### Frontend
- `API_BASE` en `src/environments/environment.prod.ts`.
- Resolucion de imagenes via `image-url.pipe.ts`.

## 12. Documentos recomendados del repositorio
- `DOCUMENTATION/Software_Requirements_Specification_SCAFAME_Optimization_Addendum.md`
- `DOCUMENTATION/Guia_Acceso_Base_Datos_VM.md`

## 13. Buenas practicas operativas
- Validar `npm run build` antes de despliegue frontend.
- No continuar despliegue remoto si el build falla.
- Evitar `docker compose down -v` en entornos con datos que se deben conservar.
- Respaldar BD antes de cambios de infraestructura.

## 14. Estado y evolucion
El proyecto ha tenido una fase activa de optimizaciones en:
- filtros y busquedas,
- paginacion/infinite scroll,
- exportes de reporte,
- estabilidad de imagenes,
- mejoras de UI/UX en tablas y dashboard.

Este documento sirve como panorama general del sistema y punto de entrada para nuevos cambios.