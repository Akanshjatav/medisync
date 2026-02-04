package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bids",
       indexes = {
           @Index(name = "idx_bids_rfq", columnList = "rfq_id"),
           @Index(name = "idx_bids_vendor", columnList = "vendor_id")
       })
public class Bids {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bidId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private Rfq rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    // No enums: "SUBMITTED", "UPDATED", "ACCEPTED", "REJECTED", etc.
    @Column(nullable = false, length = 20)
    private String status;

    @OneToMany(mappedBy = "bids", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BidItems> items = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Bids() {}

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

    public Integer getBidId() { return bidId; }
    public void setBidId(Integer bidId) { this.bidId = bidId; }

    public Rfq getRfq() { return rfq; }
    public void setRfq(Rfq rfq) { this.rfq = rfq; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<BidItems> getItems() { return items; }
    public void setItems(List<BidItems> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
