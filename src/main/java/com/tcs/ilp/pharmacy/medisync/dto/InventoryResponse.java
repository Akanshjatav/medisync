package com.tcs.ilp.pharmacy.medisync.dto;

public class InventoryResponse {
    private Integer inventoryId;
    private Integer batchId;
    private Integer storeId;

    public InventoryResponse() {}

    public InventoryResponse(Integer inventoryId, Integer batchId, Integer storeId) {
        this.inventoryId = inventoryId;
        this.batchId = batchId;
        this.storeId = storeId;
    }

    public Integer getInventoryId() { return inventoryId; }
    public void setInventoryId(Integer inventoryId) { this.inventoryId = inventoryId; }

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }

    public Integer getStoreId() { return storeId; }
    public void setStoreId(Integer storeId) { this.storeId = storeId; }
}