package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_transfer_items")
public class StockTransferItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stockTransferItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_transfer_id", nullable = false)
    private StockTransfers stockTransfer;

    @Column(nullable = false, length = 250)
    private String medicineName;

    @Column(nullable = false)
    private Integer quantity;

    public StockTransferItems() {}

    public Integer getStockTransferItemId() { return stockTransferItemId; }
    public void setStockTransferItemId(Integer stockTransferItemId) { this.stockTransferItemId = stockTransferItemId; }

    public StockTransfers getStockTransfer() { return stockTransfer; }
    public void setStockTransfer(StockTransfers stockTransfer) { this.stockTransfer = stockTransfer; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
