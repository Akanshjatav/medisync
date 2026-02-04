package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDateTime;

public class StoreResponse {

    private int storeId;
    private String storeName;
    private String location;
    private String address;

    // Optional: include audit fields only if Stores has them
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StoreResponse(int storeId, String storeName, String location, String address,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.location = location;
        this.address = address;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getStoreId() {
        return storeId;
    }

    public String getStoreName() {
        return storeName;
    }

    public String getLocation() {
        return location;
    }

    public String getAddress() {
        return address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}