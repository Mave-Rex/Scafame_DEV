import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface Usuario {
  username: string;
  role: string;
  area: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/auth';
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('access_token');
    this.isAuthenticatedSignal.set(!!token);
  }

  login(user: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.API_URL}/login`, {
      user,
      password,
    });
  }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.isAuthenticatedSignal.set(true);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get authSignal() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getPerfilUsuario(): Observable<Usuario> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Usuario>(`${this.API_URL}/profile`, { headers });
  }
}
