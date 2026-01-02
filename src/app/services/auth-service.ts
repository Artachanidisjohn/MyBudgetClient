import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { API_BASE } from '../config';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: { id: number; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_BASE}/api/Auth`;
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token found');

    return this.http
      .post<{ token: string; refreshToken: string }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('refreshToken', res.refreshToken);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

isLoggedIn(): boolean {
  const token = this.getToken();
  if (!token) return false;

  const helper = new JwtHelperService();
  const exp = helper.getTokenExpirationDate(token);
  const expired = helper.isTokenExpired(token);

  console.log('TOKEN exp:', exp, 'expired:', expired, 'now:', new Date());
  return !expired;
}

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }
}
