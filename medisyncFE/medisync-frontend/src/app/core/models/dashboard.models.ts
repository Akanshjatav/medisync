// Backend DTOs mapped to TypeScript interfaces

export interface ProductResponse {
  productId: number;
  productName: string;
  category: string;
  quantityTotal: number;
  price: number;
  expiryDate: string; // LocalDate from backend
  batchId: number;
}

export interface BatchResponse {
  batchId: number;
  products: ProductResponse[];
}

export interface BranchInventoryResponse {
  storeId: number;
  storeName: string;
  inventoryId: number;
  batches: BatchResponse[];
}

export interface StockRequestItemDto {
  stockRequestItemId?: number;
  productName: string;
  quantityRequested: number;
  quantityApproved?: number;
}

export interface StockRequestDto {
  stockRequestId: number;
  storeId: number;
  requestedByUserId: number;
  approvedByUserId?: number;
  status: string; // PENDING, APPROVED, REJECTED, FULFILLED
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  items: StockRequestItemDto[];
}

export interface RfqPayloadDto {
  rfqId: number;
  createdBy: number;
  statusAward: string;
  submissionDeadline: string;
  expectedDeliveryDate: string;
}

export interface BidDto {
  bidId: number;
  rfqId: number;
  vendorId: number;
  status: string;
  totalAmount: number;
  submittedAt: string;
}

// Dashboard-specific aggregated models
export interface DashboardMetrics {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number; // products with quantity < threshold
  expiringCount: number; // products expiring within X days
  pendingRfsCount: number;
}

export interface ExpiryAlert {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  batchId: number;
}

export interface LowStockItem {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  batchId: number;
}
