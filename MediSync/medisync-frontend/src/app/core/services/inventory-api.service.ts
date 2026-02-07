import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PharmacistInventoryResponse {
  productId: number;
  medicineName: string;
  category: string;
  batchNumber: number;
  batchId: number;
  expiryDate: string; // ISO date string
  quantity: number;
  price: number;
  unit: string;
  daysToExpiry: number;
  status: 'ok' | 'near-expiry' | 'expired';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private apiUrl = environment.apiBaseUrl + '/api/pharmacist/inventory';

  constructor(private http: HttpClient) {}

  /**
   * Get inventory with pagination, search, and sorting
   */
  getInventory(
    storeId: number,
    search?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'expiryAsc'
  ): Observable<PageResponse<PharmacistInventoryResponse>> {
    let params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<PharmacistInventoryResponse>>(this.apiUrl, { params });
  }

  /**
   * Get full inventory list without pagination
   */
  getInventoryList(storeId: number, search?: string): Observable<PharmacistInventoryResponse[]> {
    let params = new HttpParams().set('storeId', storeId.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PharmacistInventoryResponse[]>(`${this.apiUrl}/list`, { params });
  }

  /**
   * Get low stock products
   */
  getLowStock(storeId: number, threshold: number = 10): Observable<PharmacistInventoryResponse[]> {
    const params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('threshold', threshold.toString());

    return this.http.get<PharmacistInventoryResponse[]>(`${this.apiUrl}/low-stock`, { params });
  }

  /**
   * Get specific product details
   */
  getProductDetails(productId: number): Observable<PharmacistInventoryResponse> {
    return this.http.get<PharmacistInventoryResponse>(`${this.apiUrl}/${productId}`);
  }
}