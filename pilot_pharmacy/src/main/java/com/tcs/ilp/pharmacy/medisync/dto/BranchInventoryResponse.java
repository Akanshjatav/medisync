package com.tcs.ilp.pharmacy.medisync.dto;

import java.util.ArrayList;
import java.util.List;

public class BranchInventoryResponse {

    private Integer storeId;
    private String storeName;
    private Integer inventoryId;

    private List<BatchResponse> batches = new ArrayList<>();

    public BranchInventoryResponse() {}

    public Integer getStoreId() { return storeId; }
    public void setStoreId(Integer storeId) { this.storeId = storeId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public Integer getInventoryId() { return inventoryId; }
    public void setInventoryId(Integer inventoryId) { this.inventoryId = inventoryId; }

    public List<BatchResponse> getBatches() { return batches; }
    public void setBatches(List<BatchResponse> batches) {
        this.batches = (batches == null) ? new ArrayList<>() : batches;
    }
}