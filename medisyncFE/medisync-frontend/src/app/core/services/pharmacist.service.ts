import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BranchInventoryResponse,
  InventoryRow,
  ExpiryItem,
  ExpirySeverity
} from '../models/pharmacy.models';

@Injectable({ providedIn: 'root' })
export class PharmacistService {
  private base = environment.apiBaseUrl; // '/api/v1'

  constructor(private http: HttpClient) {}

  /** Inventory → flattened rows for UI/components that need batches */
  getInventory(storeId: number): Observable<InventoryRow[]> {
    return this.http.get<BranchInventoryResponse>(`${this.base}/v1/ph/inventory`).pipe(
      map(res => {
        const rows: InventoryRow[] = [];
        for (const b of res.batches ?? []) {
          for (const p of b.products ?? []) {
            rows.push({
              storeId: res.storeId,
              storeName: res.storeName,
              medicine: p.productName,
              batchId: b.batchId,
              batch: String(b.batchId), // no batchCode in response; display batchId
              productId: p.productId,
              qty: p.quantityTotal,
              expiry: p.expiryDate
            });
          }
        }
        return rows;
      })
    );
  }

  /** Backend dispense call (used in dispensing page) */
  dispenseProduct(productId: number, quantity: number): Observable<string> {
    const params = new HttpParams().set('quantity', quantity);
    return this.http.post(`${this.base}/v1/ph/products/${productId}/dispense`, null, {
      params,
      responseType: 'text'
    });
  }

  /**
   * Compute expiring items client-side from inventory (≤ cutoffDays).
   * If a dedicated backend endpoint becomes available later, swap the implementation here only.
   */
  getExpiring(storeId: number, cutoffDays = 90): Observable<ExpiryItem[]> {
    return this.getInventory(storeId).pipe(
      map(rows => {
        const today = new Date();
        const out: ExpiryItem[] = [];

        for (const r of rows) {
          const exp = new Date(r.expiry);
          setDateOnly(exp);
          const daysLeft = daysBetween(today, exp);
          if (daysLeft <= cutoffDays) {
            out.push({
              medicine: r.medicine,
              stock: r.qty ?? 0,
              unit: mapUnitFromCategory(r.medicine),      // map to a readable unit
              expiryDate: r.expiry,
              daysLeft,
              severity: computeSeverity(daysLeft)
            });
          }
        }

        // Default sort by earliest expiry
        out.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        return out;
      })
    );
  }
}

/** ---------- helpers (kept local to service) ---------- */
function setDateOnly(d: Date) { d.setHours(0,0,0,0); }

function daysBetween(a: Date, b: Date): number {
  const d1 = new Date(a), d2 = new Date(b);
  setDateOnly(d1); setDateOnly(d2);
  const ms = d2.getTime() - d1.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function computeSeverity(daysLeft: number): ExpirySeverity {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 15) return 'urgent';
  if (daysLeft <= 30) return 'soon';
  return 'ok';
}

/** If backend provides only "category" (Tablet/Capsule/...) we present that as 'unit' */
function mapUnitFromCategory(medicineName: string): string {
  // You can improve this if you later add a field for unit.
  // For now, infer from medicine text or keep generic.
  if (/\bcapsule/i.test(medicineName)) return 'Capsule';
  if (/\btablet/i.test(medicineName))  return 'Tablet';
  return 'Unit';
}




// Mahesh