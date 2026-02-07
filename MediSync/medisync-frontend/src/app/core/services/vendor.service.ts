import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface VendorApiResponse {
  vendorId: number;
  userId: number;
  businessName: string;
  email?: string;
  phoneNumber?: string;
  gstNumber: string;
  licenseNumber: string;
  address: string;
  status: string; // PENDING/APPROVED/REJECTED/VERIFIED etc.
}

/**
 * ✅ Request body for POST /api/v1/vendors/register
 * Matches backend VendorRegisterRequest
 */
export interface VendorRegisterRequest {
  businessName: string;
  email?: string;
  phoneNumber?: string;

  // ✅ backend accepts + requires this (your UI ensures it)
  password?: string;

  gstNumber: string;
  licenseNumber: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly baseUrl = 'http://localhost:7000/api/v1/vendors';

  constructor(private http: HttpClient) {}

  /** GET /api/v1/vendors/{id} */
  getVendorById(id: number): Observable<VendorApiResponse> {
    return this.http.get<VendorApiResponse>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /** GET /api/v1/vendors/me */
  getVendorProfile(): Observable<VendorApiResponse> {
    return this.http.get<VendorApiResponse>(`${this.baseUrl}/me`, {
      withCredentials: true
    });
  }

  /** GET /api/v1/vendors/awarded-vendors */
  getAwardedVendors(): Observable<VendorApiResponse[]> {
    return this.http.get<VendorApiResponse[]>(`${this.baseUrl}/awarded-vendors`, {
      withCredentials: true
    });
  }

  /** ✅ POST /api/v1/vendors/register */
  registerVendor(payload: VendorRegisterRequest): Observable<VendorApiResponse> {
    return this.http
      .post<VendorApiResponse>(`${this.baseUrl}/register`, payload)
      .pipe(catchError((err) => throwError(() => this.extractErrorMessage(err))));
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim()) return err.error;

      if (err.error && typeof err.error === 'object' && (err.error as any).message) {
        return (err.error as any).message;
      }

      if (err.error && typeof err.error === 'object') {
        const e: any = err.error;
        if (Array.isArray(e.errors) && e.errors.length) return e.errors.join('\n');
        if (Array.isArray(e.fieldErrors) && e.fieldErrors.length) {
          return e.fieldErrors.map((x: any) => `${x.field}: ${x.message}`).join('\n');
        }
      }

      if (err.status === 0) return 'Cannot reach server.';
      return err.message || 'Request failed.';
    }
    return 'Request failed.';
  }
}