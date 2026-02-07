package com.tcs.ilp.pharmacy.medisync.dto;

import java.util.List;

public class RfqPayloadDto {
    private RfqDto rfq;
    private List<RfqItemDto> items;

    public RfqPayloadDto() {}

    public RfqPayloadDto(RfqDto rfq, List<RfqItemDto> items) {
        this.rfq = rfq;
        this.items = items;
    }

    public RfqDto getRfq() { return rfq; }
    public void setRfq(RfqDto rfq) { this.rfq = rfq; }

    public List<RfqItemDto> getItems() { return items; }
    public void setItems(List<RfqItemDto> items) { this.items = items; }
}