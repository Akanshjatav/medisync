package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_request_items")
public class StockRequestItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stockRequestItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_request_id", nullable = false)
    private StockRequests stockRequest;

    @Column(nullable = false, length = 250)
    private String medicineName;

    @Column(nullable = false)
    private Integer requiredQuantity;

    public StockRequestItems() {}

    public Integer getStockRequestItemId() { return stockRequestItemId; }
    public void setStockRequestItemId(Integer stockRequestItemId) { this.stockRequestItemId = stockRequestItemId; }

    public StockRequests getStockRequestId() { return stockRequest; }
    public void setStockRequestId(StockRequests stockRequestId) { this.stockRequest = stockRequestId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public Integer getRequiredQuantity() { return requiredQuantity; }
    public void setRequiredQuantity(Integer requiredQuantity) { this.requiredQuantity = requiredQuantity; }
}
