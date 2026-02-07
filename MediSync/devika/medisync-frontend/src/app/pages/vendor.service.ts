import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VendorApiResponse {
  vendorId: number;
  userId: number;
  businessName: string;
  email?: string;
  phoneNumber?: string;
  gstNumber: string;
  licenseNumber: string;
  address: string;
  status: string; // from DB (ex: PENDING/APPROVED/REJECTED/VERIFIED etc.)
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly baseUrl = 'http://localhost:7000/api/v1/vendors';

  constructor(private http: HttpClient) {}

  getVendorById(id: number): Observable<VendorApiResponse> {
    return this.http.get<VendorApiResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Optional later: update endpoint (only if your backend supports PUT/PATCH)
   * updateVendor(id: number, payload: Partial<VendorApiResponse>) { ... }
   */
}