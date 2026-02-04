package com.tcs.ilp.pharmacy.medisync.dto;

public class RfqItemDto {
    private Integer rfqItemId;

    public String getRfqItemName() {
        return rfqItemName;
    }

    public void setRfqItemName(String rfqItemName) {
        this.rfqItemName = rfqItemName;
    }

    private Integer quantityNeeded;
    private String rfqItemName;


    public Integer getRfqItemId() { return rfqItemId; }
    public void setRfqItemId(Integer rfqItemId) { this.rfqItemId = rfqItemId; }

    public Integer getQuantityNeeded() { return quantityNeeded; }
    public void setQuantityNeeded(Integer quantityNeeded) { this.quantityNeeded = quantityNeeded; }
}