package com.tcs.ilp.pharmacy.medisync.dto;

public class RfqItemCreateRequest {

    private String medicineName;
    private Integer quantityNeeded;

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
