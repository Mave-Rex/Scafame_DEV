# Requisitos de Software - Adenda de Optimizacion

Fecha: 2026-04-06
Proyecto: SCAFAME

## Proposito
Esta adenda registra las mejoras de rendimiento y usabilidad en backend y frontend implementadas despues de la linea base original del SRS.

## Cambios implementados

### 1) Optimizacion de consultas de reportes
- El endpoint backend `GET /reports` soporta parametros opcionales:
  - `type`: `income` | `outcome`
  - `status`: `pending` | `approved` | `rejected`
- Comportamiento de validacion:
  - Un `type` o `status` invalido retorna `400 Bad Request`.
- Actualizacion de comportamiento en frontend:
  - La obtencion de reportes usa filtros en servidor en lugar de descargar todo y filtrar en cliente.

#### Impacto funcional
- Gestion de retiros solicita solo reportes `outcome` en estado `pending`.
- Validacion de retiros solicita solo reportes `outcome` en estado `pending`.
- Se mantiene el mismo comportamiento visible con menor payload y menor procesamiento en cliente.

### 2) Optimizacion de consultas de productos
- El endpoint backend `GET /products` soporta parametros opcionales:
  - `q`: busqueda libre en nombre/descripcion (insensible a mayusculas/minusculas)
  - `categoryId`: filtro numerico por categoria
  - `inStock`: booleano (`true/false` o `1/0`)
  - `lowStock`: booleano (`true/false` o `1/0`)
- Comportamiento de validacion:
  - `categoryId` invalido o booleanos invalidos retornan `400 Bad Request`.
- Actualizacion de comportamiento en frontend:
  - El servicio de productos puede enviar filtros opcionales.
  - El selector de productos para retiros solicita solo productos con stock (`inStock=true`).

#### Impacto funcional
- El selector de retiros excluye productos sin stock a nivel API.
- Las vistas existentes que llaman `GET /products` sin filtros se mantienen compatibles.

### 3) Optimizacion de cache de catalogos en frontend
- Los servicios de frontend ahora cachean las consultas `getAll()` de catalogos para:
  - Productos
  - Categorias de producto
  - Unidades
- Implementacion de cache:
  - Cache en memoria con observables usando `shareReplay(1)`.
  - Invalidacion automatica en operaciones create/update/delete.

#### Impacto funcional
- El comportamiento de UI se mantiene sin cambios.
- La consistencia de datos se conserva tras mutaciones gracias a invalidacion explicita.

### 4) Optimizacion transaccional de actualizacion de stock en reportes
- Se optimizo la logica transaccional de backend en dos rutas criticas:
  - Reportes `INCOME`: los productos afectados se actualizan y persisten en guardado por lote.
  - Aprobaciones `OUTCOME`: cantidades agregadas por producto antes de validar y descontar stock.
  - Descuentos de stock en `OUTCOME` persistidos en guardado por lote.

#### Impacto funcional
- Menos round-trips de escritura a base de datos durante el procesamiento de reportes.
- Mejor consistencia de validacion cuando un mismo producto aparece varias veces en las lineas.
- Sin cambios de contrato API para consumidores frontend.

### 5) Optimizacion de indices de base de datos (entidades TypeORM)
- Se agregaron indices para optimizar filtros, ordenamientos y joins frecuentes:
  - `Product`: indices para `stock`/`creationDate` y llaves foraneas de categoria/unidad.
  - `Report`: indice compuesto `type-status-createdAt`, mas `createdAt` y llaves foraneas `user/requestedBy`.
  - `ProductReport`: indices para llaves foraneas `report` y `product`.

#### Impacto funcional
- Sin cambios de comportamiento API.
- Se espera mejor rendimiento de consultas en flujos de inventario/reportes con mayor volumen.

### 6) Correccion de confiabilidad en flujo de edicion de imagen de producto
- Se estabilizo el flujo de actualizacion de imagen en edicion:
  - Frontend usa metodo `multipart` explicito para subir/quitar imagen.
  - Endpoint backend de actualizacion soporta `removeImage=true` y manejo nullable de `imageUrl`.
  - Tipado de entidad `Product` alineado a `imageUrl` nullable (`string | null`).

