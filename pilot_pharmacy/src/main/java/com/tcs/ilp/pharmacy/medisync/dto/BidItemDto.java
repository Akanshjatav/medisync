package com.tcs.ilp.pharmacy.medisync.dto;

import java.math.BigDecimal;

public class BidItemDto {
    private BigDecimal itemPrice;
    private int itemQuantity;

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    private String medicineName;

    public BigDecimal getItemPrice() { return itemPrice; }
    public void setItemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; }

    public int getItemQuantity() { return itemQuantity; }
    public void setItemQuantity(int itemQuantity) { this.itemQuantity = itemQuantity; }
}
