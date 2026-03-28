import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';

const API = `${environment.API_BASE}/product-categories`;

export interface Category {
  id: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = `${environment.API_BASE}/product-categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API}/${id}`);
  }

  create(data: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(this.API, data);
  }

  update(
    id: number,
    data: Partial<{ name: string; description: string }>
  ): Observable<Category> {
    return this.http.patch<Category>(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}