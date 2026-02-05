import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ------- Request Types matching backend DTO -------

export interface ProductCreateRequest {
  productName: string;
  category: string;
  quantityTotal: number;
  price: number;
  expiryDate: string;   // yyyy-MM-dd
}

export interface BatchCreateRequest {
  vendorId: number;
  deliveryDate: string; // yyyy-MM-dd -> LocalDate
  products: ProductCreateRequest[];
}

// ------- Response Types (based on your controller response) -------
export interface ProductResponse {
  productId: number;
  productName: string;
  category: string;
  quantityTotal: number;
  price: number;
  expiryDate: string;
  batchId: number;
}

export interface BatchResponse {
  batchId: number;
  products: ProductResponse[];
}

// Inventory DTO unknown in your message -> keep flexible for now
export type BranchInventoryResponse = any;

@Injectable({ providedIn: 'root' })
export class PharmacistApiService {
  private readonly base = `${environment.apiBaseUrl}/v1/ph`;

  constructor(private http: HttpClient) {}

  viewInventory(storeId: number): Observable<BranchInventoryResponse> {
    return this.http.get<BranchInventoryResponse>(`${this.base}/inventory`);
  }

  createBatch(payload: BatchCreateRequest): Observable<BatchResponse> {
    return this.http.post<BatchResponse>(`${this.base}/batches`, payload);
  }

  dispenseProduct(productId: number, quantity: number): Observable<string> {
    const params = new HttpParams().set('quantity', quantity);
    return this.http.post(`${this.base}/products/${productId}/dispense`, null, {
      params,
      responseType: 'text'
    });
  }
}
