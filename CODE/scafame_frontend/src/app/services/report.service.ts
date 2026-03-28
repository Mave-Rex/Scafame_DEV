import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';

export interface ReportItem {
  productId: number;
  quantity: number;
}

export interface CreateReportPayload {
  items: ReportItem[];
  type: 'income' | 'outcome';
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private API = `${environment.API_BASE}/reports`;

  constructor(private http: HttpClient) {}

  // ——————————— helpers ———————————
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // ——————————— create ———————————
  /** Crear retiro (outcome). El userId lo obtiene el backend del JWT */
  createOutcomeReport(data: { products: ReportItem[]; description?: string | null }): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload: CreateReportPayload = {
      type: 'outcome',
      items: data.products,           // estandarizamos a "items"
      description: data.description ?? null,
    };
    return this.http.post(this.API, payload, { headers });
  }

  /** Crear ingreso (income). El userId lo obtiene el backend del JWT */
  createIncomeReport(data: { products: ReportItem[]; description?: string | null }): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload: CreateReportPayload = {
      type: 'income',
      items: data.products,           // estandarizamos a "items"
      description: data.description ?? null,
    };
    return this.http.post(this.API, payload, { headers });
  }

  // ——————————— read ———————————
  /** OJO: el backend actual NO filtra por query ?type=...; filtramos en cliente */
  getAllByType(type: 'income' | 'outcome'): Observable<any[]> {
    return this.getAll().pipe(map(list => list.filter(r => r?.type === type)));
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.API, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`, { headers: this.getAuthHeaders() });
  }

  getManyByIds(ids: number[]): Observable<any[]> {
    return forkJoin(ids.map(id => this.getById(id)));
  }

  // ——————————— actions ———————————
  approveReport(id: number): Observable<any> {
    return this.http.patch(`${this.API}/${id}/approve`, {}, { headers: this.getAuthHeaders() });
  }

  rejectReport(id: number): Observable<any> {
    return this.http.patch(`${this.API}/${id}/reject`, {}, { headers: this.getAuthHeaders() });
  }
}
