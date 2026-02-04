
package com.tcs.ilp.pharmacy.medisync.dto;

public class InventoryPatchRequest {
    private Integer batchId;
    private Integer storeId;

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }

    public Integer getStoreId() { return storeId; }
    public void setStoreId(Integer storeId) { this.storeId = storeId; }
}
