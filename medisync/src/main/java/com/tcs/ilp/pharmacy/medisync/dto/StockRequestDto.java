package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StockRequestDto {

    private Integer stockRequestId;
    private Integer storeId;
    private Integer requestedByUserId;
    private Integer approvedByUserId;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StockRequestItemDto> items;

    public Integer getStockRequestId() {
        return stockRequestId;
    }

    public void setStockRequestId(Integer stockRequestId) {
        this.stockRequestId = stockRequestId;
    }

    public Integer getStoreId() {
        return storeId;
    }

    public void setStoreId(Integer storeId) {
        this.storeId = storeId;
    }

    public Integer getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(Integer requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }

    public Integer getApprovedByUserId() {
        return approvedByUserId;
    }

    public void setApprovedByUserId(Integer approvedByUserId) {
        this.approvedByUserId = approvedByUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<StockRequestItemDto> getItems() {
        return items;
    }

    public void setItems(List<StockRequestItemDto> items) {
        this.items = items;
    }
}
