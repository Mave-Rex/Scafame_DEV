import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

export interface Unit {
  id: number;
  name: string;
  abbreviation?: string | null;
  description?: string | null;
  creationDate?: string;
}

@Injectable({ providedIn: 'root' })
export class UnitService {
  private readonly BASE = `${environment.API_BASE}/units`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Unit[]> { return this.http.get<Unit[]>(this.BASE); }
  getById(id: number): Observable<Unit> { return this.http.get<Unit>(`${this.BASE}/${id}`); }
  create(data: { name: string; abbreviation?: string; description?: string }): Observable<Unit> {
    return this.http.post<Unit>(this.BASE, data);
  }
  update(id: number, data: Partial<Unit>): Observable<Unit> {
    return this.http.patch<Unit>(`${this.BASE}/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
