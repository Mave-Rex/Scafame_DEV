import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

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
  private allCategoriesCache$?: Observable<Category[]>;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    if (!this.allCategoriesCache$) {
      this.allCategoriesCache$ = this.http.get<Category[]>(this.API).pipe(shareReplay(1));
    }
    return this.allCategoriesCache$;
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API}/${id}`);
  }

  create(data: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(this.API, data).pipe(
      tap(() => this.invalidateCache()),
    );
  }

  update(
    id: number,
    data: Partial<{ name: string; description: string }>
  ): Observable<Category> {
    return this.http.patch<Category>(`${this.API}/${id}`, data).pipe(
      tap(() => this.invalidateCache()),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      tap(() => this.invalidateCache()),
    );
  }

  private invalidateCache(): void {
    this.allCategoriesCache$ = undefined;
  }
}