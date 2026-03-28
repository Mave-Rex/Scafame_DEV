import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(API);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API}/${id}`);
  }

  // Versión corregida para aceptar FormData (con imagen)
  create(data: FormData): Observable<Product> {
    return this.http.post<Product>(API, data);
  }

  update(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${API}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/${id}`);
  }
}
