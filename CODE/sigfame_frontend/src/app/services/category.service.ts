import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/product-categories';

export interface Category {
  id: number;
  name: string;
  description?: string;
  area: {
    id: number;
    name: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(API);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${API}/${id}`);
  }

  create(data: { name: string; description?: string; areaId: number }): Observable<Category> {
    return this.http.post<Category>(API, data);
  }

  update(id: number, data: Partial<{ name: string; description: string; areaId: number }>): Observable<Category> {
    return this.http.patch<Category>(`${API}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/${id}`);
  }
}
