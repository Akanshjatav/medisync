// src/app/core/models/rfq.model.ts
export interface RfqDto {
  rfqId?: number;
  createdBy: number;
  statusAward: string;
  submissionDeadline?: string | null;     // 'yyyy-MM-ddTHH:mm:ss'
  expectedDeliveryDate?: string | null;   // 'yyyy-MM-ddTHH:mm:ss'
}

export interface RfqItemDto {
  rfqItemId?: number;
  quantityNeeded: number;

  // ✅ Manual item name stored in backend (rfq_items.rfq_item_name)
  rfqItemName?: string;

  // (Optional) Keep these only if you still use product references elsewhere
  // productId?: number;
  // productName?: string;
}

export interface RfqPayloadDto {
  rfq: RfqDto;
  items: RfqItemDto[];
}