import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import {HttpClie}
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  roleId: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<LoginResponse> {
    const url = `${this.baseUrl}/v1/auth/login`;
    console.log('LOGIN URL:', url);

    return this.http.post<LoginResponse>(url, payload).pipe(
      catchError((err) => throwError(() => this.extractErrorMessage(err)))
    );
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      // Backend sent a string error
      if (typeof err.error === 'string' && err.error.trim()) return err.error;

      // Backend sent JSON error (common: { message: "..." })
      if (err.error && typeof err.error === 'object') {
        const anyErr = err.error as any;
        if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
          return anyErr.message;
        }
      }

      // Network / CORS / server down
      if (err.status === 0) return 'Cannot reach server.';

      return err.message || 'Login failed.';
    }

    return 'Login failed.';
  }
}