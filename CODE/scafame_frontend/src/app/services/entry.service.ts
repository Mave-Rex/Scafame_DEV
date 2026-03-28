import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

interface SelectedProduct {
  id: number;
  nombre: string;
  cantidad: number;
  imagen?: string | null;
}

interface CreateReportPayload {
  type: 'INCOME' | 'OUTCOME';
  items: { productId: number; quantity: number }[];
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EntryService {
  private selectedProducts: SelectedProduct[] = [];

  constructor(private http: HttpClient) {}

  setSelectedProducts(products: SelectedProduct[]): void {
    this.selectedProducts = products;
  }

  getSelectedProducts(): SelectedProduct[] {
    return this.selectedProducts;
  }

  clearSelectedProducts(): void {
    this.selectedProducts = [];
  }

  submitEntry(products: SelectedProduct[]): Observable<any> {
    const token = localStorage.getItem('access_token') || '';
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    const payload: CreateReportPayload = {
      type: 'INCOME',
      items: products.map((p) => ({
        productId: Number(p.id),
        quantity: Number(p.cantidad),
      })),
    };

    return this.http.post(`${environment.API_BASE}/reports`, payload, { headers });
  }
}
