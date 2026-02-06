// src/app/core/services/store.services.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, tap, of } from 'rxjs';
import { Store } from '../models/store.model';

export interface InventoryRow {
  medicineName: string;
  batchId: string;
  availableQuantity: number;

  productId?: number;
  category?: string;
  price?: number;
  expiryDate?: string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {

  private base = 'http://localhost:7000/api/v1/ho';
  private latencyMs = 1;
  private debug = true;

  constructor(private http: HttpClient) {}

  // --------------------------------------------------
  // Utility Helpers
  // --------------------------------------------------

  private pick<T = any>(obj: any, ...keys: string[]): T | null {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null) return v as T;
    }
    return null;
  }

  private pickStr(obj: any, ...keys: string[]): string {
    const v = this.pick<any>(obj, ...keys);
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    return s.length ? s : '';
  }

  private toNum(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // --------------------------------------------------
  // Mapping Backend StoreResponse → UI Store
  // --------------------------------------------------

  private toStore(row: any): Store {
    return {
      store_id: this.pick<number>(row, 'storeId', 'store_id', 'id') ?? 0,
      storename: this.pickStr(row, 'storeName', 'storename', 'store_name', 'branchName', 'name'),
      location: this.pickStr(row, 'location', 'city', 'place'),
      storeaddress: this.pickStr(row, 'address', 'storeAddress', 'storeaddress', 'store_address'),
      created_at: this.pickStr(row, 'createdAt', 'created_at') || undefined,
      updated_at: this.pickStr(row, 'updatedAt', 'updated_at') || undefined,
      inventory_id: this.pick<number>(row, 'inventoryId', 'inventory_id') ?? undefined,
      pharmacist_id: this.pick<number>(row, 'pharmacistId', 'pharmacist_id') ?? undefined,
      manager_id: this.pick<number>(row, 'managerId', 'manager_id') ?? undefined,
    };
  }

  // --------------------------------------------------
  // GET ALL BRANCHES
  // --------------------------------------------------

  getStores(): Observable<Store[]> {
    return this.http.get<any>(`${this.base}/branches`).pipe(
      tap(res => this.debug && console.log('HO /branches raw:', res)),
      delay(this.latencyMs),
      map(res => {
        const rows: any[] = Array.isArray(res) ? res : (res?.content ?? []);
        const stores = rows.map(r => this.toStore(r));

        return stores.sort((a, b) => {
          const loc = (a.location ?? '').localeCompare(b.location ?? '');
          if (loc !== 0) return loc;
          return (a.storename ?? '').localeCompare(b.storename ?? '');
        });
      })
    );
  }

  // --------------------------------------------------
  // GET SINGLE BRANCH BY ID (FIXED)
  // --------------------------------------------------

  getStoreById(storeId: number): Observable<Store | undefined> {
    if (!storeId || storeId <= 0) return of(undefined);

    return this.http
      .get<any>(`${this.base}/branches/${storeId}`)
      .pipe(
        tap(res => this.debug && console.log('Branch by id raw:', res)),
        delay(this.latencyMs),
        map(res => this.toStore(res))
      );
  }

  // --------------------------------------------------
  // UPDATE BRANCH
  // --------------------------------------------------

  updateStore(storeId: number, payload: any): Observable<Store> {
    return this.http
      .put<any>(`${this.base}/branches/${storeId}`, payload)
      .pipe(
        tap(res => this.debug && console.log('Update store raw:', res)),
        delay(this.latencyMs),
        map(res => this.toStore(res))
      );
  }

  // --------------------------------------------------
  // INVENTORY
  // --------------------------------------------------

  getBranchInventory(storeId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/branches/${storeId}/inventory`).pipe(
      tap(res => this.debug && console.log(`HO inventory store ${storeId} raw:`, res)),
      delay(this.latencyMs)
    );
  }

  mapInventoryRows(res: any): InventoryRow[] {
    const batches: any[] = Array.isArray(res?.batches) ? res.batches : [];
    const out: InventoryRow[] = [];

    for (const b of batches) {
      const batchIdVal = this.pick<any>(b, 'batchId', 'batch_id');
      const products: any[] = Array.isArray(b?.products) ? b.products : [];

      for (const p of products) {
        const medicineName = this.pickStr(p, 'productName', 'product_name', 'medicineName', 'name');

        const batchId =
          this.pickStr(b, 'batchId', 'batch_id') ||
          this.pickStr(p, 'batchId', 'batch_id') ||
          (batchIdVal !== null ? String(batchIdVal) : '');

        const availableQuantity =
          this.toNum(this.pick<any>(
            p,
            'quantityTotal',
            'quantity_total',
            'availableQuantity',
            'quantity',
            'qty'
          ));

        out.push({
          medicineName,
          batchId,
          availableQuantity,
          productId: this.pick<number>(p, 'productId', 'product_id') ?? undefined,
          category: this.pickStr(p, 'category') || undefined,
          price: this.toNum(this.pick<any>(p, 'price')),
          expiryDate: this.pickStr(p, 'expiryDate', 'expiry_date') || undefined
        });
      }
    }

    return out.sort((a, b) => {
      const n = (a.medicineName ?? '').localeCompare(b.medicineName ?? '');
      if (n !== 0) return n;
      return (a.batchId ?? '').localeCompare(b.batchId ?? '');
    });
  }
}
