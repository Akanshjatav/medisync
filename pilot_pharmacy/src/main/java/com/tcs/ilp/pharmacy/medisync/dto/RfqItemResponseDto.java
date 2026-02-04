package com.tcs.ilp.pharmacy.medisync.dto;

public class RfqItemResponseDto {

    private Integer rfqItemId;
    private String medicineName;
    private Integer quantityNeeded;

    public Integer getRfqItemId() {
        return rfqItemId;
    }

    public void setRfqItemId(Integer rfqItemId) {
        this.rfqItemId = rfqItemId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public Integer getQuantityNeeded() {
        return quantityNeeded;
    }

    public void setQuantityNeeded(Integer quantityNeeded) {
        this.quantityNeeded = quantityNeeded;
    }
}
