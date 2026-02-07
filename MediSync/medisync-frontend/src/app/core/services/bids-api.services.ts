import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BidsApiService {
  private base = `${environment.apiBaseUrl}/v1/sm/bids`;

  constructor(private http: HttpClient) {}

  // GET /api/bids
  getAllBids(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  // OPTIONAL if your backend supports delete
  deleteBid(bidId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${bidId}`);
  }

  // ⚠️ These require backend endpoints (recommended)
  confirmBid(bidId: number): Observable<any> {
    // Example: PATCH /api/bids/{id}/status?value=Finalized
    return this.http.patch(`${this.base}/${bidId}/status?value=Finalized`, {});
  }

  cancelBid(bidId: number): Observable<any> {
    return this.http.patch(`${this.base}/${bidId}/status?value=Cancelled`, {});
  }
}