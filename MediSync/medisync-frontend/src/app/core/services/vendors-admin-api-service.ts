import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, forkJoin, map, switchMap } from 'rxjs';

export type DocStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface VendorSummary {
  vendorId: number;
  businessName: string | null;
  email: string | null;
  gstNumber: string | null;
  licenseNumber: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface VendorDocumentAdminDto {
  docId: number;
  docType: string;
  fileUrl: string;
  status: DocStatus;
  verifiedByUserId?: number | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  remarks?: string | null;
}

export interface VendorDetailDto {
  vendorId: number;
  businessName: string | null;
  email: string | null;
  phoneNumber: string | null;
  gstNumber: string | null;
  licenseNumber: string | null;
  address: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  documents: VendorDocumentAdminDto[];
}

@Injectable({ providedIn: 'root' })
export class VendorsAdminApiService {
  // normalize base (avoid double slashes)
  private base = (environment.apiBaseUrl || '').replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  listVendors(status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL') {
    const params = new HttpParams().set('status', status);
    return this.http.get<VendorSummary[]>(`${this.base}/v1/vendors`, {
      params,
      withCredentials: true, // session-based auth
    });
  }

  getVendorDetail(vendorId: number) {
    return this.http.get<VendorDetailDto>(`${this.base}/v1/vendors/${vendorId}`, {
      withCredentials: true,
    });
  }

  verifyDocument(docId: number, remarks?: string) {
    return this.http.post<VendorDocumentAdminDto>(
      `${this.base}/v1/vendors/documents/${docId}/verify`,
      { remarks: remarks ?? null },
      { withCredentials: true }
    );
  }

  rejectDocument(docId: number, remarks: string) {
    return this.http.post<VendorDocumentAdminDto>(
      `${this.base}/v1/vendors/documents/${docId}/reject`,
      { remarks },
      { withCredentials: true }
    );
  }

  // Backend file endpoint (serves local files inline)
  docFileUrl(docId: number) {
    return `${this.base}/v1/vendors/documents/${docId}/file`;
  }

  /**
   * Aggregate all vendor documents by:
   *  1) GET /vendors (ALL)
   *  2) For each vendor → GET /vendors/{id} to get its documents
   * This is fine to start; we can add a dedicated server endpoint later.
   */
  listAllDocumentsAggregated(): Observable<Array<{ doc: VendorDocumentAdminDto; vendor: VendorDetailDto }>> {
    return this.listVendors('ALL').pipe(
      switchMap(vendors => {
        if (!vendors?.length) return of([]);
        const detailCalls = vendors.map(v => this.getVendorDetail(v.vendorId));
        return forkJoin(detailCalls).pipe(
          map(details => {
            const rows: Array<{ doc: VendorDocumentAdminDto; vendor: VendorDetailDto }> = [];
            details.forEach(vd => vd.documents?.forEach(doc => rows.push({ doc, vendor: vd })));
            return rows;
          })
        );
      })
    );
  }
}