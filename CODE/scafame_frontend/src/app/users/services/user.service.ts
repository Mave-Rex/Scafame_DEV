import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password?: string;
  area: string;
  jobTitle: string;
  role: 'admin' | 'user' | 'manager';
  accessLevel: 'low' | 'medium' | 'high';
  createdAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = `${environment.API_BASE}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  changePassword(id: number, body: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/password`, body);
  }
}
