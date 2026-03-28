import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/areas';

export interface Area {
  id: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class AreaService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Area[]> {
    return this.http.get<Area[]>(API);
  }

  getById(id: number): Observable<Area> {
    return this.http.get<Area>(`${API}/${id}`);
  }

  create(data: { name: string; description?: string }): Observable<Area> {
    return this.http.post<Area>(API, data);
  }

  update(id: number, data: Partial<Area>): Observable<Area> {
    return this.http.patch<Area>(`${API}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/${id}`);
  }
}
