import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod'; // ✅ recomendado (no .prod)

const PRODUCTS_API = `${environment.API_BASE}/products`;
const REPORTS_API = `${environment.API_BASE}/reports`;

export interface ProductDto {
  id: number;
  name: string;
  stock: number;
  minimumStock: number;
  productCategory?: { name: string };
  unit?: { name: string };
}

@Injectable({ providedIn: 'root' })
export class InventoryReportService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(PRODUCTS_API);
  }

  // ✅ endpoint correcto
  downloadInventoryXlsx(): Observable<Blob> {
    return this.http.get(`${REPORTS_API}/inventory/excel`, {
      responseType: 'blob',
    });
  }

  buildCategoryStock(products: ProductDto[]) {
    const mapCat = new Map<string, number>();
    for (const p of products) {
      const cat = p.productCategory?.name ?? 'Sin categoría';
      mapCat.set(cat, (mapCat.get(cat) ?? 0) + (p.stock ?? 0));
    }
    return Array.from(mapCat.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }

  countLowStock(products: ProductDto[]) {
    return products.filter(p => (p.stock ?? 0) <= (p.minimumStock ?? 0)).length;
  }

  totalUnits(products: ProductDto[]) {
    return products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  }
}
