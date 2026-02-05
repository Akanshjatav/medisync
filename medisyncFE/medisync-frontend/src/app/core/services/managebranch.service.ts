import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {environment} from '../../../environments/environment';

export type UserStatus = 'Active' | 'Inactive';
export type UserRole = 'PHARMACIST' | 'MANAGER';

/** What UI uses in lists/screens */
export interface UserDto {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;   // UI-friendly
  roleName: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

/** ✅ Backend expects this EXACT shape */
export interface CreateUserRequest {
  roleName: UserRole;        // ✅ backend expects roleName
  isActive?: boolean;        // ✅ backend expects isActive
  name: string;
  email: string;
  phoneNumber?: string | null; // ✅ backend expects phoneNumber
}

/** Optional: what your UI form currently holds */
export interface CreateUserRequestUi {
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  roleName: UserRole;
}

/** Update payload (backend shape) */
export interface UpdateUserRequestBackend {
  roleName?: UserRole;
  isActive?: boolean;
  name?: string;
  email?: string;
  phoneNumber?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  // ✅ Your controller: @RequestMapping("/api/v1/ho") + @PostMapping("/users")
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/ho/users`;

  constructor(private http: HttpClient) {}

  /** ✅ If you want to send UI-form values directly */
  createUserFromUi(ui: CreateUserRequestUi): Observable<UserDto> {
    const payload: CreateUserRequest = {
      roleName: ui.roleName,
      isActive: ui.status === 'Active',
      name: ui.name,
      email: ui.email,
      phoneNumber: ui.phone || null
    };
    return this.createUser(payload);
  }

  /** ✅ Create user (backend DTO shape) */
  createUser(payload: CreateUserRequest): Observable<UserDto> {
  return this.http.post<UserDto>(this.baseUrl, payload).pipe(
    map(this.normalizeUser),
    catchError(this.handleError)
  );
}

  /** Full update (PUT) - backend shape */
  updateUser(id: string | number, payload: CreateUserRequest): Observable<UserDto> {
    return this.http.put<any>(`${this.baseUrl}/${encodeURIComponent(String(id))}`, payload).pipe(
      map(this.normalizeUser),
      catchError(this.handleError)
    );
  }

  /** Partial update (PATCH) - backend shape */
  patchUser(id: string | number, payload: UpdateUserRequestBackend): Observable<UserDto> {
    return this.http.patch<any>(`${this.baseUrl}/${encodeURIComponent(String(id))}`, payload).pipe(
      map(this.normalizeUser),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(String(id))}`).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: string | number): Observable<UserDto> {
    return this.http.get<any>(`${this.baseUrl}/${encodeURIComponent(String(id))}`).pipe(
      map(this.normalizeUser),
      catchError(this.handleError)
    );
  }

  getUsers(options?: {
    status?: UserStatus;
    roleName?: UserRole;
    search?: string;
    page?: number;
    size?: number;
  }): Observable<UserDto[]> {
    let params = new HttpParams();
    if (options?.status) params = params.set('status', options.status);
    if (options?.roleName) params = params.set('roleName', options.roleName);
    if (options?.search) params = params.set('search', options.search);
    if (options?.page !== undefined) params = params.set('page', String(options.page));
    if (options?.size !== undefined) params = params.set('size', String(options.size));

    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map(list => (Array.isArray(list) ? list.map(this.normalizeUser) : [])),
      catchError(this.handleError)
    );
  }

  /** ✅ Convert backend response -> UI model */
  private normalizeUser = (u: any): UserDto => ({
  id: u?.id ?? u?.userId ?? u?.user_id,
  name: u?.name ?? '',
  email: u?.email ?? '',
  phone: u?.phone ?? u?.phoneNumber ?? u?.phone_number ?? '',
  status: (u?.isActive ?? false) ? 'Active' : 'Inactive',
  roleName: (u?.roleName ?? 'PHARMACIST') as UserRole,
  createdAt: u?.createdAt ?? u?.created_at,
  updatedAt: u?.updatedAt ?? u?.updated_at
});

  private handleError(err: HttpErrorResponse) {
    const message =
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}
