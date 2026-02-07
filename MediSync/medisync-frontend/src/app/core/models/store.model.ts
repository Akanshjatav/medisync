// src/app/core/model/store.ts
export interface Store {
  store_id: number;
  storename: string;
  location: string;
  storeaddress: string;

  // Old fields (not sent by new backend) – keep optional so template doesn't break
  pharmacist_id?: number;
  manager_id?: number;

  // New backend provides createdAt/updatedAt (mapper includes them)
  created_at?: string; // ISO timestamp
  updated_at?: string;

  // Register branch response includes inventoryId
  inventory_id?: number;
}
