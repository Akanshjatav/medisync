export interface BranchInventoryResponse {
  batches: BranchBatch[];
  inventoryId: number;
  storeId: number;
  storeName: string;
}
export interface BranchBatch {
  batchId: number;
  products: BranchProduct[];
}
export interface BranchProduct {
  productId: number;
  productName: string;
  category: string;
  quantityTotal: number;
  price: number;
  expiryDate: string; // ISO yyyy-MM-dd
  batchId: number;
}

/** Flattened row your UI expects per product-batch */
export interface InventoryRow {
  storeId: number;
  storeName: string;
  medicine: string;
  batchId: number;
  batch: string;         // display (we’ll show batchId as string)
  productId: number;
  qty: number;
  expiry: string;        // ISO yyyy-MM-dd
}

/** Your selection + cart */
export interface Selection {
  medicine: string;
  batch: string;
  batchId: number;
  productId: number;
  expiry: string;
  qtyAvailable: number;
}
export interface CartItem extends Selection {
  qty: number;
}
// ---------- Expiry Page Models ----------
export type ExpirySeverity = 'expired' | 'urgent' | 'soon' | 'ok';

export interface ExpiryItem {
  medicine: string;
  stock: number;
  unit: string;        // mapped from backend category or 'Unit'
  expiryDate: string;  // ISO yyyy-MM-dd
  daysLeft: number;    // computed client-side
  severity: ExpirySeverity;
}
