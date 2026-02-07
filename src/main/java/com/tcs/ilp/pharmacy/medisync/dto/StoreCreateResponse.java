package com.tcs.ilp.pharmacy.medisync.dto;

public class StoreCreateResponse {

    private Integer storeId;
    private Integer inventoryId;
    private String storeName;
    private String location;
    private String address;

    public StoreCreateResponse() {}

    public StoreCreateResponse(Integer storeId, Integer inventoryId, String storeName,
                               String location, String address) {
        this.storeId = storeId;
        this.inventoryId = inventoryId;
        this.storeName = storeName;
        this.location = location;
        this.address = address;
    }

    public Integer getStoreId() { return storeId; }
    public void setStoreId(Integer storeId) { this.storeId = storeId; }

    public Integer getInventoryId() { return inventoryId; }
    public void setInventoryId(Integer inventoryId) { this.inventoryId = inventoryId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}