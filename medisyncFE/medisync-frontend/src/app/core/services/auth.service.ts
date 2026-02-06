import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'PHARMACIST' | 'VENDOR';
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // 🔑 Role state (THIS FIXES SIDEBAR ISSUE)
  private roleSubject = new BehaviorSubject<string>('');
  role$ = this.roleSubject.asObservable();

  constructor() {
    // Load role from storage on refresh
    const storedRole = localStorage.getItem('USER_ROLE');
    if (storedRole) {
      this.roleSubject.next(storedRole);
    }
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/v1/auth/login`, payload)
      .pipe(
        tap(response => {
          // ✅ SAVE ROLE IMMEDIATELY AFTER BACKEND RESPONSE
          localStorage.setItem('USER_ROLE', response.role);
          this.roleSubject.next(response.role);
        }),
        catchError(err => throwError(() => this.extractErrorMessage(err)))
      );
  }

  // Optional getter (useful in guards)
  getRole(): string {
    return this.roleSubject.value;
  }

  logout(): void {
    localStorage.removeItem('USER_ROLE');
    this.roleSubject.next('');
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim()) return err.error;
      if (err.error && typeof err.error === 'object' && err.error.message)
        return err.error.message;
      if (err.status === 0) return 'Cannot reach server.';
      return err.message || 'Login failed.';
    }
    return 'Login failed.';
  }
}