#### Impacto funcional
- Editar un producto para agregar/reemplazar imagen actualiza consistentemente.
- Quitar una imagen existente funciona con soporte explicito en backend.

### 7) Cache-busting de imagenes de producto en vistas de inventario
- Se agrego cache-busting automatico para URLs de uploads en la resolucion de imagen.
- Despues de editar/quitar imagen, frontend actualiza una llave local de version para forzar refresco de navegador.

#### Impacto funcional
- Las imagenes actualizadas se muestran sin artefactos de cache obsoleto en tablas de inventario/productos.

### 8) Mejoras de visualizacion de productos y usabilidad de sidebar
- Mejoras en tabla de productos:
  - Diseno compacto con barra de filtros sticky y columnas alineadas.
  - Miniaturas de producto mas grandes.
  - Resolucion correcta de URL de imagen en tablas de inventario.
- Mejoras en sidebar/header:
  - Sidebar colapsable controlado por click en hamburguesa.
  - Se elimino auto-expansion por hover.
  - Ajuste de posicion de iconos/botones en estados colapsado/expandido.

#### Impacto funcional
- Mejor densidad y legibilidad de informacion de productos.
- Navegacion mas predecible con control consistente del sidebar.

### 9) Filtrado externo unificado y paginacion en vistas de seleccion de productos (2026-04-08)
- El componente de tabla frontend (`product-table`) se extendio para soporte de filtrado externo:
  - Nuevos inputs: `externalFiltering`, `totalProductos`.
  - Nuevo output: `filtersChange` con payload `{ searchTerm, categoria }`.
  - Contador visible de total alineado con totales del servidor.
- Vistas de alto volumen migradas a paginacion filtrada en servidor:
  - Vista de inventario.
  - Selector de productos para entradas.
  - Selector de productos para retiros.
- Se introdujo mapeo de nombre de categoria a id en vistas padre para convertir seleccion UI a filtro backend `categoryId`.

#### Impacto funcional
- Los filtros ahora disparan consultas backend en lugar de filtrar localmente datasets completos.
- Paginacion y totales se mantienen consistentes al filtrar.
- Menor payload para inventarios grandes y mejor respuesta bajo crecimiento.

### 10) Simplificacion de filtros en dashboard y alineacion de exporte (2026-04-09)
- Filtros de dashboard simplificados a controles operativos:
  - Se mantiene: Categoria, Nombre de producto, Unidad.
  - Se elimina: Stock minimo, Stock maximo, Estado de stock.
- El endpoint de Excel de inventario se extendio para aceptar filtros opcionales (`q`, `categoryId`, `categoryName`, `unitName`) para exportes filtrados en backend.
- Para garantizar paridad exacta entre UI y exporte, la generacion final de Excel del dashboard exporta directamente desde `filteredProducts` (dataset visible actual).

#### Impacto funcional
- El exporte refleja los mismos productos mostrados tras aplicar filtros en dashboard.
- Se elimina riesgo de desalineacion entre filtros UI y contenido exportado.
- Mejora la confianza del usuario en los cortes exportados.

### 11) Correccion de estabilidad de busqueda de productos con tipeo rapido (2026-04-09)
- Se resolvio la causa raiz: carrera de respuestas asincronas durante cambios rapidos de filtro que podia sobreescribir resultados nuevos con respuestas antiguas.
- `product-table` se actualizo para emitir filtros externos con debounce y supresion de duplicados.
- Vistas padre de listado aplican guardia de ultima-respuesta-valida (`requestId`) en cargas paginadas:
  - Inventario
  - Seleccion de productos en entradas
  - Seleccion de productos en retiros

#### Impacto funcional
- Al escribir nombres completos rapidamente, las coincidencias ya no desaparecen por respuestas atrasadas.
- La busqueda es consistente y deterministica en los flujos de productos.
- Menor ruido de eventos de filtro manteniendo el UX actual.

### 12) Normalizacion de busqueda de productos insensible a acentos (2026-04-09)
- Se introdujo normalizacion de busqueda para nombres con y sin diacriticos.
- La consulta backend (`q`) compara texto normalizado (sin acentos + minusculas) en:
  - Nombre de producto
  - Descripcion de producto
