# Software Requirements - Optimization Addendum

Date: 2026-04-06
Project: SCAFAME

## Purpose
This addendum records backend and frontend performance/usability improvements implemented after the original SRS baseline.

## Implemented Changes

### 1) Reports query optimization
- Backend endpoint GET /reports supports optional query parameters:
  - type: income | outcome
  - status: pending | approved | rejected
- Validation behavior:
  - Invalid type or status returns 400 Bad Request.
- Frontend behavior update:
  - Report retrieval uses server-side filters instead of downloading all reports and filtering on client side.

#### Functional impact
- Removals management requests only outcome reports in pending state.
- Removals entry-check requests only outcome reports in pending state.
- Same visible behavior with lower payload and less client processing.

### 2) Products query optimization
- Backend endpoint GET /products supports optional query parameters:
  - q: free-text search over product name/description (case-insensitive)
  - categoryId: numeric category filter
  - inStock: boolean (true/false or 1/0)
  - lowStock: boolean (true/false or 1/0)
- Validation behavior:
  - Invalid categoryId or boolean values return 400 Bad Request.
- Frontend behavior update:
  - Product service can pass optional filters.
  - Removal product-selection requests only products with stock (inStock=true).

#### Functional impact
- Removal selection excludes zero-stock products at API level.
- Existing views calling GET /products without filters remain compatible.

### 3) Frontend catalog caching optimization
- Frontend services now cache full-catalog getAll() requests for:
  - Products
  - Product categories
  - Units
- Caching implementation:
  - In-memory observable caching using shareReplay(1).
  - Automatic invalidation on create/update/delete operations.

#### Functional impact
- UI behavior remains unchanged.
- Data consistency preserved after mutations due to explicit cache invalidation.

### 4) Report transaction stock-update optimization
- Backend transaction logic optimized in two critical paths:
  - INCOME reports: affected products updated and persisted in a batch save operation.
  - OUTCOME approvals: line quantities aggregated by product before stock validation and deduction.
  - OUTCOME stock deductions persisted with batch save operation.

#### Functional impact
- Reduced database write round-trips during report processing.
- Improved stock-validation consistency when same product appears multiple times in report lines.
- No API contract changes for frontend consumers.

### 5) Database indexing optimization (TypeORM entities)
- Added indexes to optimize frequent filters, ordering, and relation joins:
  - Product: indexes for stock/creationDate and category/unit foreign keys.
  - Report: composite index type-status-createdAt, plus createdAt and user/requestedBy foreign keys.
  - ProductReport: indexes for report and product foreign keys.

#### Functional impact
- No API behavior changes.
- Faster query execution expected for inventory/report flows under larger datasets.

### 6) Product image edit-flow reliability fix
- Product update flow stabilized for image changes during edit:
  - Frontend uses explicit multipart update method for product image upload/remove.
  - Backend product update endpoint supports removeImage=true and nullable imageUrl handling.
  - Product entity typing aligned to nullable image URL (string | null).

#### Functional impact
- Editing existing product to add/replace an image updates consistently.
- Removing an existing image works with explicit backend support.

### 7) Product image cache-busting in inventory views
- Added automatic cache-busting for uploads URLs in image URL resolution.
- After product image edit/remove, frontend updates a local image-version key to force browser refresh of image URLs.

#### Functional impact
- Updated product images become visible in inventory/product tables without stale browser cache artifacts.

### 8) Product visualization and sidebar usability improvements
- Product table improvements:
  - Compact table layout with sticky filter bar and aligned columns.
  - Larger product thumbnails.
  - Correct image URL resolution in inventory tables.
- Sidebar/Header improvements:
  - Collapsible sidebar controlled by hamburger click.
  - Removed hover auto-expand behavior.
  - Sidebar icon/button positioning adjusted for collapsed and expanded states.

#### Functional impact
- Better density and readability of product information.
- More predictable navigation behavior with consistent sidebar control.

## Non-Functional Requirement Alignment
- Performance:
  - Reduced payload sizes for reports and product-selection scenarios.
  - Reduced client-side filtering work.
  - Reduced duplicate frontend requests for static/slow-changing catalogs.
  - Reduced write overhead in inventory stock-update transactions.
  - Improved database query performance via targeted indexing.
- Reliability:
  - Product image updates in edit flow are deterministic across create/edit/remove scenarios.
  - Inventory image rendering is resilient to browser cache staleness.
- Maintainability:
  - Query/filter behavior centralized in backend.
  - Frontend services expose explicit filter and update interfaces.
  - Catalog access pattern standardized across services.

## Validation Evidence
- Backend build: successful (npm run build)
- Frontend build: successful (npm run build -- --no-progress)
- Frontend emits non-blocking CommonJS warnings unrelated to these functional changes.

## Suggested Next Optimization Wave
- Add pagination controls to additional product-heavy views beyond inventory listing.
- Add date-range filtering to history/report views to avoid full report downloads.
- Add lightweight request timing logs on critical endpoints for measurable before/after benchmarks.