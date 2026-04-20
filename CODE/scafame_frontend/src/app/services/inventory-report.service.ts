import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod'; // ✅ recomendado (no .prod)

const PRODUCTS_API = `${environment.API_BASE}/products`;
const REPORTS_API = `${environment.API_BASE}/reports`;

export interface ProductDto {
  id: number;
  name: string;
  stock: number;
  minimumStock: number;
  description?: string;
  creationDate?: string;
  productCategory?: { id: number; name: string };
  unit?: { name: string };
}

export interface InventoryReportFilters {
  q?: string;
  categoryId?: number;
  categoryName?: string;
  unitName?: string;
}

export interface TopConsumedByAreaFilters {
  area?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryReportService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(PRODUCTS_API);
  }

  // ✅ endpoint correcto
  downloadInventoryXlsx(filters?: InventoryReportFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.q) {
      params = params.set('q', filters.q);
    }

    if (filters?.categoryId !== undefined) {
      params = params.set('categoryId', String(filters.categoryId));
    }

    if (filters?.categoryName) {
      params = params.set('categoryName', filters.categoryName);
    }

    if (filters?.unitName) {
      params = params.set('unitName', filters.unitName);
    }

    return this.http.get(`${REPORTS_API}/inventory/excel`, {
      params,
      responseType: 'blob',
    });
  }

  downloadTopConsumedByAreaXlsx(filters?: TopConsumedByAreaFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.area) {
      params = params.set('area', filters.area);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get(`${REPORTS_API}/outcomes/top-products/excel`, {
      params,
      responseType: 'blob',
    });
  }

  downloadTopConsumedByAreaXlsxResponse(filters?: TopConsumedByAreaFilters): Observable<HttpResponse<Blob>> {
    let params = new HttpParams();

    if (filters?.area) {
      params = params.set('area', filters.area);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get(`${REPORTS_API}/outcomes/top-products/excel`, {
      params,
      observe: 'response',
      responseType: 'blob',
    });
  }

  buildCategoryStock(products: ProductDto[]) {
    const mapCat = new Map<string, number>();
    for (const p of products) {
      const cat = p.productCategory?.name ?? 'Sin categoría';
      mapCat.set(cat, (mapCat.get(cat) ?? 0) + (p.stock ?? 0));
    }
    return Array.from(mapCat.entries()).sort((a, b) => b[1] - a[1]);
  }

  countLowStock(products: ProductDto[]) {
    return products.filter(p => (p.stock ?? 0) <= (p.minimumStock ?? 0)).length;
  }

  totalUnits(products: ProductDto[]) {
    return products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  }
}
