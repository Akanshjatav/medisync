package com.tcs.ilp.pharmacy.medisync.dto;

import java.math.BigDecimal;
import java.util.List;

public class BidDto {

    private Integer bidId;
    private Integer rfqId;
    private Integer vendorId;
    private String vendorName;
    private String status;
    private List<BidItemDto> items;

    public Integer getBidId() { return bidId; }
    public void setBidId(Integer bidId) { this.bidId = bidId; }

    public Integer getRfqId() { return rfqId; }
    public void setRfqId(Integer rfqId) { this.rfqId = rfqId; }

    public Integer getVendorId() { return vendorId; }
    public void setVendorId(Integer vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<BidItemDto> getItems() { return items; }
    public void setItems(List<BidItemDto> items) { this.items = items; }
}
