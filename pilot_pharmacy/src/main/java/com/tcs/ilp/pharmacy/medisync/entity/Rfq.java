package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rfq")
public class Rfq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rfqId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Stores store;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_vendor_id", nullable = true)
    private Vendor awardedVendor;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_bid_id")
    private Bids awardedBid;



    // No enums: "DRAFT", "ISSUED", "CLOSED", "AWARDED", "CANCELLED"
    @Column(nullable = false, length = 20)
    private String status;

    private LocalDateTime submissionDeadline;
    private LocalDateTime expectedDeliveryDate;

    @Lob
    private String specialInstructions;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "rfq_id", nullable = false)
    private List<RfqItems> items = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Rfq() {}

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

    public Integer getRfqId() { return rfqId; }
    public void setRfqId(Integer rfqId) { this.rfqId = rfqId; }

    public Users getCreatedBy() { return createdBy; }
    public void setCreatedBy(Users createdBy) { this.createdBy = createdBy; }

    public Stores getStore() { return store; }
    public void setStore(Stores store) { this.store = store; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(LocalDateTime submissionDeadline) { this.submissionDeadline = submissionDeadline; }

    public LocalDateTime getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public List<RfqItems> getItems() { return items; }
    public void setItems(List<RfqItems> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