- Filtros locales frontend tambien normalizados para consistencia en contextos no remotos:
  - Ruta local de filtrado en `product-table`.
  - Filtrado in-memory por nombre en dashboard.

#### Impacto funcional
- Busquedas como `adaptadores` ahora coinciden con `adáptadores` y viceversa.
- Experiencia consistente sin importar el uso de acentos en los datos almacenados.

### 13) Correcciones de estabilidad de inicio/build de backend (2026-04-09)
- Ajustes de configuracion TypeScript para evitar bloqueos de arranque:
  - Se agrego `rootDir` explicito para layout estable de fuente/salida.
  - Se actualizo opcion de ignore deprecations a un valor soportado por compilador.
- Se corrigio firma de metodo en controller de reportes para cumplir reglas de orden de parametros requeridos.

#### Impacto funcional
- El build backend (`npm run build`) vuelve a completar con exito.
- El arranque en desarrollo puede continuar normalmente usando el comando watch correcto.

### 14) Migracion de inventario a infinite scroll (2026-04-09)
- Se eliminaron controles de paginacion en inventario y se reemplazaron por carga progresiva al hacer scroll.
- El componente compartido `product-table` detecta cercania al final de su contenedor y emite `scrollNearEnd`.
- La vista padre de inventario acumula paginas backend conservando filtros activos y orden actual de resultados.

#### Impacto funcional
- Navegacion de inventario sin cambiar pagina manualmente.
- Inventarios grandes cargan progresivamente con menor payload inicial.
- Selectores paginados de entradas/retiros siguen compatibles y sin cambios de UX.

### 15) Correcciones de reset de filtros y condiciones de carrera en selectores (2026-04-09)
- Los selectores de entradas y retiros se alinearon con la misma estrategia de ultima respuesta valida usada en inventario.
- La logica de reset de filtros ahora hace trim de espacios antes de decidir si la busqueda esta activa.
- Los cambios de filtro resetean explicitamente el estado de secuenciacion para evitar sobreescritura por respuestas obsoletas.
- El debounce compartido de emision de filtros se redujo a 100 ms para mayor respuesta manteniendo control de ruido.

#### Impacto funcional
- Borrar la caja de busqueda en entradas/retiros restaura el dataset esperado.
- El tipeo rapido deja de provocar desaparicion de productos por respuestas tardias.
- Comportamiento de busqueda unificado en inventario, entradas y retiros.

### 16) Rediseño de usabilidad de leyenda en grafico de dashboard (2026-04-09 a 2026-04-10)
- La leyenda del pie-chart en dashboard se movio de la leyenda nativa de canvas a un panel HTML personalizado.
- El panel de leyenda soporta scroll vertical para listas largas de categorias/productos.
- El texto de leyenda ahora hace wrap en lugar de recortarse, y la cantidad se muestra en segunda linea.
- El click en item de leyenda mantiene ocultar/mostrar el sector correspondiente y marca visualmente estado deshabilitado.

#### Impacto funcional
- Etiquetas largas permanecen legibles en el dashboard.
- El usuario puede inspeccionar todas las categorias/productos sin truncamiento.
- Se mantiene interaccion del grafico mejorando legibilidad en layouts restringidos.

### 17) Enriquecimiento de exporte Excel en dashboard (2026-04-10)
- Se ampliaron columnas del Excel de inventario con contexto adicional desde datos actuales de dashboard:
  - `Descripcion`
  - `Fecha creacion`
- El exporte sigue generado desde `filteredProducts` para mantener paridad con dataset visible.
- Un enriquecimiento temporal de `Estado stock` fue evaluado y retirado intencionalmente del resultado final.

#### Impacto funcional
- Los archivos exportados tienen mas contexto de negocio y menos sensacion de vacio.
- La estructura final queda alineada con las columnas aprobadas por usuario.

