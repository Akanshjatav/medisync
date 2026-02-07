package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rfq_items")
public class RfqItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rfqItemId;


    @Column(nullable = false, length = 250)
    private String medicineName;

    @Column(nullable = false)
    private Integer quantityNeeded;

    private Integer expiryConstraintDays;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public RfqItems() {}

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getRfqItemId() { return rfqItemId; }
    public void setRfqItemId(Integer rfqItemId) { this.rfqItemId = rfqItemId; }


    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public Integer getQuantityNeeded() { return quantityNeeded; }
    public void setQuantityNeeded(Integer quantityNeeded) { this.quantityNeeded = quantityNeeded; }

    public Integer getExpiryConstraintDays() { return expiryConstraintDays; }
    public void setExpiryConstraintDays(Integer expiryConstraintDays) { this.expiryConstraintDays = expiryConstraintDays; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
