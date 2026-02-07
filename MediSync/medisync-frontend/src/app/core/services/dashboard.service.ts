import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import {
  BranchInventoryResponse,
  StockRequestDto,
  DashboardMetrics,
  ExpiryAlert,
  LowStockItem,
  ProductResponse
} from '../models/headOfficedashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  /**
   * ✅ Base URL is consistent everywhere:
   * - If env.apiBaseUrl = "http://localhost:7000/api" -> baseUrl = "http://localhost:7000/api/v1"
   * - If env.apiBaseUrl = "/api" (proxy/SSR)         -> baseUrl = "/api/v1"
   */
  private readonly baseUrl = `${environment.apiBaseUrl}/v1`;

  private readonly LOW_STOCK_THRESHOLD = 50;
  private readonly EXPIRY_WARNING_DAYS = 30;

  constructor(private http: HttpClient) {}

  // =====================================================
  // API CALLS
  // =====================================================

  /**
   * Pharmacist inventory
   * Backend uses session ctx.storeId(), so no storeId needed here.
   */
  getInventory(): Observable<BranchInventoryResponse> {
    return this.http.get<BranchInventoryResponse>(`${this.baseUrl}/ph/inventory`);
  }

  /**
   * Store manager: pending stock requests
   */
  getPendingStockRequests(): Observable<StockRequestDto[]> {
    const params = new HttpParams().set('status', 'PENDING');

    return this.http
      .get<StockRequestDto[]>(`${this.baseUrl}/sm/stock-requests`, { params })
      .pipe(
        // ✅ Keep dashboard usable even if this secondary call fails
        catchError(() => of([]))
      );
  }

  /**
   * Fetch dashboard data in one call (inventory + pending RFs)
   */
  getDashboardData(): Observable<{
    inventory: BranchInventoryResponse;
    pendingRfs: StockRequestDto[];
    metrics: DashboardMetrics;
    expiryAlerts: ExpiryAlert[];
    lowStockItems: LowStockItem[];
  }> {
    return forkJoin({
      inventory: this.getInventory(),
      pendingRfs: this.getPendingStockRequests()
    }).pipe(
      map(({ inventory, pendingRfs }) => {
        const metrics = this.calculateMetrics(inventory, pendingRfs);
        const expiryAlerts = this.getExpiryAlerts(inventory);
        const lowStockItems = this.getLowStockItems(inventory);

        return { inventory, pendingRfs, metrics, expiryAlerts, lowStockItems };
      })
    );
  }

  // =====================================================
  // DASHBOARD COMPUTATIONS
  // =====================================================

  calculateMetrics(inventory: BranchInventoryResponse, pendingRfs: StockRequestDto[]): DashboardMetrics {
    const allProducts = this.flattenProducts(inventory);

    const lowStockCount = allProducts.filter(p => (p.quantityTotal ?? 0) < this.LOW_STOCK_THRESHOLD).length;

    const expiringCount = allProducts.filter(p => {
      const daysUntilExpiry = this.calculateDaysUntilExpiry(p.expiryDate);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= this.EXPIRY_WARNING_DAYS;
    }).length;

    const totalQuantity = allProducts.reduce((sum, p) => sum + (p.quantityTotal ?? 0), 0);

    return {
      totalProducts: allProducts.length,
      totalQuantity,
      lowStockCount,
      expiringCount,
      pendingRfsCount: pendingRfs.length
    };
  }

  getExpiryAlerts(inventory: BranchInventoryResponse): ExpiryAlert[] {
    const allProducts = this.flattenProducts(inventory);

    return allProducts
      .map(p => {
        const daysUntilExpiry = this.calculateDaysUntilExpiry(p.expiryDate);
        return {
          productId: p.productId,
          productName: p.productName,
          category: p.category,
          quantity: p.quantityTotal ?? 0,
          expiryDate: p.expiryDate,
          daysUntilExpiry,
          batchId: p.batchId
        } as ExpiryAlert;
      })
      .filter(a => a.daysUntilExpiry >= 0 && a.daysUntilExpiry <= this.EXPIRY_WARNING_DAYS)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  getLowStockItems(inventory: BranchInventoryResponse): LowStockItem[] {
    const allProducts = this.flattenProducts(inventory);

    return allProducts
      .filter(p => (p.quantityTotal ?? 0) < this.LOW_STOCK_THRESHOLD)
      .map(p => ({
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        quantity: p.quantityTotal ?? 0,
        batchId: p.batchId
      }))
      .sort((a, b) => a.quantity - b.quantity);
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private flattenProducts(inventory: BranchInventoryResponse): ProductResponse[] {
    const batches = inventory?.batches ?? [];
    const products: ProductResponse[] = [];

    for (const batch of batches) {
      if (batch?.products?.length) {
        products.push(...batch.products);
      }
    }

    return products;
  }

  private calculateDaysUntilExpiry(expiryDateStr: string): number {
    if (!expiryDateStr) return Number.POSITIVE_INFINITY;

    const expiryDate = new Date(expiryDateStr);
    if (isNaN(expiryDate.getTime())) return Number.POSITIVE_INFINITY;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
