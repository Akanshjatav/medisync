package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_requests")
public class StockRequests {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stockRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Stores store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private Users requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Users approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forwarded_to_vendor_id")
    private Vendor forwardedToVendor;


    // No enums: "PENDING", "APPROVED", "REJECTED", "FULFILLED", "CANCELLED"
    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 500)
    private String remarks;

    @OneToMany(mappedBy = "stockRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockRequestItems> items = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public StockRequests() {}

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

    public Integer getStockRequestId() { return stockRequestId; }
    public void setStockRequestId(Integer stockRequestId) { this.stockRequestId = stockRequestId; }

    public Stores getStore() { return store; }
    public void setStore(Stores storeId) { this.store = storeId; }

    public Users getRequestedBy() { return requestedBy; }
    public void setRequestedBy(Users requestedBy) { this.requestedBy = requestedBy; }

    public Users getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Users approvedBy) { this.approvedBy = approvedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<StockRequestItems> getItems() { return items; }
    public void setItems(List<StockRequestItems> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
