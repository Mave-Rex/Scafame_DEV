import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

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

export interface ReportFilters {
  type?: 'income' | 'outcome';
  status?: 'pending' | 'approved' | 'rejected';
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
  getAllByType(
    type: 'income' | 'outcome',
    status?: 'pending' | 'approved' | 'rejected'
  ): Observable<any[]> {
    return this.getAll({ type, status });
  }

  getAll(filters?: ReportFilters): Observable<any[]> {
    let params = new HttpParams();

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<any[]>(this.API, {
      headers: this.getAuthHeaders(),
      params,
    });
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
