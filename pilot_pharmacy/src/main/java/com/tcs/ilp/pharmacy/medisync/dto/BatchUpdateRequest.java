package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDate;

public class BatchUpdateRequest {
    private Integer batchNumber;
    private LocalDate deliveryDate;
    private Integer vendorId;

    public Integer getBatchNumber() { return batchNumber; }
    public void setBatchNumber(Integer batchNumber) { this.batchNumber = batchNumber; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public Integer getVendorId() { return vendorId; }
    public void setVendorId(Integer vendorId) { this.vendorId = vendorId; }
}