### 18) Robustecimiento en produccion de rutas de imagen y persistencia de uploads (2026-04-10)
- Se endurecio la resolucion de URLs de imagen en frontend para soportar valores legacy como:
  - nombres de archivo sueltos (ejemplo `1757...png`)
  - `/api/uploads/...`
  - `/uploads/...`
- El servido de uploads en backend se hizo mas robusto asegurando existencia del directorio antes de exponer estaticos y escribir archivos.
- Se normalizo destino de almacenamiento a ruta absoluta `uploads` bajo el working directory de backend.
- Se alineo configuracion de despliegue Docker para persistir uploads mediante directorio montado.
- El diagnostico operativo en produccion confirmo que imagenes rotas existentes provenian de referencias huerfanas en BD a archivos faltantes, no de la generacion actual de URLs.

#### Impacto funcional
- Las nuevas imagenes de productos deberian sobrevivir a flujos normales de redeploy/recreate.
- Registros legacy resuelven con mayor confiabilidad cuando el archivo existe.
- Registros historicos rotos pueden identificarse y remediarse con limpieza de BD dirigida en lugar de workarounds de UI.

### 19) Implementacion de modulo de notificaciones por correo para retiros (2026-04-13)

#### 19.1) Arquitectura del modulo
- Se implemento el nuevo `NotificationsModule` en backend con separacion de responsabilidades:
  - `NotificationsService`: orquesta el flujo completo de cada tipo de notificacion.
  - `EmailProviderService`: encapsula el transporte SMTP via `nodemailer`, expone `sendMail()` y `verifyConnection()`.
  - `TemplateService`: construye asunto y cuerpo HTML por tipo de evento (`buildOutcomeApproved`, `buildOutcomeRejected`, `buildOutcomePendingForAdmin`).
  - `NotificationLogService`: persiste cada intento de envio con su resultado final.
- Se agrego la entidad `NotificationLog` (tabla `notification_log`) para auditoria con columnas:
  - `type` (enum): `outcome_approved` | `outcome_rejected` | `outcome_pending_admin`.
  - `recipientEmail`, `recipientUserId`.
  - `subject`, `body`.
  - `status` (enum): `pending` | `sent` | `failed`.
  - `errorMessage`, `attempts`, `sentAt`, `createdAt`.
