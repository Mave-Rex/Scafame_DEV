# Diagramas de arquitectura y entidad-relacion - SCAFAME

## 1) Diagrama de arquitectura (alto nivel)
```mermaid
flowchart LR
    U[Usuario Web]
    FE[Frontend Angular\nscafame_frontend]
    NG[Nginx Reverse Proxy\nScafame-nginx]
    BE[Backend NestJS API\nScafame-backend]
    DB[(PostgreSQL\nScafame-db)]
    UP[(Volumen Uploads\n/app/uploads)]

    U -->|HTTP/HTTPS| NG
    NG -->|Rutas UI| FE
    NG -->|/api/*| BE
    FE -->|Consumo API| NG

    BE -->|TypeORM| DB
    BE -->|Lectura/Escritura| UP

    FE -.->|GET /api/uploads/*| NG
    NG -->|Proxy /api/uploads/*| BE
```

## 2) Diagrama entidad-relacion (base de datos)
```mermaid
erDiagram
    USER {
      int id PK
      string firstname
      string lastname
      string username "UNIQUE"
      string email "UNIQUE"
      string password
      string area
      string jobTitle
      enum role "admin|manager|user"
      enum accessLevel "low|medium|high"
      datetime createdAt
    }

    PRODUCT_CATEGORY {
      int id PK
      string name "UNIQUE"
      string description
      datetime creationDate
    }

    UNIT {
      int id PK
      string name "UNIQUE"
      string abbreviation
      string description
      datetime creationDate
    }

    PRODUCT {
      int id PK
      string name "UNIQUE"
      int stock
      int minimumStock
      string description
      string imageUrl "nullable"
      datetime creationDate
      int productCategoryId FK
      int unitId FK "nullable"
    }

    REPORT {
      int id PK
      enum type "income|outcome"
      enum status "pending|approved|rejected"
      datetime createdAt
      int userId FK "nullable"
      int requestedById FK "nullable"
    }

    PRODUCT_REPORT {
      int id PK
      int quantity
      int reportId FK
      int productId FK
    }

    PRODUCT_CATEGORY ||--o{ PRODUCT : clasifica
    UNIT ||--o{ PRODUCT : unidad
    REPORT ||--o{ PRODUCT_REPORT : contiene
    PRODUCT ||--o{ PRODUCT_REPORT : detalle

    USER ||--o{ REPORT : ejecuta
    USER ||--o{ REPORT : solicita
```

## 3) Notas rapidas
- El frontend consume backend a traves de Nginx usando prefijo /api.
- Las imagenes de productos se sirven desde /uploads en backend y deben persistir en volumen.
- PRODUCT_REPORT materializa la relacion N:M entre REPORT y PRODUCT.
- REPORT mantiene dos relaciones opcionales a USER: quien ejecuta y quien solicita.
