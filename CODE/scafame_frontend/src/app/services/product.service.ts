import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';

const API = `${environment.API_BASE}/products`;
import { Unit } from './unit.service';

export interface Product {
  id: number;
  name: string;
  stock: number;
  minimumStock: number;
  description?: string | null;
  imageUrl?: string | null;
  productCategory?: { id: number; name: string };
  unit?: Unit | null;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  productCategoryId?: number;
  minimumStock?: number;
  unitId?: number | null;
  imageUrl?: string | null;
}

export interface ProductFilters {
  q?: string;
  categoryId?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface ProductsPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private allProductsCache$?: Observable<Product[]>;

  constructor(private http: HttpClient) {}

  getAll(filters?: ProductFilters): Observable<Product[]> {
    const hasFilters = !!(
      filters?.q ||
      filters?.categoryId !== undefined ||
      filters?.inStock !== undefined ||
      filters?.lowStock !== undefined
    );

    if (!hasFilters) {
      if (!this.allProductsCache$) {
        this.allProductsCache$ = this.http.get<Product[]>(API).pipe(shareReplay(1));
      }
      return this.allProductsCache$;
    }

    let params = new HttpParams();

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.categoryId !== undefined) {
      params = params.set('categoryId', String(filters.categoryId));
    }

    if (filters?.inStock !== undefined) {
      params = params.set('inStock', String(filters.inStock));
    }

    if (filters?.lowStock !== undefined) {
      params = params.set('lowStock', String(filters.lowStock));
    }

    return this.http.get<Product[]>(API, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API}/${id}`);
  }

  getPage(page: number, limit = 20, filters?: ProductFilters): Observable<ProductsPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.categoryId !== undefined) {
      params = params.set('categoryId', String(filters.categoryId));
    }

    if (filters?.inStock !== undefined) {
      params = params.set('inStock', String(filters.inStock));
    }

    if (filters?.lowStock !== undefined) {
      params = params.set('lowStock', String(filters.lowStock));
    }

    return this.http.get<ProductsPage | Product[]>(API, { params }).pipe(
      switchMap((resp) => {
        // Compatibilidad: si backend responde array (sin paginación), paginamos localmente.
        if (Array.isArray(resp)) {
          return of(this.paginate(this.applyClientFilters(resp, filters), page, limit));
        }

        const items = resp.items ?? [];
        const filteredItems = this.applyClientFilters(items, filters);

        // Si los filtros no se reflejan en la página recibida, hacemos fallback a listado filtrado completo.
        const hasFilters = !!(filters?.q || filters?.categoryId !== undefined || filters?.inStock !== undefined || filters?.lowStock !== undefined);
        const serverPageLooksUnfiltered = hasFilters && filteredItems.length !== items.length;

        if (serverPageLooksUnfiltered) {
          return this.getAll(filters).pipe(
            map((all) => this.paginate(this.applyClientFilters(all, filters), page, limit)),
          );
        }

        return of({
          items,
          total: resp.total ?? items.length,
          page: resp.page ?? page,
          limit: resp.limit ?? limit,
          totalPages: resp.totalPages ?? Math.max(1, Math.ceil((resp.total ?? items.length) / (resp.limit ?? limit))),
        } as ProductsPage);
      }),
    );
  }

  private paginate(items: Product[], page: number, limit: number): ProductsPage {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const total = items.length;
    const start = (safePage - 1) * safeLimit;
    const pagedItems = items.slice(start, start + safeLimit);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      items: pagedItems,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }

  private applyClientFilters(items: Product[], filters?: ProductFilters): Product[] {
    if (!filters) return items;

    const q = (filters.q ?? '').trim().toLowerCase();
    const categoryId = filters.categoryId;
    const requireInStock = filters.inStock === true;
    const requireLowStock = filters.lowStock === true;

    return items.filter((p) => {
      if (categoryId !== undefined && p.productCategory?.id !== categoryId) {
        return false;
      }

      if (requireInStock && !(Number(p.stock) > 0)) {
        return false;
      }

      if (requireLowStock && !(Number(p.stock) <= Number(p.minimumStock))) {
        return false;
      }

      if (q) {
        const name = (p.name ?? '').toLowerCase();
        const description = (p.description ?? '').toLowerCase();
        if (!name.includes(q) && !description.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }

  // Versión corregida para aceptar FormData (con imagen)
  create(data: FormData): Observable<Product> {
    return this.http.post<Product>(API, data).pipe(
      tap(() => this.invalidateCache()),
    );
  }

  update(id: number, data: ProductUpdatePayload | FormData): Observable<Product> {
    return this.http.patch<Product>(`${API}/${id}`, data).pipe(
      tap(() => this.invalidateCache()),
    );
  }

  updateWithImage(
    id: number,
    payload: ProductUpdatePayload,
    imageFile?: File | null,
    removeImage = false,
  ): Observable<Product> {
    const fd = new FormData();

    if (payload.name !== undefined) fd.append('name', String(payload.name));
    if (payload.description !== undefined) fd.append('description', String(payload.description));
    if (payload.productCategoryId !== undefined) fd.append('productCategoryId', String(payload.productCategoryId));
    if (payload.minimumStock !== undefined) fd.append('minimumStock', String(payload.minimumStock));
    if (payload.unitId !== undefined && payload.unitId !== null) fd.append('unitId', String(payload.unitId));
    if (payload.unitId === null) fd.append('unitId', 'null');

    if (imageFile) {
      fd.append('image', imageFile);
    }

    if (removeImage) {
      fd.append('removeImage', 'true');
    }

    return this.update(id, fd);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/${id}`).pipe(
      tap(() => this.invalidateCache()),
    );
  }

  private invalidateCache(): void {
    this.allProductsCache$ = undefined;
  }
}