- Variables de entorno SMTP requeridas: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`.
- Proveedor SMTP configurado: `smtp.office365.com:587` (Outlook / Microsoft 365).

#### 19.2) Notificacion al solicitante en aprobacion/rechazo
- Al aprobar un retiro (`POST /reports/:id/approve`), el solicitante recibe correo de aprobacion.
- Al rechazar un retiro (`POST /reports/:id/reject`), el solicitante recibe correo de rechazo con el motivo si se especifica.
- El envio se ejecuta **despues del commit transaccional** del cambio de estado para evitar efectos parciales.
- Los errores SMTP se capturan con `try/catch`: un fallo de envio no revierte ni bloquea la operacion de negocio; el error queda registrado en `notification_log` con `status: failed`.

#### 19.3) Notificacion multi-administrador en nueva solicitud de retiro
- Al crear un reporte tipo `OUTCOME`, se dispara automaticamente la notificacion a todos los administradores registrados en la base de datos.
- Metodo: `sendOutcomePendingToAdministrators()` en `NotificationsService`.
- La lista de destinatarios se resuelve **dinamicamente desde la BD**: consulta todos los usuarios con `role = UserRole.ADMIN`.
- Se aplica deduplicacion por email antes del envio para evitar duplicados si existen usuarios con mismo correo.
- El envio es en paralelo via `Promise.all()` — cada destinatario recibe su propia entrada en `notification_log`.
- Los errores SMTP por destinatario individual no interrumpen el resto del fan-out ni la creacion del reporte.

#### 19.4) Correccion de incompatibilidad PostgreSQL FOR UPDATE + LEFT JOIN
- Se identifico y corrigio un fallo critico en los endpoints de aprobacion y rechazo de retiros.
- **Causa raiz**: TypeORM generaba una sentencia `SELECT ... FOR UPDATE` sobre una query con `LEFT JOIN` a la tabla `user` (relacion `requestedBy` nullable). PostgreSQL rechaza `FOR UPDATE` en el lado nullable de un outer join (`FOR UPDATE cannot be applied to the nullable side of an outer join`).
- **Solucion**: Se separo la query de bloqueo pesimista de la carga de relaciones:
  1. Query de bloqueo (`setLock('pessimistic_write')`) opera solo sobre la tabla `report` sin joins.
  2. Despues del `commitTransaction()`, se carga `requestedBy` en una consulta separada con `findOne({ relations: ['requestedBy'] })`.
- Este cambio elimino los errores `500 Internal Server Error` en aprobacion y rechazo.

#### Impacto funcional
- Los usuarios solicitantes reciben comunicacion inmediata sobre el resultado de sus solicitudes de retiro.
- Todos los administradores del sistema reciben alerta en tiempo real al generarse una nueva solicitud de retiro pendiente.
- La lista de administradores notificados es dinamica: agregar o quitar administradores en BD tiene efecto inmediato sin redespliegue.
- El sistema conserva evidencia auditable de notificaciones enviadas/fallidas sin bloquear la operacion principal.
- Los endpoints de aprobacion y rechazo son funcionales y estables tras la correccion del bloqueo transaccional.
- La arquitectura queda preparada para extender nuevos eventos (alta de usuario, cambio de contrasena, alertas de stock) sin acoplar controladores a logica SMTP.

## Alineacion con requisitos no funcionales
- Rendimiento:
  - Reduccion de payload en escenarios de reportes y seleccion de productos.
  - Menor trabajo de filtrado en cliente.
  - Menos solicitudes frontend duplicadas para catalogos estaticos/de cambio lento.
  - Menor sobrecarga de escritura en transacciones de stock.
  - Mejor rendimiento de consultas por indices dirigidos.
  - Menor transferencia de listas grandes en inventario, entradas y retiros via paginacion filtrada.
- Confiabilidad:
  - Actualizaciones de imagen en edicion de producto son deterministicas en create/edit/remove.
  - Renderizado de imagen en inventario es resiliente a cache obsoleto.
  - El exporte Excel de dashboard es deterministico respecto al estado filtrado visible.
  - Imagenes de inventario/productos en produccion son mas resilientes a formatos legacy y recreacion de contenedores.
  - Selectores de producto e infinite scroll resisten mejor sobreescrituras por respuestas atrasadas.
  - El resultado de aprobacion/rechazo de retiros se comunica por correo con trazabilidad de fallos y exitos.
  - Los endpoints de aprobacion/rechazo son estables tras correccion del bloqueo transaccional PostgreSQL FOR UPDATE + LEFT JOIN.
  - Todos los administradores activos en BD reciben alerta de nueva solicitud pendiente sin configuracion de listas estaticas.
- Mantenibilidad:
  - Comportamiento de consultas/filtros centralizado en backend.
  - Servicios frontend exponen interfaces explicitas de filtro y actualizacion.
  - Patron de acceso a catalogos estandarizado entre servicios.
  - Contrato de filtrado de tabla compartida reutilizado en multiples vistas via `filtersChange`.
  - Comportamientos de scroll/filtro en tabla compartida sirven como contrato comun para vistas de inventario grandes.
  - La notificacion por correo se encapsula en un modulo dedicado reutilizable por otros procesos de negocio.
  - La resolucion de destinatarios desde BD permite gestionar administradores sin tocar codigo ni variables de entorno.

## Evidencia de validacion
- Build backend: exitoso (`npm run build`).
- Build frontend: exitoso (`npm run build -- --no-progress`).
- Frontend emite advertencias CommonJS no bloqueantes no relacionadas a estos cambios funcionales.

## Siguiente ola sugerida de optimizaciones
- Agregar controles de paginacion en otras vistas de alto volumen, ademas de inventario.
- Agregar filtros por rango de fecha en historial/reportes para evitar descargas completas.
- Agregar logs ligeros de tiempos de solicitud en endpoints criticos para benchmark antes/despues.

## Control documental
- Esta adenda es la fuente de verdad para cambios de optimizacion.
- Nuevos cambios de optimizacion deben agregarse en orden cronologico, con fecha e impacto funcional.