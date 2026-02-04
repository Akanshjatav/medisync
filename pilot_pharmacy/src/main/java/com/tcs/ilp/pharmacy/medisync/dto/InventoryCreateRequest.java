
package com.tcs.ilp.pharmacy.medisync.dto;

import jakarta.validation.constraints.NotNull;

public class InventoryCreateRequest {
    @NotNull(message = "batchId is required")
    private Integer batchId;

    @NotNull(message = "storeId is required")
    private Integer storeId;

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }

    public Integer getStoreId() { return storeId; }
    public void setStoreId(Integer storeId) { this.storeId = storeId; }
}
