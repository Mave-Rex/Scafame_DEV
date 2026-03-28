// src/app/services/history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private API = `${environment.API_BASE}/reports`;

  constructor(private http: HttpClient) {}

  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(this.API);
  }

  getReportById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }
}
