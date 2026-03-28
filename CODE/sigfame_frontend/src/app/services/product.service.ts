import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/products';

export interface Product {
  id: number;
  name: string;
  stock: number;
  minimumStock: number;
  description?: string;
  productCategory: {
    id: number;
    name: string;
  };
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

  create(data: {
    name: string;
    productCategoryId: number;
    minimumStock: number;
    description?: string;
  }): Observable<Product> {
    return this.http.post<Product>(API, data);
  }

  update(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${API}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/${id}`);
  }
}
