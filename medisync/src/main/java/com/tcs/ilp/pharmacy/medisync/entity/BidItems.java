package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid_items")
public class BidItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bidItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bids bids;

    @Column(nullable = false, length = 250)
    private String medicineName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal itemPrice;

    @Column(nullable = false)
    private Integer itemQuantity;

    private LocalDate deliveryDate;

    private LocalDate offeredExpiryDate;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public BidItems() {}

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getBidItemId() { return bidItemId; }
    public void setBidItemId(Integer bidItemId) { this.bidItemId = bidItemId; }

    public Bids getBids() { return bids; }
    public void setBids(Bids bids) { this.bids = bids; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public BigDecimal getItemPrice() { return itemPrice; }
    public void setItemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; }

    public Integer getItemQuantity() { return itemQuantity; }
    public void setItemQuantity(Integer itemQuantity) { this.itemQuantity = itemQuantity; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public LocalDate getOfferedExpiryDate() { return offeredExpiryDate; }
    public void setOfferedExpiryDate(LocalDate offeredExpiryDate) { this.offeredExpiryDate = offeredExpiryDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
