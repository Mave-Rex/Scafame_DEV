import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';

interface Usuario {
  id: number;
  username: string;
  role: string;
  area: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.API_BASE}/auth`;
  private readonly EXP_KEY = 'exp_ms'; // expiración del access_token en milisegundos
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('access_token');
    // si hay token pero está vencido, cerramos sesión inmediata
    if (token && this.isTokenExpired()) {
      this.logout(false); // no redirige aquí para evitar bucles en constructor
      this.router.navigate(['/auth/login']);
    } else {
      this.isAuthenticatedSignal.set(!!token);
    }
  }

  // ========= LOGIN =========
  login(username: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.API_URL}/login`, { username, password })
      .pipe(
        tap((response) => {
          this.saveToken(response.access_token);
        })
      );
  }

  // ========= SAVE TOKEN & DECODE =========
  private decodeJwt<T = any>(token: string): T | null {
    try {
      const payload = token.split('.')[1];
      // Compatibilidad con base64url
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);

    const payload = this.decodeJwt<{ role?: string; sub?: string | number; exp?: number }>(token) || {};

    if (payload.role) {
      localStorage.setItem('role', String(payload.role));
    } else {
      console.warn('El token no contiene un campo "role".');
      localStorage.removeItem('role');
    }

    if (payload.sub !== undefined && payload.sub !== null) {
      localStorage.setItem('userId', String(payload.sub));
    } else {
      console.warn('El token no contiene un campo "sub" (userId).');
      localStorage.removeItem('userId');
    }

    if (payload.exp) {
      // exp viene en segundos UNIX -> guardamos en ms
      localStorage.setItem(this.EXP_KEY, String(payload.exp * 1000));
    } else {
      console.warn('El token no contiene "exp". Se considerará expirado al primer chequeo.');
      localStorage.removeItem(this.EXP_KEY);
    }

    // si el token ya llegó vencido, cerramos de inmediato
    if (this.isTokenExpired()) {
      this.logout(false);
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isAuthenticatedSignal.set(true);
  }

  // ========= EXPIRATION CHECK =========
  /**
   * Devuelve true si el token NO existe o ya expiró.
   * @param skewMs margen para desfase de reloj (por defecto 30s)
   */
  isTokenExpired(skewMs: number = 30000): boolean {
    const token = localStorage.getItem('access_token');
    const expMsStr = localStorage.getItem(this.EXP_KEY);
    if (!token || !expMsStr) return true;

    const expMs = Number(expMsStr);
    if (Number.isNaN(expMs)) return true;

    return Date.now() >= (expMs - skewMs);
  }

  // ========= LOGOUT =========
  /**
   * @param navigate si true, redirige a /auth/login (por defecto true)
   */
  logout(navigate: boolean = true): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem(this.EXP_KEY);
    this.isAuthenticatedSignal.set(false);
    if (navigate) this.router.navigate(['/auth/login']);
  }

  // ========= HELPERS =========
  /**
   * Equivale a "hay token y NO expiró".
   * Útil para checks rápidos (por ejemplo, en Header/Sidebar).
   */
  isAuthenticated(): boolean {
    const hasToken = !!localStorage.getItem('access_token');
    if (!hasToken) return false;
    return !this.isTokenExpired();
  }

  get authSignal() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? Number(id) : null;
  }

  // Perfil desde backend (usa interceptor de Authorization)
  getPerfilUsuario(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/profile`);
  }
}
