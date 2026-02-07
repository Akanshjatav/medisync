package com.tcs.ilp.pharmacy.medisync.dto;

public class VendorLoginResponse {

    private Integer vendorId;
    private String businessName;
    private String status;

    public VendorLoginResponse(Integer vendorId, String businessName, String status) {
        this.vendorId = vendorId;
        this.businessName = businessName;
        this.status = status;
    }

    public Integer getVendorId() { return vendorId; }
    public String getBusinessName() { return businessName; }
    public String getStatus() { return status; }
}
