package com.tcs.ilp.pharmacy.medisync.dto;

import java.util.List;

public class BidRequestDto {
    private int vendorId;
    private int rfqId;

    // For create: optional
    // For header update: ignore items
    private List<BidItemDto> items;

    public int getVendorId() { return vendorId; }
    public void setVendorId(int vendorId) { this.vendorId = vendorId; }

    public int getRfqId() { return rfqId; }
    public void setRfqId(int rfqId) { this.rfqId = rfqId; }

    public List<BidItemDto> getItems() { return items; }
    public void setItems(List<BidItemDto> items) { this.items = items; }
}
