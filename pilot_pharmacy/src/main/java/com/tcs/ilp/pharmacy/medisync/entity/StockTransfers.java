package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_transfers")
public class StockTransfers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stockTransferId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_store_id", nullable = false)
    private Stores fromStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_store_id", nullable = false)
    private Stores toStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private Users initiatedBy;

    // No enums: "REQUESTED", "APPROVED", "DISPATCHED", "RECEIVED", "CANCELLED"
    @Column(nullable = false, length = 20)
    private String status;

    @OneToMany(mappedBy = "stockTransfer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockTransferItems> items = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public StockTransfers() {}

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getStockTransferId() { return stockTransferId; }
    public void setStockTransferId(Integer stockTransferId) { this.stockTransferId = stockTransferId; }

    public Stores getFromStore() { return fromStore; }
    public void setFromStore(Stores fromStore) { this.fromStore = fromStore; }

    public Stores getToStore() { return toStore; }
    public void setToStore(Stores toStore) { this.toStore = toStore; }

    public Users getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(Users initiatedBy) { this.initiatedBy = initiatedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<StockTransferItems> getItems() { return items; }
    public void setItems(List<StockTransferItems> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
